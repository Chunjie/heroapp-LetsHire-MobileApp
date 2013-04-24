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
    	console.log("device ready");
    }
};

app.initialize();

// GLOBAL VARIABLE
var G = {
    current_user: "",
	auth_token: "",
	user: null,
	current_interview_id: "",
	username: ""
}

// CONFIGURATION
var C = {
	api_prefix: "http://letshire-dev-yuan.cloudfoundry.com/api/v1/"
}

// ACTION PATH MAPPINGS
var A = {
	log_in: "login",
	log_out: "logout",
	interviews: "interviews",
	interview: "interview",
	
	photo: {
		upload: "photo/upload",
		download: "photo/download"
	},
	
	test_connect: "test"
}

// Error Messages
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

var Image = {
	URI: "",
	filename: ""
}

// API URL BUILDER
function api_url( path ){
	var ret = C.api_prefix + path + ".json?auth_token=" + G.auth_token;  
	return ret;
}

// this method should be called in each error handler if you want to popup
// something.
function error_alert(jqXHR, status, error_info){
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

// Index page: login
$(document).on( "pageshow", "#index", function(e) {
	$("#log-in-button").on("click", function(e){
		e.preventDefault();
		$("#-login-status").text(" Connecting ... ").show();
		var username = $("input#username").val();
		var password = $("input#password").val();
		var form_data = {"user":{"email":username, "password":password}};
		
		$.ajax({
			dataType: "json",
			url: api_url(A.log_in),
			processData: false,
			contentType: "application/json",
			data: JSON.stringify(form_data),
			type: "POST",
			success: function(response_data){
				$("#user-login-status").hide();
				G.auth_token = response_data['session']['auth_token'];
				G.current_user = response_data['user_id'];
				G.username = username;
				$("#interviews-user .ui-btn-text").text(G.username);
				$.mobile.changePage("index.html#interviews");
			},
			error: function(jqXHR, status){
				$("#user-login-status").hide();
				error_alert(jqXHR, status, E.internal.login);
			}
		});
	});	
});

// Settings page: configuration of server
$(document).on( "pageshow", "#settings", function(e) {
	// checking whether the server that domain and port pair indicate be reached 
	$("#settings-save").on("click", function(e){
		$("#connectability").text("Checking connectability ... ").show();
		$.ajax({
			type: "GET",
			url: api_url(A.test_connect)
		}).done(function(response){
			$("#connectability").text("Connect successfully :D").hide();
			$.mobile.changePage("index.html");
		}).fail(function(jqXHR, status){
			$("#connectability").hide();
			error_alert(jqXHR, status);
		});
	});
});

// Interviews List page: entry
$(document).on("pageshow", "#interviews", function(e){
	
	$("#interviews-user .ui-btn-text").text(G.username);
	
	//$("#interviews-today").trigger("click");
	
	// when user log out, the auth_token will be erased from app.
	$("#user-log-out").on("click", function(e){
		$.ajax({
			type: "GET",
			url: api_url(A.log_out),
		}).always(function(e){
			G.auth_token = "";
			G.user_id = "";
			jQuery.mobile.changePage("index.html");
		});
	});
});

$(document).on("pageshow", "#interview", function(e){
	$("#interview-back").on("click", function(e){
		$.mobile.changePage("#interviews");	
	});
	
	$("#interview-attach-audio").on("click", function(e){
		alert("Not supported for current version.");	
	});
	
	$("#selector-camera").on("click", function(e){
		$("#photo-source-selector").popup("close");
		capturePhoto();
	});
	
	$("#selector-gallery").on("click", function(e){
		$("#photo-source-selector").popup("close");
		getPhoto();
	});
	
});

$(document).on("pageshow", "#feedback", function(e){
	$("#feedback-save").on("click", function(e){
		var feedback_content = $("#feedback-content").val();
		$.ajax({
			// TODO:
		});
	});
});

// capture photo from camera
function capturePhoto(){
	navigator.camera.getPicture(onPhotoURISuccess, onFail, {
		quality: 50,
		destinationType: navigator.camera.DestinationType.FILE_URI,
		sourceType: Camera.PictureSourceType.CAMERA,
		saveToPhotoAlbum: true
	});	
};

function onPhotoURISuccess(imageURI){
	alert("The URI is : "+ imageURI);
	$.mobile.changePage("#throbber-dialog", { role: "dialog"});
	uploadPhoto(imageURI);
}

function onFail(message){
	alert("Failed : "+message);
}

// capture photo from gallery
function getPhoto(){
	navigator.camera.getPicture(onPhotoURISuccess, onFail, {
		quality: 50,
		destinationType: navigator.camera.DestinationType.FILE_URI,
		sourceType: Camera.PictureSourceType.PHOTOLIBRARY,
	});	
};

function UpdateListView(selector){
	$(selector).listview("refresh");
};

function requestLatestInterviews(interval){
	$.ajax({
		type: "GET",
		url: api_url(A.interviews) + "&interval=" + interval
	}).done(function(response){
		return response["interviews"];
	}).fail(function(jqXHR, status){
		error_alert(jqXHR, status);
	});
};

// agularjs controllers 
function InterviewsCtrl($scope){
	$scope.interviews = [
		{id:0, title: "Sr. MTS", locaiton: "Room 203", status: "Not Started", scheduled_at: "2013-04-23 14:30"},
		{id:1, title: "MTS", locaiton: "Room 203", status: "Not Started", scheduled_at: "2013-04-23 15:30"},
		{id:2, title: "Sr. MTS", locaiton: "Room 203", status: "Not Started", scheduled_at: "2013-04-24 14:30"},
	];
	
	$scope.todayInterviews = function(){
		$scope.interviews = requestLatestInterviews("1d");
		$scope.$apply();
		UpdateListView("#interviews-list");
	};
	
	$scope.weekInterviews = function(){
		$scope.interviews = requestLatestInterviews("1w");
		$scope.$apply();
		UpdateListView("#interviews-list");
	};
	
	$scope.monthInterviews = function(){
		$scope.interviews = requestLatestInterviews("1m");
		$scope.$apply();
		UpdateListView("#interviews-list");
	};
		
	$scope.interviewDetail = function(interview_id){
		// todo: 
		console.log("interview id is : "+ interview_id);
		jQuery.mobile.changePage("#interview");
	};	
};

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

// hide the uploading indicator
function stopThrobber(){
	$("#throbber-dialog").dialog("close");
}


// update the photos gallery
function refreshPhotos(){
	var photoElement = '<a href="#'+ Image.filename+'" data-rel="popup" data-position-to="window" data-transition="fade"><img class="popphoto" src="' + Image.URI +'" alt="' + Image.filename + '" style="width:30%"></a>' + 
	'<div data-role="popup" id="' + Image.filename + '" data-overlay-theme="a" data-theme="d" data-corners="false">' +
		'<a href="#" data-rel="back" data-role="button" data-theme="a" data-icon="delete" data-iconpos="notext" class="ui-btn-right">Close</a><img class="popphoto" src="' + Image.URI + '" style="max-height:512px;" alt="' + Image.filename + '">' +
	'</div>';
	$("#interview-attachment-details").append(photoElement).trigger('create');
}