'use strict';

angular.module('GymCompetition.services', ['ngResource'])
  .constant("baseURL","/api/")


    .service('clubFactory', ['$resource', 'baseURL', function($resource, baseURL) {
      this.getClubs = function() {
        return $resource(baseURL+"clubs/:id",null,  {'update':{method:'PUT' }});
      };
      this.getClubOfMonth = function() {
        return $resource(baseURL + "clubs/month");
      }
    }])

    .service('actionsFactory', ['$resource', 'baseURL', function($resource, baseURL) {
      this.getActions = function() {
        return $resource(baseURL+"actions/:id",null,  {'update':{method:'PUT' }});
      };
    }])

    .service('competitionFactory', ['$resource', 'baseURL', function($resource, baseURL) {
      this.getCompetitions = function () {
        return $resource(baseURL+"competitions/:id",null,  {'update':{method:'PUT' }});
      };
      this.getNextCompetition = function() {
        return $resource(baseURL + "competitions/next");
      }
    }])

    .service('sponsorFactory', ['$resource', 'baseURL', function($resource, baseURL) {
      this.getSponsors = function () {
        return $resource(baseURL+"sponsors/:id",null,  {'update':{method:'PUT' }});
      };
      this.getSponsorOfMotnh = function() {
        return $resource(baseURL + "sponsors/month");
      }
    }])

    .factory('authFactory', ['$resource', '$http', '$localStorage', '$rootScope', '$window', 'baseURL', function($resource, $http, $localStorage, $rootScope, $window, baseURL){
      var authFac = {};
      var TOKEN_KEY = 'GCToken';
      var isAuthenticated = false;
      var username = '';
      var authToken;
      var isMemberOfClub = '-1';
      var isMemberOfSponsor = '-1';
      function useCredentials(credentials) {
        isAuthenticated = true;
        username = credentials.username;
        authToken = credentials.token;
        isMemberOfClub = credentials.isMemberOfClub;
        isMemberOfSponsor = credentials.isMemberOfSponsor;
        console.log("username set: " + username);
        // Set the token as header for your requests!
        $http.defaults.headers.common['x-access-token'] = authToken;
      }
      function destroyUserCredentials() {
        authToken = undefined;
        isMemberOfClub = "-1";
        isMemberOfSponsor = "-1";
        username = '';
        isAuthenticated = false;
        $http.defaults.headers.common['x-access-token'] = authToken;
        $localStorage.remove(TOKEN_KEY);
      }
      function loadUserCredentials() {
        var credentials = $localStorage.getObject(TOKEN_KEY,'{}');
        if (credentials.username !== undefined) {
          useCredentials(credentials);
        }
      }
      function storeUserCredentials(credentials) {
        $localStorage.storeObject(TOKEN_KEY, credentials);
        useCredentials(credentials);
      }
      authFac.login = function(loginData) {
        $resource(baseURL + "users/login")
          .save(loginData,
            function(response) {
              storeUserCredentials({
                username:response.username,
                token: response.token,
                isMemberOfClub: response.isMemberOfClub,
                isMemberOfSponsor: response.isMemberOfSponsor
              });
              $rootScope.$broadcast('login:Successful');
              console.log("login:Successful");
            },
            function(){
              isAuthenticated = false;
                //ngDialog.openConfirm({ template: message, plain: 'true'});
            }
          );
      };
      authFac.logout = function() {
        //$resource(baseURL + "users/logout").get(function(response){});
        destroyUserCredentials();
        $rootScope.$broadcast('logout:Successful');
      };
      authFac.register = function(registerData) {
        console.log("Register: " + registerData);
        $resource(baseURL + "users/register")
          .save(registerData,
            function(response) {
              console.log("Registered: " + response);
              authFac.login({username:registerData.username, password:registerData.password});
              if (registerData.rememberMe) {
                $localStorage.storeObject('userinfo',
                  {username:registerData.username, password:registerData.password});
              }
              $rootScope.$broadcast('registration:Successful');
            },
            function(response){
              console.log("Not registered: " + response);
              //ngDialog.openConfirm({ template: message, plain: 'true'});
            }
          );
      };
      authFac.isAuthenticated = function() {
        return isAuthenticated;
      };
      authFac.isMemberOfClub = function() {
        return isMemberOfClub;
      };
      authFac.isMemberOfSponsor = function() {
        return isMemberOfSponsor;
      };
      authFac.getUsername = function() {
        return username;
      };
      loadUserCredentials();
      return authFac;
    }])

    .factory('$localStorage', ['$window', function($window) {
      return {
        store: function(key, value) {
          $window.localStorage[key] = value;
          console.log("stored");
        },
        get: function(key, defaultValue) {
          return $window.localStorage[key] || defaultValue;
        },
        remove: function (key) {
            $window.localStorage.removeItem(key);
            console.log("removed");
        },
        storeObject: function(key, value) {
          $window.localStorage[key] = JSON.stringify(value);
          console.log("object stored");
        },
        getObject: function(key,defaultValue) {
          return JSON.parse($window.localStorage[key] || defaultValue);
        }
      };
    }])

  .factory('feedbackFactory', ['$resource', 'baseURL', function($resource,baseURL) {
    return $resource(baseURL+"feedback/:id");
  }])

  .factory('favoriteFactory', ['$resource', '$localStorage', 'baseURL',
    function ($resource, $localStorage, baseURL) {
      var favFac = {};
      var favorites = $localStorage.getObject('favorites', '[]');

      favFac.addToFavorites = function (index) {
        for (var i = 0; i < favorites.length; i++) {
          if (favorites[i].id == index)
            return;
        }
        favorites.push({id: index});
        $localStorage.storeObject('favorites', favorites);
      };

      favFac.deleteFromFavorites = function (index) {
        for (var i = 0; i < favorites.length; i++) {
          if (favorites[i].id == index) {
            favorites.splice(i, 1);
          }
        }
        $localStorage.storeObject('favorites', favorites);
      }

      favFac.getFavorites = function () {
        return favorites;
      };

      return favFac;
  }])


;
