// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.controllers' is found in controllers.js
var email, uid, loverId, loverEmail;
angular.module('starter', ['ionic', 'ngCordova', 'starter.controllers', 'starter.services', "firebase"])

.run(function($ionicPlatform, $cordovaGeolocation) {
  $ionicPlatform.ready(function() {
	  
	Crittercism.init({
	  appId: 'a651870c140740999df9b45d3dff234600444503', // Example: 47cc67093475061e3d95369d
	  appVersion: '1.0' // Developer-provided application version
	});
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if (window.cordova && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
      cordova.plugins.Keyboard.disableScroll(true);

    }
    if (window.StatusBar) {
      // org.apache.cordova.statusbar required
      StatusBar.styleDefault();
    }
  });
  
  try{
  
  document.addEventListener("deviceready", function () {
	  
		var firebaseRef = new Firebase("https://lover-position.firebaseio.com/");		
		var usersRef = firebaseRef.child("users");
		
		var authData = firebaseRef.getAuth();
		if (authData) {
		   email = authData.password.email;
		   uid = authData.uid; 
		   
		   usersRef.child(uid).update({
			 email: email
		   });
		}
		
		var watchOptions = {
			timeout : 3000,
			enableHighAccuracy: false // may cause errors if true
		};

		var watch = $cordovaGeolocation.watchPosition(watchOptions);
		watch.then(
			null,
			function(err) {
			},
			function(position) {
				var lat  = position.coords.latitude
				var lng = position.coords.longitude
				
				if(typeof(email) != 'undefined'){					
					var geoFire = new GeoFire(usersRef.child(uid));
					geoFire.set('location', [lat, lng]).then(function() {
					}, function(error) {
					  alert("Error: " + error);
					});
				}
			});

  }, false);
  }catch(e){
	  alert(JSON.stringify(e));
  }
})

.config(function($stateProvider, $urlRouterProvider) {
  $stateProvider

  .state('app', {
    url: '/app',
    abstract: true,
    templateUrl: 'templates/menu.html',
    controller: 'AppCtrl'
  })
    .state('login', {
      url: '/login',
	  templateUrl: 'templates/login.html',
	  controller: 'LoginCtrl'
    })
	.state('signup', {
      url: '/signup',
	  templateUrl: 'templates/signup.html',
	  controller: 'SignupCtrl'
    })
	.state('app.home', {
      url: '/home',
      views: {
        'home-tab': {
          templateUrl: 'templates/home.html',
          controller: 'HomeCtrl'
        }
      }
    })
    .state('app.settings', {
      url: '/settings',
      views: {
        'settings-tab': {
          templateUrl: 'templates/settings.html',
          controller: 'SettingsCtrl'
        }
      }
    });
  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('/app/home');
})

.filter('notMe', function() {
    return function(input, uppercase) {
        var out = [];
        for (var i = 0; i < input.length; i++) {
            if(input[i].email != email){
                out.push(input[i]);
            }
        }
        return out;
    }
});