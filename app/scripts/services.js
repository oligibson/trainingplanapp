'use strict';
angular.module('Training.services', [])

.service('Auth', function ($q, $http) {
    
    // This needs updating to handle saving token, and user details
    this.signup = function(data){
      data.fname = data.name.substr(0,data.name.indexOf(' '));
      data.lname = data.name.substr(data.name.indexOf(' ')+1);
      
      var deferred = $q.defer();
      var params = JSON.stringify(data);
      $http({
        method: 'POST',
        url: 'http://trainingplanserver.herokuapp.com/api/users',
        data: params,
        headers: {'Content-Type': 'application/json'}
      }).then(function (result){
        localStorage.setItem('token', result.data.token);
        localStorage.setItem('user_id', result.data.user._id);
        localStorage.setItem('user', JSON.stringify(result.data.user));
        deferred.resolve(result.data);
      }, function (error){
        deferred.reject(error);
      });
      return deferred.promise;
    };

    this.login = function(data){
      
      var deferred = $q.defer();
      var params = JSON.stringify(data);
      $http({
        method: 'POST',
        url: 'http://trainingplanserver.herokuapp.com/auth/login',
        data: params,
        headers: {'Content-Type': 'application/json'}
      }).then(function (result){
        localStorage.setItem('token', result.data.token);
        localStorage.setItem('user_id', result.data.user._id);
        localStorage.setItem('user', JSON.stringify(result.data.user));
        deferred.resolve(result.data);
      }, function (error){
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
    };

    this.refresh = function (){

      var user = localStorage.getItem('user_id');
      var token = localStorage.getItem('token');
      var deferred = $q.defer();

      if(user === undefined || token === undefined){
        deferred.reject('User not previously logged in');
      }

      $http({
        method: 'GET',
        url: 'http://trainingplanserver.herokuapp.com/api/users/' + user + '/refresh',
        headers: {
          'Content-Type': 'application/json',
          'x-access-token': token
        }
      }).then(function (result){
        localStorage.setItem('token', result.data.token);
        deferred.resolve(result.data);
      }, function (error){
        console.log(error);
        deferred.reject(error);
      });

      return deferred.promise;
    };

  })

  .service('Record', function ($q, $http) {
    
    this.create = function(data){
      var deferred = $q.defer();
      var params = JSON.stringify(data);
      $http({
        method: 'POST',
        url: 'http://trainingplanserver.herokuapp.com/api/sessions',
        data: params,
        headers: {'Content-Type': 'application/json'}
      }).then(function (result){
        localStorage.setItem('currentSession', JSON.stringify(result.data));
        console.log(result.data);
        deferred.resolve(result.data);
      }, function (error){
        deferred.reject(error);
      });
      return deferred.promise;
    };

    this.completeSession = function(data){
      var deferred = $q.defer();
      var params = JSON.stringify(data);
      console.log(params);
      $http({
        method: 'PUT',
        url: 'http://trainingplanserver.herokuapp.com/api/sessions/' + data._id,
        data: params,
        headers: {'Content-Type': 'application/json'}
      }).then(function (result){
        console.log(result.data);
        deferred.resolve(result.data);
      }, function (error){
        deferred.reject(error);
      });
      return deferred.promise;
    };

    this.deleteCurrentServerSession = function(sessionId){
      var deferred = $q.defer();
      $http({
        method: 'DELETE',
        url: 'http://trainingplanserver.herokuapp.com/api/sessions/' + sessionId,
        headers: {'Content-Type': 'application/json'}
      }).then(function(result){
        console.log(result);
        deferred.resolve(result.data);
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

  .service('Feed', function ($q, $http) {
    
    this.getAll = function(user){
      var deferred = $q.defer();
      $http({
        method: 'GET',
        url: 'https://trainingplanserver.herokuapp.com/api/sessions/user/' + user,
        headers: {'Content-Type': 'application/json'}
      }).then(function (result){
        console.log(result);
        localStorage.removeItem('sessions');
        localStorage.setItem('sessions', JSON.stringify(result.data));
        deferred.resolve(result.data);
      }, function (error){
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

  .service('Profile', function ($q, $http, Auth) {
    
    this.getUser = function(user){
      var deferred = $q.defer();
      $http({
        method: 'GET',
        url: 'http://trainingplanserver.herokuapp.com/api/users/'+user,
        headers: {'Content-Type': 'application/json'}
      }).then(function (result){
        localStorage.removeItem('user');
        localStorage.setItem('user', JSON.stringify(result.data));
        deferred.resolve(result.data);
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
      var deferred = $q.defer();
      var params = JSON.stringify(user);
      $http({
        method: 'PUT',
        url: 'http://trainingplanserver.herokuapp.com/api/users/'+ user._id,
        data: params,
        headers: {'Content-Type': 'application/json'}
      }).then(function (result){
        localStorage.removeItem('user');
        localStorage.setItem('user', JSON.stringify(result.data));
        deferred.resolve(result.data);
      }, function (error){
        deferred.reject(error);
      });
      return deferred.promise;
    };

    this.deleteUser = function(user){
      var deferred = $q.defer();
      $http({
        method: 'DELETE',
        url: 'http://trainingplanserver.herokuapp.com/api/users/'+ user._id,
        headers: {'Content-Type': 'application/json'}
      }).then(function (result){
        Auth.signout();
        deferred.resolve(result);
      }, function (error){
        deferred.reject(error);
      });
      return deferred.promise;
    };

  });

