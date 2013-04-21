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
	auth_token: ""
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
	
	test_connect: "test"
}

// Error Messages
var E = {
	login: "Error logging in !"
}

// API URL BUILDER
function api_url( path ){
	var ret = CONFIG.api_prefix + path + ".json";  
	return ret;
}

// Index page: login
$(document).on( "pageshow", "#index", function(e) {
	$("log-in-button").on("click", function(e){
		e.preventDefault();
		$("user-login-status").text(" Connecting ... ").show();
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
				user_id = response_data;
				// TODO: do something for logged in user
				$.mobile.change("interviews.html");
			},
			error: function(){
				$("#user-login-status").hide();
				alert(E.login)
			}
		});
	});	
});

$(document).on( "pageshow", "#settings", function(e) {
	$("#settings-save").on("click", function(e){
		$("#connectablity").text("Checking connectability ... ").show();
		$.ajax({
			type: "GET",
			url: api_url(A.test_connect),
			success: function(responseData){
				// TODO: do something 	
			}
		});
	});
});

$(document).on("pageshow", "#interviews", function(e){
	$("#user-log-out").on("click", function(e){
		// TODO:
	});
	
	$(".interviews-interval").on("click", function(e){
		// TODO:
	});
	
	$("#interviews-to-current").on("click", function(e){
		// TODO:
	});
	
	$("#interviews-refresh").on("click", function(e){
		// TODO:
	});
});

$(document).on("pageshow", "#interview", function(e){
	// TODO:
});

$(document).on("pageshow", "#feedback", function(e){
	$("#feedback-save").on("click", function(e){
		var feedback_content = $("#feedback-content").val();
		$.ajax({
			// TODO:
		});
	});
});


function uploadPhoto(imageURI) {
    var options = new FileUploadOptions();
    options.fileKey="myfile";
    options.fileName=imageURI.substr(imageURI.lastIndexOf('/')+1);
    options.mimeType="image/jpeg";

    var params = {};
    params.value1 = "test";
    params.value2 = "param";

    options.params = params;

    var ft = new FileTransfer();
    var action = "http://" + window.localStorage.getItem("domain") + ":" + window.localStorage.getItem("port") + "/upload";
    ft.upload(imageURI, encodeURI(action), win, fail, options);
}

function full_url( path ) {
    ret = "http://letshire-dev-yuan.cloudfoundry.com/" + path + ".json"  ;
    return ret;
}

function win(r) {
    console.log("Code = " + r.responseCode);
    console.log("Response = " + r.response);
    console.log("Sent = " + r.bytesSent);
    var imgPath = "http://" + window.localStorage.getItem("domain") + ":" + window.localStorage.getItem("port") + "/images/";
    $('#photo').text(imgPath + r.response);
}

function fail(error) {
    alert("An error has occurred: Code = " + error.code);
    console.log("upload error source " + error.source);
    console.log("upload error target " + error.target);
}