var services = angular.module('starter.services', [])

.factory('backend', function($rootScope, $location, $cordovaGeolocation) {
	var user = {};
	var loadedCallbacks = [];
	
	var firebaseRef = new Firebase("https://lover-position.firebaseio.com/");	
	var usersRef = firebaseRef.child("users");
	var meRef;
	
	$rootScope.$on('loggedIn', loadUser);
	$rootScope.$on('loverSet', loadUser);
		
	var loadUser = function(){
	  $rootScope.loading = true;
	  var authData = firebaseRef.getAuth();
	  if (authData) {
		user.uid = authData.uid; 
		user.email = authData.provider == 'password' ? authData.password.email :
			authData.provider == 'facebook' ? authData.facebook.email :
			authData.provider == 'google' ? authData.google.email : '';
	   
		usersRef.child(user.uid).update({
		  email: user.email
		}, function(error) {
		  if (error) {
			console.log(error);
			$rootScope.loading = false;
		  }
		});
		
		$rootScope.loading = false;
		loadHeart();
	  }
	  else{
		$rootScope.loading = false;
		$location.path('/login');
	  }
	}
		
	function loadHeart(){ 
		meRef = firebaseRef.child('users/' + user.uid);
		
		$rootScope.loading = true;
		meRef.on("value", function(snapshot) {
			if(!snapshot.val().loverId)
			{
				$rootScope.loading = false;
				user.no_lover = true;
			}
			user.no_lover = false;
			user.loverId = snapshot.val().loverId;
			
			var userRef = firebaseRef.child("users/" + user.loverId);
		
			userRef.on("value", function(snapshot) {
				user.loverEmail = snapshot.val().email;
				
				var geoFire = new GeoFire(userRef);
				geoFire.get('location').then(function(data) {
					if(!data){
						$rootScope.loading = false;
						$rootScope.no_data = false;
						return;
					}
					
					var posOptions = {timeout: 10000, enableHighAccuracy: false};
					
					$cordovaGeolocation
						.getCurrentPosition(posOptions)
						.then(function (position) {
							  var lat  = position.coords.latitude
							  var lng = position.coords.longitude
							  
							  var d = Math.round(distance(data[0], data[1], lat, lng, 'K'));
							  user.distance = d < 1 ? 'very-close' : d < 5 ? 'close' : d < 20 ? 'medium' : d < 50 ? 'far' : 'very-far';
							  $rootScope.user = user;
							  $rootScope.loading = false;
							  if(!$rootScope.$$phase) {
								$rootScope.$apply();
							  }
						}, function(err) {
						  // error
						});
				}, function(error) {
				    alert("Error: " + error);
				    $rootScope.loading = false;
				});
			}, function (errorObject) {
			  console.log("The read failed: " + errorObject.code);
			  $rootScope.loading = false;
			});
		});	
	}
	
	var saveLover = function(loverEmail){
		$rootScope.loading = true;
		usersRef.orderByChild("email").startAt(loverEmail).endAt(loverEmail).limitToFirst(1).on("value", function(snapshot) {
		  if(snapshot.hasChildren()){	
			
			$rootScope.error_lover = '';
			snapshot.forEach(function(childSnapshot) {
				// key will be "fred" the first time and "barney" the second time
				var key = childSnapshot.key();
				// childData will be the actual contents of the child
						 
				meRef.update({
					 loverId: childSnapshot.key()
				});	
				user.loverEmail = loverEmail;
				
				loadHeart();
			    $rootScope.loading = false;
				$location.path('/app/home');
			});	
		  }
		  else{
			  $rootScope.error_lover = 'user does not exist';
			  $rootScope.loading = false;
			  if(!$rootScope.$$phase) {
				$rootScope.$apply();
			  }
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
	
	loadUser();
	
	return {
		loadUser: loadUser,
		user: user,
		loadedCallbacks: loadedCallbacks,
		saveLover: saveLover,
		firebaseRef: firebaseRef
	}
})