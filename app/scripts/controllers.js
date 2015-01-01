'use strict';
angular.module('Training.controllers', [])

.controller('FeedCtrl', function($scope, $ionicLoading, $ionicTabsDelegate, $ionicActionSheet, Feed, Record) {

	$scope.deleteButton = 'Edit';
	$scope.showDelete = false;

	$scope.Refresh = function (){
		
		Feed.getAll('542fee894e51797a026a87ae')
	    .then(function() {
			$scope.sessions = Feed.getLocal();
			$scope.$broadcast('scroll.refreshComplete');
		}, function (error){
			console.log(error);
		});
	};

	$scope.toggleDelete = function(){
		if($scope.showDelete === false){
			$scope.showDelete = true;
			$scope.deleteButton = 'Done';
		}else{
			$scope.showDelete = false;
			$scope.deleteButton = 'Edit';
			// Refresh local storage from server
		}
	};

	$scope.delete = function(session){
		$ionicActionSheet.show({
			titleText: 'Are you sure you want to delete this session?',
			destructiveText: 'Delete',
			cancelText: 'Cancel',
			cancel: function(){
				return true;
			},
			destructiveButtonClicked: function(){
				Feed.deleteLocalSession(session._id);
				$scope.sessions = Feed.getLocal();
				Record.deleteCurrentServerSession(session._id);
				return true;
			}
		});
	};

	$scope.getSessions = function (){
		
		$scope.sessions = Feed.getLocal();
		
		Feed.getAll('542fee894e51797a026a87ae').then(function (){
			$scope.sessions = Feed.getLocal();
		}, function (error){
			console.log(error);
		});

	};

	$scope.getSessions();
})

.controller('SessionDetailCtrl', function($scope, $stateParams, Feed) {

	$scope.session = Feed.getCurrent($stateParams.sessionId);

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

.controller('RecordSessionCtrl', function($scope, $ionicActionSheet, $ionicPopup, $cordovaDialogs, $location, Record) {

	$scope.session = Record.getCurrentSession();

	$scope.addExercise = function (){
		console.log('adding exercise');
		$scope.session.exercises.push({setNo: 1, sets: [{reps: 0, weight: 0}]});
		Record.updateCurrentSession($scope.session);
	};

	$scope.addSet = function (exercise, index){
		console.log('adding set');
		var newSet = exercise.sets[exercise.sets.length -1];
		console.log(newSet);
		$scope.session.exercises[index].sets.push({reps: newSet.reps, weight: newSet.weight});
		$scope.session.exercises[index].setNo = $scope.session.exercises[index].setNo + 1;
		Record.updateCurrentSession($scope.session);
	};

	$scope.deleteExercise = function (index){
		$ionicActionSheet.show({
			titleText: 'Are you sure you want to delete this exercise?',
			destructiveText: 'Delete',
			cancelText: 'Cancel',
			cancel: function(){
				return true;
			},
			destructiveButtonClicked: function(){
				$scope.session.exercises.splice(index, 1);
				Record.updateCurrentSession($scope.session);
				return true;
			}
		});
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
		$scope.session.completed = true;
		console.log($scope.session);
		Record.completeSession($scope.session).then(function(result){
			console.log(result);
			Record.deleteCurrentSession();
			$location.path('/tab/record');
		}, function (error){
			console.log(error);
		});
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

.controller('ProfileCtrl', function($scope, $ionicLoading, Profile, Feed) {

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

	$scope.getSessions = function (){
		
		$scope.sessions = Feed.getLocal();
		
		Feed.getAll('542fee894e51797a026a87ae').then(function (){
			$scope.sessions = Feed.getLocal();
		}, function (error){
			console.log(error);
		});

	};

	$scope.getSessions();

	$scope.getUser();

})

.controller('ProfileSettingsCtrl', function() {

	

});
