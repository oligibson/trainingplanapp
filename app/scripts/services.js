'use strict';
angular.module('Training.services', [])

  .service('Record', function ($q, $http) {
    
    this.create = function(data){
      var deferred = $q.defer();
      var params = JSON.stringify(data);
      $http({
        method: 'POST',
        url: 'http://trainingplanserver.herokuapp.com/api/sessions/create',
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
      return JSON.parse(localStorage.getItem('currentSession'));
    };

    this.updateCurrentSession = function(session){
      localStorage.setItem('currentSession', JSON.stringify(session));
    };

    this.deleteCurrentSession = function(){
      localStorage.removeItem('currentSession');
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

  .service('Profile', function ($q, $http) {
    
    this.getUser = function(user){
      var deferred = $q.defer();
      $http({
        method: 'GET',
        url: 'http://trainingplanserver.herokuapp.com/api/users/'+user,
        headers: {'Content-Type': 'application/json'}
      }).then(function (result){
        deferred.resolve(result.data);
      }, function (error){
        deferred.reject(error);
      });
      return deferred.promise;
    };

  });

