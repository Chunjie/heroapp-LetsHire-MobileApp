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

var G = {
    current_user: "",
}

$(document).on( "pageshow", "#settings", function(e) {
	$('#setting-save').on('click', function(e) {
	    e.preventDefault();
	    $("#connect_status").text("Check connectability ...").show();
	    console.log("here");
	    $.getJSON(full_url("heartbeats"), {
		format: "json"
	    })
	    .done(function(data) {
		if ( data['ret'] == 'ok'){
		    window.localStorage.setItem("domain", $('#domain').val() );
		    window.localStorage.setItem("port", $('#port').val() );    
		    $.mobile.changePage( "index.html", { transition: "slide" });
		    $("#connect_status").hide();
		}
	    })
	});
});

$(document).on( "pageshow", "#index", function(e) {

	$('#user-login-form').on('submit', function(e) {
		var $this = $(this);
		e.preventDefault();
		username = $("input#username").val();
		password = $("input#password").val();
		form_data = {"user": {"email": username, "password": password}};
		$.ajax({
		    type: "POST",
		    dataType: "jsonp",
		    data: form_data,
		    url: full_url('users/sign_in'),
		    success: function(data){
			$.mobile.navigate("#interviews")   
		    }
		}); 
	});
});

$(document).on( "pageshow", "#interview", function(e) {
	$('#interview-action').click(function(){
		$('#status').text("Started");
		$(this).find(".ui-btn-text").text("Finish")
	});
	
	$(".interviewNoteItem").on("taphold", function(e){
	    $("#interviewNoteMenu").popup("open");    
	});
	
	$(".attachPhotoAction").click(function(){
	navigator.camera.getPicture(uploadPhoto,
	    function(message) { alert('get picture failed'); },
	    { quality: 50, 
	    destinationType: navigator.camera.DestinationType.FILE_URI,
	    sourceType: Camera.PictureSourceType.CAMERA,
	    saveToPhotoAlbum: true }
	);
    });
});

$(document).on( "pageshow", "#feedback", function(e) {
    
});

$(document).on( "pageshow", "#candidate", function(e) {
    
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
    ret = "http://127.0.0.1:3000/" + path + ".js?callback=?"  ;
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