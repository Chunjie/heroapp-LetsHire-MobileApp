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

$('#settings-form').on('submit', function(e) {
	e.preventDefault();
	window.localStorage.setItem("domain", $('#domain').val() );
	window.localStorage.setItem("port", $('#port').val() );
	$.mobile.changePage( "index.html", { transition: "slide" });
});

$('#index').live( "pageshow", function(e) {
	var action = "http://" + window.localStorage.getItem("domain") + ":" + window.localStorage.getItem("port") + "/login";
	$('#user-login-form').on('submit', function(e) {
		var $this = $(this);
		e.preventDefault();
		$.post(action, $this.serialize(), function (responseData) {
			if( responseData == "ok") {
				console.log("login ok!");
				$.mobile.changePage( "interviews.html", { transition: "slide" });
			} else {
				$.mobile.showPageLoadingMsg("e", "Wrong password.", true);
			}
		});
	});
});

$('#interview').live( "pageshow", function(e) {
	$('#interview-action').click(function(){
		$('#status').text("Started");
		$(this).find(".ui-btn-text").text("Finish")
	});
	
	$('[type="submit"]').click(function(){
		// Retrieve image file location from camera and save to album
        navigator.camera.getPicture(uploadPhoto,
                                    function(message) { alert('get picture failed'); },
                                    { quality: 50, 
                                    destinationType: navigator.camera.DestinationType.FILE_URI,
                                    sourceType: Camera.PictureSourceType.CAMERA,
                                    saveToPhotoAlbum: true }
                                    );
	});
});

$("#notes").live("pageshow", function(e) {
    $(".note-item").on("taphold", function(e){
	e.stopPropagation();
	$("#noteItemMenu").popup("open");	
    });    
});

$("#note").live("pageshow", function(e) {
    $(".attachment-item").on("taphold", function(e){
	e.stopPropagation();
	$("#attachmentItemMenu").popup("open");
    }); 
});

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