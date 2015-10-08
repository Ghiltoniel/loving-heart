controllers

.controller('LoginCtrl', function($scope, $ionicModal, $timeout, $firebaseArray, $location) {

  var firebaseRef = new Firebase("https://lover-position.firebaseio.com/");

	$scope.loginData = {};
	$scope.user = email;

  // Perform the login action when the user submits the login form
  $scope.doLogin = function() {
		$scope.login_error = '';
	    var ref = new Firebase("https://lover-position.firebaseio.com/");
		try{
			ref.authWithPassword({
			  email    : $scope.loginData.username,
			  password : $scope.loginData.password
			}, function(error, authData) {
			  if (error) {
				$scope.login_error = error.message;
				$scope.$apply();
			  } else {
				email = $scope.loginData.username;
				uid = authData.uid;
				location.href = '/';
				$scope.$apply();
			  }
			});
		}catch(e){
			alert(e);
		}
    
  };
});