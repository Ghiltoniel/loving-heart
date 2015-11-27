// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.controllers' is found in controllers.js
var email, uid, loverId, loverEmail;
angular.module('starter', ['ionic','ionic.service.core', 'ionic.service.push', 'ngCordova', 'starter.controllers', 'starter.services', "firebase"])

.run(function($ionicPlatform, $cordovaGeolocation, backend, $ionicPopup, $rootScope) {
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
	
	Ionic.io();
  });
  
  try{
  
	  document.addEventListener("deviceready", function () {
		  loadGPS();
	  }, false);
  }catch(e){
	  alert(JSON.stringify(e));
  }
  
  
	function loadGPS(){
		var firebaseRef = new Firebase("https://lover-position.firebaseio.com/");		
		var usersRef = firebaseRef.child("users");
		
		var authData = firebaseRef.getAuth();
		if (authData) {
		   uid = authData.uid; 
		}
		
		var watchOptions = {
			timeout : 3000,
			enableHighAccuracy: false // may cause errors if true
		};

		var watch = $cordovaGeolocation.watchPosition(watchOptions);
		watch.then(
			null,
			function(err) {
				backend.user.no_gps = true;
				
				 $rootScope.no_gps_data = true;
				 var alertPopup = $ionicPopup.alert({
					 title: 'No GPS signal!',
					 template: 'Please activate your GPS'
				 });
				 alertPopup.then(function(res) {
					   
				 });
			},
			function(position) {
				var lat  = position.coords.latitude
				var lng = position.coords.longitude
				backend.user.lat = lat;
				backend.user.lng = lng;
				backend.user.no_gps = false;
				
				  
				var d = Math.round(distance(backend.user.lat, backend.user.lng, backend.user.loverLat, backend.user.loverLng, 'K'));
				if($rootScope.user){
					$rootScope.user.distance = d < 1 ? 'very-close' : d < 5 ? 'close' : d < 20 ? 'medium' : d < 50 ? 'far' : d < 80 ? 'very-far' : 'very-far-away';
				}
				if(typeof(backend.user.uid) != 'undefined'){					
					var geoFire = new GeoFire(usersRef.child(backend.user.uid));
					geoFire.set('location', [lat, lng]).then(function() {
					}, function(error) {
					  alert("Error: " + error);
					});
				}
			});

	}
  
  
	
	function distance(lat1, lon1, lat2, lon2, unit) {
		var radlat1 = Math.PI * lat1/180
		var radlat2 = Math.PI * lat2/180
		var radlon1 = Math.PI * lon1/180
		var radlon2 = Math.PI * lon2/180
		var theta = lon1-lon2
		var radtheta = Math.PI * theta/180
		var dist = Math.sin(radlat1) * Math.sin(radlat2) + Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
		dist = Math.acos(dist)
		dist = dist * 180/Math.PI
		dist = dist * 60 * 1.1515
		if (unit=="K") { dist = dist * 1.609344 }
		if (unit=="N") { dist = dist * 0.8684 }
		return dist;
	}
	
	$ionicPlatform.on('resume', function(){
       if(backend.user.no_gps){
		   loadGPS();
	   }
    });
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