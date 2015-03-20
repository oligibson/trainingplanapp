'use strict';
angular.module('Training.services', [])

.service('DB', function ($q, $rootScope) {
    
    this.init = function(){
      return $q.when($rootScope.sessiondb = new PouchDB('sessions'))
      .then(function (result) {
        return result;
      });
    };

    this.destroy = function(){
      $rootScope.sessiondb.destroy();
    };

    this.bulkload = function(db, data){
      console.log('bulkload');
      var deferred = $q.defer();
      $rootScope.sessiondb.bulkDocs(data).then(function(result){
        deferred.resolve(result);
      }).catch(function (err) {
        console.log(err);
        deferred.reject(err);
      });
      return deferred.promise;
    };

    this.bulkretrive = function(){
      console.log('bulkretrive');
      return $q.when($rootScope.sessiondb.allDocs({
        include_docs: true // jshint ignore:line
      }))
      .then(function (result) {
        console.log(result);
        return result.rows;
      }).catch(function (err) {
        console.log(err);
      });
    };

    this.get = function(id){
      console.log('get');
      return $q.when($rootScope.sessiondb.get(id))
      .then(function (result) {
        return result;
      }).catch(function (err) {
        console.log(err);
      });
    };

    this.post = function(doc){
      console.log('post');
      return $q.when($rootScope.sessiondb.post(doc))
      .then(function (result) {
        return result;
      }).catch(function (err) {
        console.log(err);
      });
    };

    this.put = function(doc){
      console.log('put');
      return $q.when($rootScope.sessiondb.put(doc))
      .then(function (result) {
        return result;
      }).catch(function (err) {
        console.log(err);
      });
    };

    this.delete = function(doc){
      console.log('delete');
      return $q.when($rootScope.sessiondb.remove(doc))
      .then(function (result) {
        console.log(result);
        return result;
      }).catch(function (err) {
        console.log(err);
      });
    };
    
  })

.service('Rest', function ($q, $http, $cordovaDialogs, $state) {
    
    this.send = function (type, url, timeout, data, token, showTimeout){
      var deferred = $q.defer();
      $http({
        method: type,
        url: 'http://trainingplanserver.herokuapp.com/api' + url,
        data: data,
        headers: {
          'Content-Type': 'application/json',
          'x-access-token': token
        },
        timeout: timeout,
        cache: false
      }).then(function (result){
        deferred.resolve(result.data);
      }, function (error){
        if(error.status === 0 && showTimeout){
          $cordovaDialogs.alert('We could not connect to the internet, please try again.', 'Time Out');
          return deferred.reject({ status: 0, message: 'Request Timed Out'});
        }
        else if(error.status === 401){
          $cordovaDialogs.alert('Please login and try again', 'Authentication Error');
          localStorage.removeItem('currentSession');
          localStorage.removeItem('token');
          localStorage.removeItem('user_id');
          localStorage.removeItem('user');
          localStorage.removeItem('sessions');
          $state.go('login');
          return deferred.reject({ status: 401, message: 'Your Token has Expired'});
        }
        else{
          return deferred.reject(error);
        }
      });
      return deferred.promise;
    };
  })

