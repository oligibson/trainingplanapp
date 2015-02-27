'use strict';
angular.module('Training.controllers', [])

.controller('LoginCtrl', function($scope, $state, $cordovaDialogs, Auth) {

	$scope.user = {};
	$scope.loginButton = 'Login';

	$scope.login = function (){
		$scope.loginButton = 'Please Wait...';
		Auth.login($scope.user).then(function (){
			$scope.loginButton = 'Login';
			$state.go('tab.feed');
		}, function (err){
			$scope.loginButton = 'Login';
			$scope.user.password = undefined;
			console.log(err);
			$cordovaDialogs.confirm('Incorrect username or password, please try again', 'Login Error', 'Try Again');
		});
	};

	$scope.signUp = function (){
		$state.go('signup');
	};

})

.controller('SignupCtrl', function($scope, $state, $cordovaDialogs, Auth) {

	$scope.user = { emailUpdates: true };

	$scope.signUpForm = function (){
		Auth.signup($scope.user).then(function (){
			$state.go('tab.record');
		}, function (err){
			$cordovaDialogs.confirm(err.data.errors.email.message, 'User Exists', 'Try Again');
		});
	};
})

.controller('FeedCtrl', function($scope, $ionicLoading, $ionicTabsDelegate, $ionicActionSheet, Feed, Record) {

	$scope.deleteButton = 'Edit';
	$scope.showDelete = false;

	$scope.Refresh = function (){
		
		Feed.getAll(localStorage.getItem('user_id'))
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
		
		Feed.getAll(localStorage.getItem('user_id')).then(function (){
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

.controller('RecordCtrl', function($scope, $location, $ionicHistory, $ionicTabsDelegate, Record) {

	$scope.session = { id: localStorage.getItem('user_id'), activity: 'Gym', name: Record.sessionName()};
	$scope.button = 'Record Session';

	$scope.createSession = function (){
		$scope.button = 'Please Wait...';
		$scope.session.date = new Date();
		Record.create($scope.session).then(function (){
			$scope.button = 'Record Session';
			$ionicHistory.nextViewOptions({
				disableBack: true
			});
			$location.path('/tab/record/session');
		}, function (error){
			$scope.button = 'Record Session';
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
		var newSet = exercise.sets[exercise.sets.length -1];
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

.controller('RecordCompleteCtrl', function($scope, $ionicActionSheet, $ionicHistory, $location, Record) {

	$scope.session = Record.getCurrentSession();
	$scope.button = 'Save Session';

	$scope.saveSession = function (){
		$scope.button = 'Please Wait...';
		$scope.session.completed = true;
		console.log($scope.session);
		Record.completeSession($scope.session).then(function(result){
			console.log(result);
			Record.deleteCurrentSession();
			$ionicHistory.nextViewOptions({
				historyRoot: true,
				disableBack: true
			});
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
				$ionicHistory.nextViewOptions({
					historyRoot: true,
					disableBack: true
				});
				$location.path('/tab/record');
			}
		});
	};

})

.controller('ProfileCtrl', function($scope, $state, $ionicActionSheet, Profile, Feed, Auth) {

	$scope.id = localStorage.getItem('user_id');

	$scope.getUser = function (){

		$scope.user = Profile.getLocalUser();

		Profile.getUser($scope.id).then(function (){
			$scope.user = Profile.getLocalUser();
		}, function (error){
			console.log(error);
		});
	};

	$scope.getSessions = function (){
		
		$scope.sessions = Feed.getLocal();
		
		Feed.getAll($scope.id).then(function (){
			$scope.sessions = Feed.getLocal();
		}, function (error){
			console.log(error);
		});

	};

	$scope.signOut = function (){
		$ionicActionSheet.show({
			titleText: 'Are you sure you want to sign out?',
			destructiveText: 'Sign Out',
			cancelText: 'Cancel',
			cancel: function(){
				return true;
			},
			destructiveButtonClicked: function(){
				Auth.signout();
				return true;
			}
		});
	};

	$scope.getSessions();

	$scope.getUser();

})

.controller('ProfileSettingsCtrl', function($scope, $state, $location, $ionicLoading, $cordovaDialogs, $ionicActionSheet, $cordovaCamera, Profile, Auth, Upload) {

	$scope.user = Profile.getLocalUser();
	$scope.progress = 1;

	$scope.changePassword = function (){
		$state.go('tab.profile-password');
	};

	$scope.saveUser = function (){
		$ionicLoading.show({
	      templateUrl: 'templates/loading.html'
	    });
		Profile.saveUser($scope.user).then(function (){
			$ionicLoading.hide();
			$location.path('/tab/profile');
		}, function (error){
			$ionicLoading.hide();
			$cordovaDialogs.alert('Please try again later', 'Connection Error');
			console.log(error);
		});
	};

	$scope.deleteUser = function (){
		$ionicActionSheet.show({
			titleText: 'Are you sure you want to delete your account?',
			destructiveText: 'Delete Account',
			cancelText: 'Cancel',
			cancel: function(){
				return true;
			},
			destructiveButtonClicked: function(){
				Profile.deleteUser($scope.user).then(function (){
					Auth.signout();
				}, function (error){
					$cordovaDialogs.alert('We could not delete your account at this time', 'Connection Error');
					console.log(error);
				});
				return true;
			}
		});
	};

	$scope.changePicture = function (){
		$ionicActionSheet.show({
			destructiveText: 'Delete',
			buttons: [
				{ text: 'Take Picture' },
				{ text: 'Choose Existing' }
			],
			cancelText: 'Cancel',
			cancel: function(){
				return true;
			},
			destructiveButtonClicked: function(){
				return true;
			},
			buttonClicked: function(index) {
				if(index === 0){
					var options = {
						quality: 50,
						destinationType: Camera.DestinationType.FILE_URI,
						sourceType: Camera.PictureSourceType.CAMERA,
						allowEdit: false,
						cameraDirection: 1,
						encodingType: Camera.EncodingType.JPEG,
						saveToPhotoAlbum: false
					};
				}
				else if(index === 1){
					var options = {
						quality: 50,
						destinationType: Camera.DestinationType.FILE_URI,
						sourceType: Camera.PictureSourceType.PHOTOLIBRARY,
						allowEdit: false,
						encodingType: Camera.EncodingType.JPEG,
					};
				}

				$cordovaCamera.getPicture(options).then(function (imageData){
					StatusBar.styleLightContent();
					$scope.progress = 0;
					Upload.profilePic($scope.user, imageData).then(function (result){
						$scope.progress = 1;
						$scope.user.mobileProfileImage = result.mobileProfileImage;
					}, function (err){
						console.log(err);
						$scope.progress = 1;
						$cordovaDialogs.alert('We could not upload your photo at this time, please try again.', 'Connection Error');
					}, function (p){
						console.log(p);
						$scope.progress = p;
					});
				}, function(err){
					console.log(err);
				});

				return true;
			}
		});
	};

})

.controller('ProfilePasswordCtrl', function($scope, $state, $ionicActionSheet, $cordovaDialogs, Auth) {

	$scope.pass = {};
	$scope.button = 'Save Password';

	$scope.updatePassword = function (){
		$scope.button = 'Please Wait...';
		$ionicActionSheet.show({
			titleText: 'Are you sure you want to change your password?',
			buttons: [
				{ text: 'Change Password' }
			],
			cancelText: 'Cancel',
			cancel: function(){
				$scope.pass = {};
				$scope.button = 'Save Password';
				return true;
			},
			buttonClicked: function(){
				if($scope.pass.oldPassword.length < 1 || $scope.pass.newPassword.length < 1 ){
					console.log('Error');
					$scope.button = 'Save Password';
					$scope.pass = {};
					$cordovaDialogs.alert('Please fill in both password fields', 'Error');
					return true;
				}else{
					Auth.changePassword($scope.pass).then(function(){
						$scope.pass = {};
						$scope.button = 'Save Password';
						$cordovaDialogs.alert('Your password was successfully updated!', 'Password Updated')
						.then(function() {
					      $state.go('tab.profile');
					    });
					}, function (){
						$scope.pass = {};
						$scope.button = 'Save Password';
						$cordovaDialogs.alert('Your password could not be updated, please try again.', 'Error');
					});
					return true;
				}
			}
		});
	};

});
