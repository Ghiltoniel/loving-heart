var services = angular.module('starter.services', [])

.factory('backend', function($rootScope, $location, $cordovaGeolocation, $ionicPopup) {
	var user = {};
	var loadedCallbacks = [];
	
	var firebaseRef = new Firebase("https://lover-position.firebaseio.com/");	
	var usersRef = firebaseRef.child("users");
	var meRef;
		
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
		$rootScope.user = user;
		meRef.on("value", function(snapshot) {
			if(!snapshot.val().loverId)
			{
				$rootScope.loading = false;
				user.no_lover = true;
				return;
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
					
				  user.loverLat  = data[0];
				  user.loverLng = data[1];
				  $rootScope.loading = false;
				  if(!$rootScope.$$phase) {
					$rootScope.$apply();
				  }
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
	
	loadUser();
	
	return {
		loadUser: loadUser,
		user: user,
		loadedCallbacks: loadedCallbacks,
		saveLover: saveLover,
		firebaseRef: firebaseRef
	}
})