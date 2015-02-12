'use strict';
// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.services' is found in services.js
// 'starter.controllers' is found in controllers.js
angular.module('Training', ['ionic', 'ngCordova', 'config', 'Training.controllers', 'Training.services'])

.run(function($ionicPlatform, Auth, $state, $cordovaSplashscreen, $cordovaNetwork) {
  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if(window.cordova && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
    }
    if(window.StatusBar) {
      // org.apache.cordova.statusbar required
      StatusBar.styleLightContent();
      StatusBar.show();
    }

    if($cordovaNetwork.online()){
      Auth.refresh().then(function(){
        $cordovaSplashscreen.hide();
        $state.go('tab.feed');
      }, function (err){
        $cordovaSplashscreen.hide();
        console.log('token expired', err);
      });
    }else{
      var user = localStorage.getItem('user_id');
      var token = localStorage.getItem('token');
      if(user !== null || token !== null){
        $cordovaSplashscreen.hide();
        $state.go('tab.feed');
      }else{
        $cordovaSplashscreen.hide();
      }
    }

  });
})

.config(function($stateProvider, $urlRouterProvider) {

  // Ionic uses AngularUI Router which uses the concept of states
  // Learn more here: https://github.com/angular-ui/ui-router
  // Set up the various states which the app can be in.
  // Each state's controller can be found in controllers.js
  $stateProvider

    .state('login', {
      url: '/login',
      cache: false,
      templateUrl: 'templates/login.html',
      controller: 'LoginCtrl'
    })

    .state('signup', {
      url: '/login/signup',
      cache: false,
      templateUrl: 'templates/signup.html',
      controller: 'SignupCtrl'
    })

    // setup an abstract state for the tabs directive
    .state('tab', {
      url: '/tab',
      abstract: true,
      templateUrl: 'templates/tabs.html'
    })

    // Each tab has its own nav history stack:

    .state('tab.feed', {
      url: '/feed',
      views: {
        'tab-feed': {
          templateUrl: 'templates/tab-feed.html',
          controller: 'FeedCtrl'
        }
      }
    })

    .state('tab.feed-detail', {
      url: '/feed/:sessionId',
      views: {
        'tab-feed': {
          templateUrl: 'templates/session-detail.html',
          controller: 'SessionDetailCtrl'
        }
      }
    })

    .state('tab.record', {
      cache: false,
      url: '/record',
      views: {
        'tab-record': {
          templateUrl: 'templates/tab-record.html',
          controller: 'RecordCtrl'
        }
      }
    })

    .state('tab.record-session', {
      cache: false,
      url: '/record/session',
      views: {
        'tab-record': {
          templateUrl: 'templates/record-session.html',
          controller: 'RecordSessionCtrl'
        }
      }
    })

    .state('tab.record-complete', {
      cache: false,
      url: '/record/session/complete',
      views: {
        'tab-record': {
          templateUrl: 'templates/record-complete.html',
          controller: 'RecordCompleteCtrl'
        }
      }
    })

    .state('tab.profile', {
      cache: false,
      url: '/profile',
      views: {
        'tab-profile': {
          templateUrl: 'templates/tab-profile.html',
          controller: 'ProfileCtrl'
        }
      }
    })

    .state('tab.profile-settings', {
      cache: false,
      url: '/profile/settings',
      views: {
        'tab-profile': {
          templateUrl: 'templates/profile-settings.html',
          controller: 'ProfileSettingsCtrl'
        }
      }
    });

  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('/login');

});

