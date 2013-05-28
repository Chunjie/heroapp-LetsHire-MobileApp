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
        //alert("device ready");
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
    current_user_id: "",
    captures: [],
    current_interview_id: "",
    current_image_uri: "" ,//local,
    db_shell: null
};

var StorageKey = {
    server: "settings-server-key",
    port: "settings-port-key"
};

var DBCONFIG = {
    name: "letshire_db",
    version: "1.0",
    description: "Letshire Client Local Storage",
    size: 1000000,
    schema: [
        {
            name: "captures",
            fields: {
                interview_id: "TEXT",
                image_uri: "TEXT"
            }
        }
    ]
};

G.db_shell = window.openDatabase( DBCONFIG.name, DBCONFIG.version, DBCONFIG.description, DBCONFIG.size );

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

// init the server configuration 
initSettings();

var API = {
    login: apiPrefix("login"),
    logout: apiPrefix("logout"),
    interviews: function(interval){
        return apiPrefix("interviews") + "&interval=" + interval;    
    },
    interview: function(interview_id){
        var domain = localStorage.getItem(StorageKey.server);
        return domain + "/api/v1/interviews/" + interview_id + ".json?auth_token=" + G.auth_token + "&candidate=1";    
    },
    test: apiPrefix("test"),
    uploadPhoto: function(interview_Id){
        var domain = apiPrefix("photo/upload") + "&interview_id=" + interview_Id;
        return domain;
    },
    photoUrl: function(subUrl){
        var domain = localStorage.getItem(StorageKey.server);
        return domain + "/api/v1" + subUrl;
    }
};

