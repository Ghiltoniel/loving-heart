angular.module('starter.controllers', [])

.controller('AppCtrl', function($scope, $ionicModal, $timeout, $firebaseArray) {

  // With the new view caching in Ionic, Controllers are only called
  // when they are recreated or on app start, instead of every page change.
  // To listen for when this page is active (for example, to refresh data),
  // listen for the $ionicView.enter event:
  //$scope.$on('$ionicView.enter', function(e) {
  //});

  // Form data for the login modal
  var firebaseRef = new Firebase("https://lover-position.firebaseio.com/");		
  
  var authData = firebaseRef.getAuth();
  if (authData) {
	   email = $scope.email = authData.password.email;
	   uid = authData.uid; 
  }
  else{
	  $scope.login();
  }
  
  $scope.loginData = {};
  $scope.user = email;
  
  // Create the login modal that we will use later
  $ionicModal.fromTemplateUrl('templates/login.html', {
    scope: $scope
  }).then(function(modal) {
    $scope.modal = modal;
  });

  // Triggered in the login modal to close it
  $scope.closeLogin = function() {
    $scope.modal.hide();
  };

  // Open the login modal
  $scope.login = function() {
    $scope.modal.show();
  };

  // Perform the login action when the user submits the login form
  $scope.doLogin = function() {
	    var ref = new Firebase("https://lover-position.firebaseio.com/");
		try{
			ref.authWithPassword({
			  email    : $scope.loginData.username,
			  password : $scope.loginData.password
			}, function(error, authData) {
			  if (error) {
				alert("Login Failed!" + error);
			  } else {
				email = $scope.loginData.username;
				uid = authData.uid;
			  }
			});
		}catch(e){
			alert(e);
		}
    
  };
})

.controller('HomeCtrl', function($scope, $cordovaGeolocation, $stateParams) {
	var options = {timeout: 10000, enableHighAccuracy: true};
	
    var userId = $scope.userId = $stateParams.user;
 
 
	var firebaseRef = new Firebase("https://lover-position.firebaseio.com/");	
	var meRef = firebaseRef.child('users/' + uid);
	
	meRef.on("value", function(snapshot) {
		if(!snapshot.val().loverId)
			return;
		
		var userRef = firebaseRef.child("users/" + snapshot.val().loverId);
	
		userRef.on("value", function(snapshot) {
			$scope.user = snapshot.val().email;
			var geoFire = new GeoFire(userRef);
			geoFire.get('location').then(function(data) {
				var posOptions = {timeout: 10000, enableHighAccuracy: false};
				
				$cordovaGeolocation
					.getCurrentPosition(posOptions)
					.then(function (position) {
					  var lat  = position.coords.latitude
					  var lng = position.coords.longitude
					  
					  var d = Math.round(distance(data[0], data[1], lat, lng, 'K'));
					  $scope.distance = d < 1 ? 'very-close' : d < 5 ? 'close' : d < 20 ? 'medium' : d < 50 ? 'far' : 'very-far';
					}, function(err) {
					  // error
					});
			}, function(error) {
			  alert("Error: " + error);
			});
		}, function (errorObject) {
		  console.log("The read failed: " + errorObject.code);
		});
	});	
})

.controller('SettingsCtrl', function($scope, $stateParams) {
	
	$scope.lover = {}
	var firebaseRef = new Firebase("https://lover-position.firebaseio.com/");	
	var userRef = firebaseRef.child('users/' + uid);
	var usersRef = firebaseRef.child('users');
	
	$scope.save = function(){
		usersRef.orderByChild("email").startAt($scope.lover.email).limitToFirst(1).on("value", function(snapshot) {
		  if(snapshot.hasChildren()){	
			
			$scope.error = '';
			snapshot.forEach(function(childSnapshot) {
				// key will be "fred" the first time and "barney" the second time
				var key = childSnapshot.key();
				// childData will be the actual contents of the child
						  
				userRef.update({
					 loverId: childSnapshot.key()
				});	
			});	
		  }
		  else{
			  $scope.error = 'user does not exist';
			  $scope.$apply();
		  }
		});	
	}
    
})

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
	return dist
}