'use strict';
angular.module('Training.controllers', [])

.controller('FeedCtrl', function($scope, $ionicLoading, $ionicTabsDelegate, Feed) {

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

	$scope.session = { id: '542fee894e51797a026a87ae'};
	$scope.button = 'Record Session';

	$scope.createSession = function (){
		$scope.button = 'Please Wait...';
		$scope.session.date = new Date();
		Record.create($scope.session).then(function (){
			$location.path('/tab/record/session');
		}, function (error){
			console.log(error);
		});
	};
})

.controller('RecordSessionCtrl', function($scope, $ionicPopup, $cordovaDialogs, $location, Record) {

	$scope.session = Record.getCurrentSession();

	$scope.addExercise = function (){
		console.log('adding exercise');
		$scope.session.exercises.push({name: 'Chins', setNo: 2});
		Record.updateCurrentSession($scope.session);
	};

	$scope.completeSession = function (){

		if($scope.session.exercises.length < 1){
			$cordovaDialogs.confirm('This session contains no exercises', 'No Exercises Detected', ['Discard','Complete'])
			.then(function(buttonIndex) {
				if(buttonIndex === 1){
					Record.deleteCurrentSession();
					Record.deleteCurrentServerSession($scope.session._id);
					$location.path('/tab/record');
				}else if(buttonIndex === 2){
					$location.path('/tab/record/session/complete');
				}
			});
		}else{
			$location.path('/tab/record/session/complete');
		}
	};

})

.controller('RecordCompleteCtrl', function($scope, $ionicActionSheet, $location, Record) {

	$scope.session = Record.getCurrentSession();
	$scope.button = 'Save Session';

	$scope.saveSession = function (){
		$scope.button = 'Please Wait...';
		$location.path('/tab/record');
	};

	$scope.deleteSession = function (){
		$ionicActionSheet.show({
			titleText: 'Are you sure you want to delete all your hard work?',
			destructiveText: 'Delete',
			cancelText: 'Cancel',
			cancel: function(){
				return true;
			},
			destructiveButtonClicked: function(){
				Record.deleteCurrentSession();
				Record.deleteCurrentServerSession($scope.session._id);
				$location.path('/tab/record');
			}
		});
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
