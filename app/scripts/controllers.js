'use strict';
angular.module('Training.controllers', [])

.controller('FeedCtrl', function($scope, $ionicLoading, $ionicTabsDelegate, Feed) {

	console.log($ionicTabsDelegate.selectedIndex());

	$scope.Refresh = function (){
		
		Feed.getAll('542fee894e51797a026a87ae')
	    .then(function(result) {
			$scope.sessions = result;
			$scope.$broadcast('scroll.refreshComplete');
		}, function (error){
			console.log(error);
		});
	};

	$scope.getSessions = function (){
		$ionicLoading.show({
			templateUrl: 'templates/loading.html',
			noBackdrop: true
		});
		Feed.getAll('542fee894e51797a026a87ae').then(function (result){
			console.log(result);
			$ionicLoading.hide();
			$scope.sessions = result;
		}, function (error){
			console.log(error);
		});
	};

	$scope.getSessions();
})

.controller('RecordCtrl', function($scope, $location, $ionicTabsDelegate, Record) {

	console.log($ionicTabsDelegate.selectedIndex());

	$scope.session = { id: '542fee894e51797a026a87ae'};
	$scope.button = 'Record Session';

	$scope.createSession = function (){
		$scope.button = 'Please Wait...';
		$scope.session.date = new Date();
		Record.create($scope.session).then(function (result){
			console.log(result);
			$location.path('/tab/record/0');
		}, function (error){
			console.log(error);
		});
	};
})

.controller('RecordSessionCtrl', function($scope) {

	$scope.exercises = [{name: 'Bench Pull', setNo: 3}, {name: 'Bench Press', setNo: 3}];

	$scope.addExercise = function (){
		console.log('adding exercise');
		$scope.exercises.push({name: 'Chins', setNo: 2});
	};
  
})

.controller('SessionDetailCtrl', function($scope, $stateParams, Feed) {

	console.log($stateParams.sessionId);
	$scope.session = Feed.getCurrent($stateParams.sessionId);
	console.log($scope.session);

})

.controller('ProfileCtrl', function($scope, $ionicLoading, Profile) {

	$scope.id = '542fee894e51797a026a87ae';

	$scope.getUser = function (){
		$ionicLoading.show({
			templateUrl: 'templates/loading.html',
			noBackdrop: true
		});
		Profile.getUser($scope.id).then(function (result){
			$scope.user = result;
			$ionicLoading.hide();
		}, function (error){
			$ionicLoading.hide();
			console.log(error);
		});
	};

	$scope.getUser();

});
