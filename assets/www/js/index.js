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

$('#settings-form').live('submit', function(e) {
	//var $this = $(this);
	
	//prevent the default submission of the form
	e.preventDefault();
	
	window.localStorage.setItem(　"domain", $('#domain').val());
	window.localStorage.setItem(　"port", $('#port').val());
	$.mobile.changePage( "login.html", { transition: "slide" });
});

$('#user-login').live( "pageshow", function(e) {
	//alert("pageshow");  
	//alert(window.localStorage.getItem("domain"));
	//alert(window.localStorage.getItem("port"));
	var action = "http://" + window.localStorage.getItem("domain") + ":" + window.localStorage.getItem("port") + "/login";
	$('#user-login-form').live('submit', function(e) {
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

$('#interview').live( "pagebeforeshow", function(e) {
	$('#done').hide();
	$('[type="submit"]').button('disable');
});

$('#interview').live( "pageshow", function(e) {
	$('#start').click(function(){
		$(this).hide();
		$('#status').text("Started");
		$('[type="submit"]').button('enable');
		$('#done').show();
	});
	$('#done').click(function(){
		$(this).hide();
		$('#status').text("Done");
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

function win(r) {
    console.log("Code = " + r.responseCode);
    console.log("Response = " + r.response);
    console.log("Sent = " + r.bytesSent);
    $('#photo').text(r.response);
}

function fail(error) {
    alert("An error has occurred: Code = " + error.code);
    console.log("upload error source " + error.source);
    console.log("upload error target " + error.target);
}