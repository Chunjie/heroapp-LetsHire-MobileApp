/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
var app = {
    // Application Constructor
    initialize: function() {
        this.bindEvents();
    },
    // Bind Event Listeners
    //
    // Bind any events that are required on startup. Common events are:
    // 'load', 'deviceready', 'offline', and 'online'.
    bindEvents: function() {
        document.addEventListener('deviceready', this.onDeviceReady, false);
    },
    // deviceready Event Handler
    //
    // The scope of 'this' is the event. In order to call the 'receivedEvent'
    // function, we must explicity call 'app.receivedEvent(...);'
    onDeviceReady: function() {
        app.receivedEvent('deviceready');
    },
    // Update DOM on a Received Event
    receivedEvent: function(id) {
    	alert("device ready");
    }
};

app.initialize();

Lungo.init({
    name: "LetsHire"
});

// **************************************
// Global Variables and Helpers
// **************************************

var G = {
    username: "",
    auth_token: "",
    current_user_id: ""
};

var StorageKey = {
    server: "settings-server-key",
    port: "settings-port-key"
};

initSettings();

var E = {
    timeout: "Time out",
    abort: "Abort",
    no_network: "Not connect, verify your network",
    not_found: "Requested Resource Not Found",
    parse: "JSON parser error",
    unknown: "Unknown Error",
    internal: {
        login: "Log in failed ... "
    }
}

var STATUS = {
    scheduled: "scheduled",
    started: "started",
    finished: "finished"
};

var API = {
    login: apiPrefix("login"),
    logout: apiPrefix("logout"),
    interviews: function(interval){
        return apiPrefix("interviews") + "&interval=" + interval;    
    },
    interview: function(interview_id){
        var domain = localStorage.getItem(StorageKey.server);
        return domain + "/api/v1/interviews/" + interview_id + ".json?auth_token=" + G.auth_token;    
    },
    test: apiPrefix("test"),
    uploadPhoto: apiPrefix("photo/upload")
};

function initSettings(){
    if( localStorage.getItem(StorageKey.server) == null ){
        localStorage.setItem(StorageKey.server, "http://letshire-dev-yuan.cloudfoundry.com");
        localStorage.setItem(StorageKey.port, "80");
    }
}

function apiPrefix( action ){
    var domain = localStorage.getItem(StorageKey.server);
    return domain + "/api/v1/" + action + ".json?auth_token=" + G.auth_token;
};

function authPostfix(){
    return "?auth_token=" + G.auth_token;
};

function errorAlert(jqXHR, status, error_info){
    if( jqXHR.status === 0 ){
        alert(E.no_network);
    }else if( jqXHR.status == 404 ){
        alert(E.not_found);
    }else if( jqXHR.status == 500 ){
        alert(error_info);
    }else if( status === "parsererror" ){
        alert(E.parse);
    }else if( status === "abort" ){
        alert(E.abort);
    }else {
        alert(E.unknown + " : " + jqXHR.responseText);
    }
}

function saveSettings(){
    localStorage.setItem(StorageKey.server, $("input#settings-server").val());
    localStorage.setItem(StorageKey.port, $("input#settings-port").val());
}

function nextStatus(status){
    var next_status = "";
    if( status == STATUS.scheduled ){
        next_status = STATUS.started;
    }else if( status == STATUS.started ){
        next_status = STATUS.finished;
    }else if( status == STATUS.finished ){
        next_status = STATUS.finished;
    }else{
        next_status = STATUS.finished;
    }
    return next_status;
}

function showLoading(message){
    Lungo.Notification.show();
}

function hideNotification(){
    Lungo.Notification.hide();
}

// Generic File Uploader
function uploadPhoto(imageURI) {
    var options = new FileUploadOptions();
    options.fileKey  = "file";
    options.fileName = imageURI.substr(imageURI.lastIndexOf('/')+1);
    options.mimeType = "image/jpeg";
    Image.filename = options.fileName;
    Image.URI = imageURI;
    var ft = new FileTransfer();
    var action = api_url(A.photo.upload);
    ft.upload(imageURI, encodeURI(action), win, fail, options);
}

function win(r) {
    console.log("Code = " + r.responseCode);
    console.log("Response = " + r.response);
    console.log("Sent = " + r.bytesSent);
    stopThrobber();
    alert("Upload successfully and the response is "+r.response + "");
    refreshPhotos();
}

function fail(error) {
    stopThrobber();
    alert("An error has occurred: Code = " + error.code);
    console.log("upload error source " + error.source);
    console.log("upload error target " + error.target);
}


function capturePhoto(){
    navigator.camera.getPicture(onPhotoURISuccess, onFail, {
        quality: 50,
        destinationType: navigator.camera.DestinationType.FILE_URI,
        sourceType: Camera.PictureSourceType.CAMERA,
        saveToPhotoAlbums: true
    });
}

