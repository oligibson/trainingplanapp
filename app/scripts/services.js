'use strict';
angular.module('Training.services', [])

/**
 * A simple example service that returns some data.
 */
.factory('Friends', function() {
  // Might use a resource here that returns a JSON array

  // Some fake testing data
  var friends = [
    { id: 0, name: 'Scruff McGruff' },
    { id: 1, name: 'G.I. Joe' },
    { id: 2, name: 'Miss Frizzle' },
    { id: 3, name: 'Ash Ketchum' }
  ];

  return {
    all: function() {
      return friends;
    },
    get: function(friendId) {
      // Simple index lookup
      return friends[friendId];
    }
  };
});

angular.module('Training.services')
  .service('Record', function ($q, $http) {
    // AngularJS will instantiate a singleton by calling "new" on this function
    this.create = function(data){
      var deferred = $q.defer();
      var params = JSON.stringify(data);
      $http({
        method: 'POST',
        url: 'http://trainingplanserver.herokuapp.com/api/sessions/create',
        data: params,
        headers: {'Content-Type': 'application/json'}
      }).then(function (result){
        deferred.resolve(result.data);
      }, function (error){
        deferred.reject(error);
      });
      return deferred.promise;
    };
  })

  .service('Feed', function ($q, $http) {
    // AngularJS will instantiate a singleton by calling "new" on this function
    var currentSessions;
    
    this.getAll = function(user){
      var deferred = $q.defer();
      $http({
        method: 'GET',
        url: 'http://trainingplanserver.herokuapp.com/api/users/'+user+'/sessions',
        headers: {'Content-Type': 'application/json'}
      }).then(function (result){
        currentSessions = result.data;
        deferred.resolve(result.data);
      }, function (error){
        deferred.reject(error);
      });
      return deferred.promise;
    };

    this.getCurrent = function(sessionId) {
      // Simple index lookup
      for(var i=0; i < currentSessions.length; i++){
        if(currentSessions[i]._id === sessionId){
          return currentSessions[i];
        }
      }
      return;
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

