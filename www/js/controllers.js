var controllers = angular.module('starter.controllers', [])

.controller('AppCtrl', function($scope, $ionicModal, $timeout, $firebaseArray, $location, $state) {

  // Form data for the login modal
  var firebaseRef = new Firebase("https://lover-position.firebaseio.com/");		
    
  var authData = firebaseRef.getAuth();
  if (authData) {
	   email = $scope.email = authData.password.email;
	   uid = authData.uid; 
  }
  else{
	$location.path('/login');
  }
})

.controller('HomeCtrl', function($scope, $cordovaGeolocation, $stateParams) {
	var options = {timeout: 10000, enableHighAccuracy: true};
	
    var userId = $scope.userId = $stateParams.user;
 
 
	var firebaseRef = new Firebase("https://lover-position.firebaseio.com/");	
	var meRef = firebaseRef.child('users/' + uid);
	
	$scope.loading = true;
	
	meRef.on("value", function(snapshot) {
		if(!snapshot.val().loverId)
		{
			$scope.no_lover = true;
			$scope.loading = false;
			$scope.$apply();
			return;
		}
		
		$scope.no_lover = false;
		$scope.loading = false;
		$scope.$apply();
		loverId = snapshot.val().loverId;
		var userRef = firebaseRef.child("users/" + loverId);
	
		userRef.on("value", function(snapshot) {
			$scope.user = loverEmail = snapshot.val().email;
			var geoFire = new GeoFire(userRef);
			geoFire.get('location').then(function(data) {
				if(!data){
					$scope.error = "Your lover has not yet set his location";
					$scope.$apply();
				}
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

.controller('SettingsCtrl', function($scope, $stateParams, $location) {
	
	$scope.lover = {
		email: loverEmail
	};
	
	var firebaseRef = new Firebase("https://lover-position.firebaseio.com/");	
	var userRef = firebaseRef.child('users/' + uid);
	var usersRef = firebaseRef.child('users');
	
	userRef.on('value', function(snapshot){
		if(snapshot.val()){
			loverId = snapshot.val().loverId;
		}
	});
	
	$scope.save = function(){
		if(!$scope.lover.email){
			return;
		}
		
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
				
				$location.path('/app/home')
				$scope.$apply();
			});	
		  }
		  else{
			  $scope.error = 'user does not exist';
			  $scope.$apply();
		  }
		});	
	}
	
	$scope.logout = function(){
		firebaseRef.unauth();
		$location.path('/login');
	};
    
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