function getPhoto(){
    navigator.camera.getPicture(onPhotoURISuccess, onFail, {
        quality: 50,
        destinationType: navigator.camera.DestinationType.FILE_URI,
        sourceType: Camera.PictureSourceType.PHOTOLIBRARY,
        saveToPhotoAlbums: true
    });        
}

function onPhotoURISuccess(imageURI){
    uploadPhoto(imageURI);
}

function onFail(message){
    alert("Failed : " + message);
}

// **************************************
// LetsHire Event Handler
// **************************************

Lungo.dom("#settings").on("load", function(event){
    $("input#settings-server").val( localStorage.getItem(StorageKey.server) );
    $("input#settings-port").val( localStorage.getItem(StorageKey.port) );
});


var pullInterviewsList = new Lungo.Element.Pull("#interviews-article",{
	onPull: "Pull down to refresh.",
	onRelease: "Release to get new data",
	onRefresh: "Refreshing...",
	callback: function(){
		//TODO: to refresh the data
		pullInterviewsList.hide();
	}
});

// settings
// TODO: checking animation
$("#settings-save-button").on("click", function(e){
    var serverDomain = $("input#settings-server").val();
    var serverPort = $("input#settings-port").val();
    $.ajax({
        type: "GET",
        url: serverDomain + "/api/v1/test"
    }).done(function(response){
        saveSettings();
        Lungo.Router.section("main");
    }).fail(function(jqXHR, status){
        errorAlert(jqXHR, status)
    });
});

// login
$("#main-login-button").on("click", function(e){
    var username = $("input#main-username").val();
    var password = $("input#main-password").val();
    var formData = {"user" : { "email": username, "password": password }}
    
    showLoading("Signing in ...")
    
    $.ajax({
        type: "POST",
        url: API.login,
        dataType: "json",
        processData: false,
        data: JSON.stringify(formData),
        contentType: "application/json"
    }).done(function(response){
        hideNotification();
        // store session info
        G.auth_token = response["session"]["auth_token"];
        G.username = username;
        G.current_user_id = response["user_id"];
        // update some info ui
        $("#interviews-username").text(G.username);
        // navigate
        Lungo.Router.section("interviews");
    }).fail(function(jqXHR, status){
        hideNotification();
        errorAlert(jqXHR, status);
    });
});

function letshireCtrl($scope){
    
    // the interviews will be showed on the interviews page
    $scope.interviews = [];
    
    // the specific interview details that will be showed on the interview page
    $scope.interview = {};
    
    // login
    // TODO:
    
    // logout
    $scope.letshireLogout = function(){
        Lungo.View.Aside.hide("#user-options");
        $.ajax({
            type: "GET",
            url: API.logout       
        }).always(function(e){
            G.current_user_id = "",
            G.username = "",
            Lungo.Router.section("main"),
            G.auth_token = ""
        });   
    };
    
    // three entries to trigger the interviews updated.
    $scope.interviewsToday = function(){
        $scope.interviewsIn("1d");  
    };
    
    $scope.interviewsThisWeek = function(){
        $scope.interviewsIn("1w");  
    };
    
    $scope.interviewsThisMonth = function(){
        $scope.interviewsIn("1m");
    };
    
    // get interviews in one 'interval', interval = {'1d', '1w', '1m'}
    $scope.interviewsIn = function(interval){
        Lungo.View.Aside.hide("#user-options");
        showLoading("");
        $.ajax({
           url: API.interviews(interval),
           type: "GET"
        }).done(function(response){
            $scope.interviews = response["interviews"];
            $scope.$apply();
            hideNotification();
        }).fail(function(jqXHR, status){
            hideNotification();
            errorAlert(jqXHR, status);    
        });
    };
    
    // get specific interview details
    $scope.interviewDetail = function(interviewId){
        console.log("interview id is " + interviewId);
        showLoading();
        $.ajax({
            url: API.interview(interviewId),
            type: "GET"
        }).done(function(response){
            $scope.interview = response["interview"];
            $scope.$apply();
            hideNotification();
        }).fail(function(jqXHR, status){
            hideNotification();
            errorAlert(jqXHR, status); 
        });
        Lungo.Router.section("interview");
    };
    
    // start, stop the specific interview
    $scope.changeInterviewStatus = function(){
        var new_status = nextStatus($scope.interview.status);
        alert(new_status);
    };
    
    // attach photo callback
    $scope.attachInterviewPhoto = function(){
       capturePhoto();
    };
    
    // attach audio callback
    $scope.attachInterviewAudio = function(){
        alert("Not implemented yet");  
    };
}