function initSettings(){
    if( localStorage.getItem(StorageKey.server) == null ){
        localStorage.setItem(StorageKey.server, "http://letshire-yuan-mobile.cloudfoundry.com");
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
		var res = JSON.parse(jqXHR.responseText);
        alert(res["error"]);
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

// generic database operator


// resume path builder
function build_resume_path(resume_path){
	var server_path = localStorage.getItem(StorageKey.server);
	var token = authPostfix();
	return server_path  + resume_path + token;
}

// Generic File Uploader
function uploadPhoto(imageURI) {
    // show loading to indicate the uploading process
    showLoading();
    
    var options = new FileUploadOptions();
    options.fileKey  = "file";
    options.fileName = imageURI.substr(imageURI.lastIndexOf('/')+1);
    options.mimeType = "image/jpeg";
    Image.filename = options.fileName;
    Image.URI = imageURI;
    var ft = new FileTransfer();
    var action = API.uploadPhoto(G.current_interview_id);
    G.current_image_uri = imageURI;
    ft.upload(imageURI, encodeURI(action), win, fail, options);
}

function refreshPhotos(tx){
    var interviewId = G.current_interview_id;
    var imageUri = G.current_image_uri;
    tx.executeSql('CREATE TABLE IF NOT EXISTS captures (interview_id, image_uri)');
    tx.executeSql('insert into captures (interview_id, image_uri) values ( "'+ interviewId +'","'+ imageUri +'" )')
    //updateDom(imageUri);
}

function updateDom(path){
    var newElement = '<div align="center"><img src="'+ path +'" class="attachment-image" width="100%" height="auto"></div>'
    $("#interview-attachments-gallery").append(newElement);
}

function win(r) {
    console.log("Code = " + r.responseCode);
    console.log("Response = " + r.response);
    console.log("Sent = " + r.bytesSent);
    hideNotification();
    //alert("Upload successfully and the response is "+r.response + "");
    //var photoSubUri = r.response.p_id.p.url;
    G.db_shell.transaction(refreshPhotos, _db_error, _db_success);
}

function _db_error(){
    console.log("db error")	
}

function _db_success(){
    console.log("db success")
}

function fail(error) {
    hideNotification();
    //alert("An error has occurred: Code = " + error.code);
    console.log("upload error source " + error.source);
    console.log("upload error target " + error.target);
}


function capturePhoto(){
    navigator.camera.getPicture(onPhotoURISuccess, onFail, {
        quality: 50,
        destinationType: navigator.camera.DestinationType.FILE_URI,
        sourceType: navigator.camera.PictureSourceType.CAMERA,
        saveToPhotoAlbums: true
    });
}

function getPhoto(){
    navigator.camera.getPicture(onPhotoURISuccess, onFail, {
        quality: 50,
        destinationType: navigator.camera.DestinationType.FILE_URI,
        sourceType: navigator.camera.PictureSourceType.PHOTOLIBRARY,
        saveToPhotoAlbums: true
    });        
}

function onPhotoURISuccess(imageURI){
    alert(imageURI);
    uploadPhoto(imageURI);
}

function onFail(message){
    alert("Failed : " + message);
}

// format the datetime string
function readableTime(interview){
	var d = new Date(interview.scheduled_at);
	var date_string = d.toDateString();
	var time_string = d.toLocaleTimeString();
	return time_string + " @ " + date_string;
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
$("#settings-save-button").on("click", function(e){
    var serverDomain = $("input#settings-server").val();
    var serverPort = $("input#settings-port").val();
    showLoading();
    $.ajax({
        type: "GET",
        url: serverDomain + "/api/v1/test"
    }).done(function(response){
        hideNotification();
        saveSettings();
        Lungo.Router.section("main");
    }).fail(function(jqXHR, status){
        hideNotification();
        errorAlert(jqXHR, status)
    });
});

function letshireCtrl($scope){
    
    // the interviews will be showed on the interviews page
    $scope.interviews = [];
    
    // the specific interview details that will be showed on the interview page
    $scope.interview = {};
    $scope.candidate = {};
    $scope.opening = {};
    $scope.resume = {};
    // the attachments to one specific interview
    $scope.attachments = [];
    
	$scope.goodlookingTime = function(interview){
		return readableTime(interview);
	};
	
    // login
    $scope.userLogin = function(){
        var username = $("input#main-username").val();
        var password = $("input#main-password").val();
        var formData = {"user" : { "email": username, "password": password }}
        
        showLoading("Signing in ...");
        
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
            // loading
            $scope.interviewsIn("1d");
        }).fail(function(jqXHR, status){
            hideNotification();
            errorAlert(jqXHR, status);
        });
    }
    
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
        Lungo.View.Aside.hide("#user-options");
        $scope.interviewsIn("1d");  
    };
    
    $scope.interviewsThisWeek = function(){
        Lungo.View.Aside.hide("#user-options");
        $scope.interviewsIn("1w");  
    };
    
    $scope.interviewsThisMonth = function(){
        Lungo.View.Aside.hide("#user-options");
        $scope.interviewsIn("1m");
    };
    
    // get interviews in one 'interval', interval = {'1d', '1w', '1m'}
    $scope.interviewsIn = function(interval){
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
    
    $scope._queryOk = function(tx, results){
        console.log("returned rows = " + results.rows.length);
        $scope.attachments = [];
        for( var i=0; i < results.rows.length; i++){
            attachmentElement = {
                interview_id : results.rows.item(i).interview_id,
                image_uri: results.rows.item(i).image_uri
            };
            $scope.attachments.push(attachmentElement);
        }
        $scope.$apply();
    }
    
    $scope._queryAll = function(tx){
        tx.executeSql('CREATE TABLE IF NOT EXISTS captures (interview_id, image_uri)');
        tx.executeSql('select * from captures where interview_id = "' + G.current_interview_id + '"', [], $scope._queryOk, _db_error);
    }
    
    $scope._refreshAttachments = function(interviewId){
        console.log("refresh attachment interview id is " + interviewId );
        G.db_shell.transaction($scope._queryAll, _db_error);
    }
    
    // get specific interview details
    $scope.interviewDetail = function(interviewId){
        console.log("interview id is " + interviewId);
        showLoading();
        $.ajax({
            url: API.interview(interviewId),
            type: "GET"
        }).done(function(response){
            $scope.interview = response["interview"];
			$scope.interview.readableTime = readableTime($scope.interview);
            $scope.candidate = response["candidate"];
            $scope.opening = response["opening"];
            $scope.resume = response["resume"];
            G.current_interview_id = interviewId;
            $scope._refreshAttachments(interviewId);
            $scope.$apply();
            hideNotification();
        }).fail(function(jqXHR, status){
            hideNotification();
            errorAlert(jqXHR, status); 
        });
        Lungo.Router.section("interview");
    };
    
    // start, stop the specific interview
    $scope.changeInterviewStatus = function(interviewId){
        var new_status = nextStatus($scope.interview.status);
        var form_data = {"interview" : { "status" : new_status }}
        showLoading();
        $.ajax({
            url: API.interview(interviewId),
            type: "PUT",
            dataType: "json",
            processData: false,
            contentType: "application/json",
            data: JSON.stringify(form_data)
        }).done(function(response){
        	$scope.interview.status = new_status;
            //$scope.interview = response["interview"];
			//$scope.interview.readableTime = readableTime($scope.interview);
            //$scope.candidate = response["candidate"];
            //$scope.opening = response["opening"];
            //$scope.resume = response["resume"];
            $scope.$apply();
            hideNotification();
        }).fail(function(jqXHR, status){
            hideNotification();
            errorAlert(jqXHR, status);
        })
    };
    
	$scope.switchToFeedback = function(){
		Lungo.Router.section("feedback");
		var feedbackInfo = $scope.interview.assessment;
		$("#feedback-textarea").val(feedbackInfo);
	};
	
	$scope.feedbackUpdate = function(interviewId){
		var feedbackText = $("#feedback-textarea").val();
		var form_data = {"interview" : { "assessment" : feedbackText }}
		showLoading();
		$.ajax({
            url: API.interview(interviewId),
            type: "PUT",
            dataType: "json",
            processData: false,
            contentType: "application/json",
            data: JSON.stringify(form_data)
        }).done(function(response){
            $scope.interview.assessment = feedbackText;
        	//$scope.interview = response["interview"];
			//$scope.interview.readableTime = readableTime($scope.interview);
            //$scope.candidate = response["candidate"];
            //$scope.opening = response["opening"];
            //$scope.resume = response["resume"];
            $scope.$apply();
            hideNotification();
        }).fail(function(jqXHR, status){
            hideNotification();
            errorAlert(jqXHR, status);
        })
	};
	
	// fetch the candidate's resume
	
	$scope.downloadResume = function(){
		if($scope.resume.path == ''){
			alert('This candidate has not uploaded one resume!');
		}else{
			var url = build_resume_path($scope.resume.path);
			//alert(url);
			navigator.app.loadUrl(url, {openExternal: true});
		}
	}
	
	// some navigator
	
	$scope.feedbackBack = function(){
		Lungo.Router.section("interview");
	};
	
	$scope.interviewBack = function(){
		Lungo.Router.section("interviews");
	};
	
	$scope.settingsBack = function(){
		Lungo.Router.section("main");
	};
	
	$scope.aboutBack = function(){
		Lungo.Router.section("interviews");
	}
	
    // attach photo callback
    $scope.attachInterviewPhoto = function(){
        capturePhoto();
    };
    
    // attach audio callback
    $scope.attachInterviewAudio = function(){
        alert("Not implemented yet");  
    };
}

