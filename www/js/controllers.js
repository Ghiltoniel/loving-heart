var controllers = angular.module('starter.controllers', [])

.controller('AppCtrl', function($scope, $ionicModal, $timeout, $location, $state, $rootScope, backend) {
	
})

.controller('HomeCtrl', function($scope, $cordovaGeolocation, $stateParams, $rootScope, backend) {
	
})

.controller('SettingsCtrl', function($scope, $stateParams, $location, $rootScope, backend) {
		
	$rootScope.$watch('user', function(user){		
		$scope.lover = {
			email: backend.user.loverEmail
		};
	})
	
	$scope.save = function(){
		if(!$scope.lover.email){
			return;
		}
		if($scope.lover.email == backend.user.email){			
			$scope.error = 'You can\'t be your on lover ! That is narcissistic, my friend !';
			$scope.$apply();
			return; 
		}
		
		backend.saveLover($scope.lover.email);
	}
	
	$scope.logout = function(){
		backend.firebaseRef.unauth();
		$location.path('/login');
	};
    
})