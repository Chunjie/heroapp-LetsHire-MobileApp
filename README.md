#heroapp: LetsHire MobileApp

###PhoneGap
1. Getting Started with Android  
     http://docs.phonegap.com/en/2.5.0/guide_gettingstarted_android_index.md.html#Getting%20Started%20with%20Android
2. Config Emulator
	install image from 'Android SDK manager'
	* Intel x86 Atom System Image
	* Intel x86 Emulator Accelerator
	
3. 	Eclipse plugin
	* WTP for web develper
	* jsdt-jquery : https://svn.codespot.com/a/eclipselabs.org/jsdt-jquery/updatesite
4. 	AIP document:   
	http://docs.phonegap.com/en/2.5.0/index.html
5. 	Wiki  
	https://github.com/phonegap/phonegap/wiki

###JQuery Mobile (deprecated)
1. Quick start guide  
	http://jquerymobile.com/demos/1.2.1/docs/about/getting-started.html
2. Themes:
	*  Android: https://github.com/jjoe64/jquery-mobile-android-theme
	*  IOS: https://github.com/taitems/iOS-Inspired-jQuery-Mobile-Theme
3. Very useful guide to understand JQuery Mobile  
	http://stackoverflow.com/questions/14468659/jquery-mobile-document-ready-vs-page-events/14469041#14469041
4. More documents  
	http://jquerymobile.com/demos/1.2.1/

###Lungo.js
We use [Lungo.js](http://lungo.tapquo.com/) as the main UI library, refer to this [introduction](http://lungo.tapquo.com/howto/prototype/)

###Angular.js
[Angular.js](http://angularjs.org/) is used as our data manipulator.

###How to debug
1. use chrome developer tools to debug the basic feature without phonegap native api.
2. use [Ripple](https://chrome.google.com/webstore/detail/ripple-emulator-beta/geelfhphabnejjhdalkjhgipohgpdnoc?hl=en) emulator
3. use [weinre](http://people.apache.org/~pmuellr/weinre/docs/latest/Home.html) to remote debug it

refer to this [intro](https://github.com/phonegap/phonegap/wiki/Debugging-in-PhoneGap) to get your hammer

###Debug on Android phone
1. Launch Eclipse to open this project.
2. Make sure USB debugging is enabled on your device and plug it into your system. Information can be found on the [Android Developer Site](http://developer.android.com/tools/device.html).
3. Right click the project and go to **Run As > Android Application**.

###Architecture Overview
![Image](architecture.png?raw=true)

###Project File Structure
The codes we wrote are in the assets/www/ dir:

* css/ : css file
* img/	: the logo or icons
* js/	: javascript files
* ~~js/index.js~~ js/letshire.js : our business logic
* ~~js/jquery.mobile.android-theme.js: jquery mobile android theme~~
* themes/android-theme.css
* index.html : app home page, including interviews, interview, settings and other 'pages'
* ~~interview.html : one interview page~~ 
* ~~interviews.html : my interviews~~
* ~~login.html : login page~~
* ~~settings.html : settings page~~
*   
* ~~lets-hire-api-app/ : the fake backend api based on sinatra~~ we will use the real api 
