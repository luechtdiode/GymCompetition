'use strict';

angular.module('gymCompetitionApp')

  .constant("baseURL","/api/")

  .service('clubFactory', ['$resource', 'baseURL', function($resource, baseURL) {
    this.getClubs = function() {
      return $resource(baseURL+"clubs/:id",null,  {'update':{method:'PUT' }});
    };
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
  }])

  .service('sponsorFactory', ['$resource', 'baseURL', function($resource, baseURL) {
    this.getSponsors = function () {
      return $resource(baseURL+"sponsors/:id",null,  {'update':{method:'PUT' }});
    };
  }])

  .factory('authFactory', ['$resource', '$http', '$localStorage', '$rootScope', '$window', 'baseURL',
   function($resource, $http, $localStorage, $rootScope, $window, baseURL){
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
          }
        );
    };
    authFac.logout = function() {
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
      },
      get: function(key, defaultValue) {
        return $window.localStorage[key] || defaultValue;
      },
      remove: function (key) {
          $window.localStorage.removeItem(key);
      },
      storeObject: function(key, value) {
        $window.localStorage[key] = JSON.stringify(value);
      },
      getObject: function(key,defaultValue) {
        return JSON.parse($window.localStorage[key] || defaultValue);
      }
    };
  }])

  .factory('budgetCalculator', [function() {
    var calc = {};
    calc.recalculateBudget = function(registration) {
      console.log("calculating  sponsor-budget ..");
      registration.budget = 0;
      for(var i in registration.regactions) {
        var action = registration.regactions[i];
        if(action.selected) {
          var maxcost = action.bidperaction * action.maxcnt;
          registration.budget += maxcost;
        }
      }
      return registration.budget;
    };
    return calc;
  }])

  .factory('competitionBudgetCalculator', [function() {
    var calc = {};
    calc.recalculateBudget = function(competition) {
      console.log("calculating competition-budget ..");
      competition.budget = 0;
      for(var i in competition.sponsoractions) {
        var action = competition.sponsoractions[i];
        if(action.selected) {
          var maxcost = action.costperaction * action.maxcnt;
          competition.budget += maxcost;
        }
      }
      return competition.budget;
    };
    return calc;
  }])
;