.service('Auth', function ($q, $http, $cordovaDialogs, $state, Rest, DB) {
    
    // This needs updating to handle saving token, and user details
    this.signup = function(data){
      data.fname = data.name.substr(0,data.name.indexOf(' '));
      data.lname = data.name.substr(data.name.indexOf(' ')+1);
      var url = '/users';
      var params = JSON.stringify(data);

      var deferred = $q.defer();
      Rest.send('POST', url, 5000, params, null, true)
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
        DB.init().then(function(){
          Rest.send('GET', '/sessions/user/' + result.data.user._id, 5000, null, result.data.token, false).then(function(result){
            DB.bulkload('sessiondb', result).then(function(){
              deferred.resolve();
            });
          });
        });
      }, function (error){
        deferred.reject(error);
      });
      return deferred.promise;
    };

    this.signout = function (){
      DB.destroy();
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

      Rest.send('GET', url, 5000, null, token, false)
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
      Rest.send('PUT', url, 5000, params, token, true)
      .then(function (result){
        deferred.resolve(result);
      }, function (error){
        deferred.reject(error);
      });
      return deferred.promise;
    };

  })

  .service('Record', function ($q, Rest, DB) {
    
    this.create = function(data){
      console.log(data);
      var deferred = $q.defer();
      DB.post(data).then(function(result){
        deferred.resolve(result);
      }, function(error){
        deferred.reject(error);
      });
      return deferred.promise;
    };

    this.completeSession = function(session){
      var deferred = $q.defer();
      DB.put(session).then(function(result){
        // Sync with server here...
        console.log(result);
        deferred.resolve(result);
      }, function(error){
        deferred.reject(error);
      });
      return deferred.promise;
      /*
      var params = JSON.stringify(data);
      var url = '/sessions/' + data._id;

      var deferred = $q.defer();
      Rest.send('PUT', url, 5000, params, null, true)
      .then(function (result){
        deferred.resolve(result);
      }, function (error){
        deferred.reject(error);
      });
      return deferred.promise;
      */
    };

    this.getCurrentSession = function(sessionId){
      var deferred = $q.defer();
      DB.get(sessionId).then(function(result){
        deferred.resolve(result);
      }, function(error){
        deferred.reject(error);
      });
      return deferred.promise;
    };

    this.updateCurrentSession = function(session){
      var deferred = $q.defer();
      DB.put(session).then(function(result){
        console.log(result);
        deferred.resolve(result);
      }, function(error){
        deferred.reject(error);
      });
      return deferred.promise;
    };

    this.deleteCurrentSession = function(session){
      var deferred = $q.defer();
      DB.delete(session).then(function(result){
        console.log(result);
        deferred.resolve(result);
      }, function(error){
        deferred.reject(error);
      });
      return deferred.promise;
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

  .service('Feed', function ($q, Rest, DB) {
    
    this.getAll = function(user){
      var token = localStorage.getItem('token');
      var url = '/sessions/user/' + user;
      var deferred = $q.defer();
      Rest.send('GET', url, 5000, null, token, false)
      .then(function (result){
        localStorage.setItem('sessions', JSON.stringify(result));
        deferred.resolve(result);
      }, function (error){
        deferred.reject(error);
      });
      return deferred.promise;
    };

    this.getCurrent = function(sessionId) {
      var deferred = $q.defer();
      DB.get(sessionId).then(function(result){
        deferred.resolve(result);
      }, function(error){
        deferred.reject(error);
      });
      return deferred.promise;
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
      var deferred = $q.defer();
      DB.bulkretrive().then(function(result){
        deferred.resolve(result);
      }, function(error){
        deferred.reject(error);
      });
      return deferred.promise;
    };

  })

  .service('Profile', function ($q, $http, Auth, Rest) {
    
    this.getUser = function(user){
      var token = localStorage.getItem('token');
      var url = '/users/' + user;

      var deferred = $q.defer();
      Rest.send('GET', url, 5000, null, token, false)
      .then(function (updateduser){
        localStorage.setItem('user', JSON.stringify(updateduser));
        deferred.resolve(updateduser);
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
        deferred.reject(error);
      });
      return deferred.promise;
    };

    this.deleteUser = function(user){
      var token = localStorage.getItem('token');
      var url = '/users/' + user._id;

      var deferred = $q.defer();
      Rest.send('DELETE', url, 5000, null, token, true)
      .then(function (result){
        deferred.resolve(result);
      }, function (error){
        deferred.reject(error);
      });
      return deferred.promise;
    };

  })

.service('Upload', function ($q, $cordovaFileTransfer) {
    
    this.profilePic = function (user, image){
      console.log('uploading');
      var url = 'http://trainingplanserver.herokuapp.com/api/uploads/profile/' + user._id;
      var filePath = image;
      var options = {
        fileKey: 'photo',
        chunkedMode: false
      };

      var deferred = $q.defer();
      $cordovaFileTransfer.upload(url, filePath, options)
      .then(function (result){
        var newResult = JSON.parse(result.response);
        user.mobileProfileImage = newResult.mobileProfileImage;
        console.log(user.mobileProfileImage);
        localStorage.setItem('user', JSON.stringify(user));
        deferred.resolve(newResult);
      }, function (err) {
        deferred.reject (err);
      }, function (progress) {
        var percentComplete = progress.loaded / progress.total;
        deferred.notify(percentComplete);
      });
      return deferred.promise;
    };

  });

