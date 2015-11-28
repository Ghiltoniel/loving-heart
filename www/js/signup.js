controllers

.controller('SignupCtrl', function($scope, $ionicModal, $timeout, $firebaseArray, $location, backend) {

  var firebaseRef = new Firebase("https://lover-position.firebaseio.com/");

	$scope.signupData = {};
	$scope.user = email;

  // Perform the login action when the user submits the login form
  $scope.doSignup = function() {
		$scope.signup_error = '';
		$scope.loading = true;
	    var ref = new Firebase("https://lover-position.firebaseio.com/");
		try{
			ref.createUser({
			  email: $scope.signupData.username,
			  password: $scope.signupData.password
			}, function(error, userData) {
				$scope.loading = false;
			  if (error) {
				switch (error.code) {
				  case "EMAIL_TAKEN":
					$scope.signup_error = "The new user account cannot be created because the email is already in use.";
					break;
				  case "INVALID_EMAIL":
					$scope.signup_error = "The specified email is not a valid email.";
					break;
				  default:
					$scope.signup_error = "Error creating user:" + error;
				}				
				$scope.$apply();
			  } else {
				email = $scope.signupData.username;
				uid = userData.uid;
				$scope.loading = false;
				
				try{
					ref.authWithPassword({
					  email    : $scope.signupData.username,
					  password : $scope.signupData.password
					}, function(error, authData) {
						$scope.loading = false;
					  if (error) {
						$scope.signup_error = error.message;
						$scope.$apply();
					  } else {
						email = $scope.signupData.username;
						uid = authData.uid;
						var usersRef = firebaseRef.child("users");
					    usersRef.child(uid).update({
						  email: email
					    }, function(error) {
						  if (error) {
							$scope.signup_error = "Data could not be saved." + error;
						  } else {
							backend.loadUser();
							$location.path('/app/home');
							$scope.$apply();
						  }
						});
					  }
					});
				}catch(e){
					$scope.loading = false;
					$scope.signup_error = e.message;
				}
			  }
			});
		}catch(e){
			$scope.loading = false;
			$scope.signup_error = e.message;
			$scope.$apply();
		}
    
  };
  
  $scope.reset = function(){
	  $scope.signup_error = '';
  }
});