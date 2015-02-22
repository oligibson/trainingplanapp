'use strict';
angular.module('Training.services', [])

.service('Rest', function ($q, $http) {
    
    this.send = function (type, url, timeout, data, token){
      var deferred = $q.defer();
      $http({
        method: type,
        url: 'http://trainingplanserver.herokuapp.com/api' + url,
        data: data,
        headers: {
          'Content-Type': 'application/json',
          'x-access-token': token
        },
        timeout: timeout
      }).then(function (result){
        console.log(result);
        deferred.resolve(result.data);
      }, function (error){
        console.log(error);
        if(error.status === 0){
          console.log('Timed Out');
          // Add function here to handle timeout
          return deferred.reject({ status: 0, message: 'Request Timed Out'});
        }
        else if(error.status === 401){
          console.log('unauthorised');
          //Auth.unauthorised();
          return deferred.reject({ status: 401, message: 'Your Token has Expired'});
        }
        else{
          return deferred.reject(error);
        }
      });
      return deferred.promise;
    };
  })

.service('Auth', function ($q, $http, $cordovaDialogs, $state, Rest) {
    
    // This needs updating to handle saving token, and user details
    this.signup = function(data){
      data.fname = data.name.substr(0,data.name.indexOf(' '));
      data.lname = data.name.substr(data.name.indexOf(' ')+1);
      var url = '/users';
      var params = JSON.stringify(data);

      var deferred = $q.defer();
      Rest.send('POST', url, 5000, params, null)
      .then(function (result){
        localStorage.setItem('token', result.token);
        localStorage.setItem('user_id', result.user._id);
        localStorage.setItem('user', JSON.stringify(result.user));
        deferred.resolve(result);
      }, function (error){
        deferred.reject(error);
      });
      return deferred.promise;
    };

    this.login = function(data){
      var params = JSON.stringify(data);

      var deferred = $q.defer();
      $http({
        method: 'POST',
        url: 'http://trainingplanserver.herokuapp.com/auth/login',
        data: params,
        headers: {'Content-Type': 'application/json'},
        timeout: 5000
      }).then(function (result){
        localStorage.setItem('token', result.data.token);
        localStorage.setItem('user_id', result.data.user._id);
        localStorage.setItem('user', JSON.stringify(result.data.user));
        deferred.resolve(result.data);
      }, function (error){
        if(error.status === 0){
          console.log('Timed Out');
        }
        deferred.reject(error);
      });
      return deferred.promise;
    };

    this.signout = function (){
      localStorage.removeItem('currentSession');
      localStorage.removeItem('token');
      localStorage.removeItem('user_id');
      localStorage.removeItem('user');
      localStorage.removeItem('sessions');
      $state.go('login');
    };

    this.unauthorised = function (){
      $cordovaDialogs.alert('Please login and try again', 'Authentication Error');
      localStorage.removeItem('currentSession');
      localStorage.removeItem('token');
      localStorage.removeItem('user_id');
      localStorage.removeItem('user');
      localStorage.removeItem('sessions');
      $state.go('login');
    };

    this.refresh = function (){

      var user = localStorage.getItem('user_id');
      var token = localStorage.getItem('token');
      var url = '/users/' + user + '/refresh';
      var deferred = $q.defer();

      if(user === undefined || token === undefined){
        deferred.reject('User not previously logged in');
      }

      Rest.send('GET', url, 5000, null, token)
      .then(function (result){
        localStorage.setItem('token', result.token);
        deferred.resolve(result);
      }, function (error){
        deferred.reject(error);
      });

      return deferred.promise;
    };

    this.changePassword = function (data){
      var params = JSON.stringify(data);
      var token = localStorage.getItem('token');
      var url = '/users/' + localStorage.getItem('user_id') + '/password';

      var deferred = $q.defer();
      Rest.send('PUT', url, 5000, params, token)
      .then(function (result){
        deferred.resolve(result);
      }, function (error){
        deferred.reject(error);
      });
      return deferred.promise;
    };

  })

  .service('Record', function ($q, Rest) {
    
    this.create = function(data){
      var token = localStorage.getItem('token');
      var url = '/sessions';
      var params = JSON.stringify(data);

      var deferred = $q.defer();
      Rest.send('POST', url, 5000, params, token)
      .then(function (result){
        localStorage.setItem('currentSession', JSON.stringify(result));
        deferred.resolve(result);
      }, function (error){
        console.log(error);
        deferred.reject(error);
      });
      return deferred.promise;
    };

    this.completeSession = function(data){
      var params = JSON.stringify(data);
      var url = '/sessions/' + data._id;

      var deferred = $q.defer();
      Rest.send('PUT', url, 5000, params, null)
      .then(function (result){
        console.log(result);
        deferred.resolve(result);
      }, function (error){
        deferred.reject(error);
      });
      return deferred.promise;
    };

    this.deleteCurrentServerSession = function(sessionId){
      var token = localStorage.getItem('token');
      var url = '/sessions/' + sessionId;

      var deferred = $q.defer();
      Rest.send('DELETE', url, 5000, null, token)
      .then(function(result){
        console.log(result);
        deferred.resolve(result);
      }, function (error){
        deferred.reject(error);
      });
      return deferred.promise;
    };

    this.getCurrentSession = function(){
      var session = JSON.parse(localStorage.getItem('currentSession'));
      console.log(session);
      return session;
    };

    this.updateCurrentSession = function(session){
      localStorage.setItem('currentSession', JSON.stringify(session));
    };

    this.deleteCurrentSession = function(){
      localStorage.removeItem('currentSession');
    };

    this.sessionName = function() {
      var myDate = new Date();
  
      if ( myDate.getHours() < 12 ){
        return 'Morning Session';
      }
      else if ( myDate.getHours() >= 12 && myDate.getHours() < 14 ){
        return 'Lunch Session';
      }
      else if ( myDate.getHours() >= 14 && myDate.getHours() < 18 ){
        return 'Afternoon Session';
      }
      else if ( myDate.getHours() >= 18 && myDate.getHours() <= 24 ){
        return 'Evening Session';
      }
      else{
        return;
      }
    };

  })

  .service('Feed', function ($q, Rest) {
    
    this.getAll = function(user){
      var token = localStorage.getItem('token');
      var url = '/sessions/user/' + user;
      var deferred = $q.defer();
      Rest.send('GET', url, 5000, null, token)
      .then(function (result){
        console.log(result);
        localStorage.setItem('sessions', JSON.stringify(result));
        deferred.resolve(result);
      }, function (error){
        console.log(error);
        deferred.reject(error);
      });
      return deferred.promise;
    };

    this.getCurrent = function(sessionId) {
      var currentSessions = JSON.parse(localStorage.getItem('sessions'));
      // Simple index lookup
      for(var i=0; i < currentSessions.length; i++){
        if(currentSessions[i]._id === sessionId){
          return currentSessions[i];
        }
      }
      return;
    };

    this.deleteLocalSession = function(sessionId) {
      var currentSessions = JSON.parse(localStorage.getItem('sessions'));
      // Simple index lookup
      for(var i=0; i < currentSessions.length; i++){
        if(currentSessions[i]._id === sessionId){
          currentSessions.splice(i,1);
          localStorage.setItem('sessions', JSON.stringify(currentSessions));
          return;
        }
      }
      return;
    };

    this.getLocal = function() {
      var currentSessions = JSON.parse(localStorage.getItem('sessions'));
      return currentSessions;
    };

  })

  .service('Profile', function ($q, $http, Auth, Rest) {
    
    this.getUser = function(user){
      var token = localStorage.getItem('token');
      var url = '/users/' + user;

      var deferred = $q.defer();
      Rest.send('GET', url, 5000, null, token)
      .then(function (result){
        localStorage.setItem('user', JSON.stringify(result));
        deferred.resolve(result);
      }, function (error){
        deferred.reject(error);
      });

      return deferred.promise;
    };

    this.getLocalUser = function() {
      var currentUser = JSON.parse(localStorage.getItem('user'));

      if(currentUser.lastSession === undefined){
        currentUser.lastSession = '-';
      }

      if(currentUser.mobileProfileImage === undefined){
        currentUser.mobileProfileImage = './img/placeholder.png';
      }

      return currentUser;
    };

    this.updateLocalUser = function(user){
      localStorage.setItem('user', JSON.stringify(user));
    };

    this.saveUser = function(user){
      var token = localStorage.getItem('token');
      var url = '/users/' + user._id;
      var params = JSON.stringify(user);

      var deferred = $q.defer();
      Rest.send('PUT', url, 5000, params, token)
      .then(function (result){
        localStorage.setItem('user', JSON.stringify(result));
        deferred.resolve(result);
      }, function (error){
        console.log(error);
        deferred.reject(error);
      });
      return deferred.promise;
    };

    this.deleteUser = function(user){
      var token = localStorage.getItem('token');
      var url = '/users/' + user._id;

      var deferred = $q.defer();
      Rest.send('DELETE', url, 5000, null, token)
      .then(function (result){
        deferred.resolve(result);
      }, function (error){
        deferred.reject(error);
      });
      return deferred.promise;
    };

  })

.service('Upload', function ($cordovaFileTransfer) {
    
    this.profilePic = function (user, image){

      console.log('Hit Upload');

      var url = 'http://trainingplanserver.herokuapp.com/api/uploads/profile/' + user._id;
      var filePath = image;
      var options = {
        fileKey: 'photo',
        chunkedMode: false
      };

      $cordovaFileTransfer.upload(url, filePath, options)
      .then(function(result){
        console.log(result);
      }, function(err) {
        console.log(err);
      }, function (progress) {
        console.log(progress);
      });
    };

  });

