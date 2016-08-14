'use strict';

angular.module('gymCompetitionApp')

  .constant("baseURL","http://http://gymcompetition.mybluemix.net/")

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
        /*
        getUsers().query({username:loginData.username, password:loginData.password},
          function(found){

            for(var i in found) {
              var u = found[i];
              if(u.username === loginData.username) {
                storeUserCredentials({
                  username:u.username,
                  token: u.id,
                  isMemberOfClub: u.isMemberOfClub,
                  isMemberOfSponsor: u.isMemberOfSponsor
                });
                $rootScope.$broadcast('login:Successful');
                console.log("login:Successful");
              }
            }
          },
          function(failed){
            console.log("login:failed" + failed);
            isAuthenticated = false;
          });*/
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
        /*
        if(registerData.company === undefined || registerData.company === '') {
          getClubs().query(
            function(clubs){
              var newClubId = 1;
              for(var i in clubs) {
                var u = clubs[i];
                if(u.id >= newClubId) {newClubId = u.id + 1;}
                if(u.name === registerData.name) {
                  throw new Error('Club exists already!');
                }
              }
              getClubs().save({
                id:newClubId,
                name:registerData.name,
                homepage:registerData.homepage,
                image: "images/verein-flag.png",
                label: registerData.label,
                kind: registerData.kind.split(","),
                googleplushandle: registerData.googleplushandle,
                facebookhandle: registerData.facebookhandle,
                twitterhandle: registerData.twitterhandle,
                youtubehandle: registerData.youtubehandle,
                description: registerData.description
              }).$promise.then(
                function(savedClub){
                  getUsers().query(function(found){
                    var newId = 1;
                    for(var i in found) {
                      var u = found[i];
                      if(u.id >= newId) {newId = u.id + 1;}
                      if(u.username === registerData.username) {
                        throw new Error('User exists already!');
                      }
                    }
                    registerData.id = newId;
                    registerData.isMemberOfClub = savedClub.id;
                    getUsers().save(registerData).$promise.then(
                      function(){
                        authFac.login({username:registerData.username, password:registerData.password});
                        if (registerData.rememberMe) {
                          $localStorage.storeObject('userinfo',
                            {username:registerData.username, password:registerData.password});
                        }
                        $rootScope.$broadcast('registration:Successful');
                      },
                      function(response) {
                          console.log("Error: "+response.status + " " + response.statusText);
                      });
                  },
                  function(response) {
                      console.log("Error: "+response.status + " " + response.statusText);
                  });
                },
                function(response) {
                    console.log("Error: "+response.status + " " + response.statusText);
                });
            },
            function(response) {
                console.log("Error: "+response.status + " " + response.statusText);
            });
        }
        else {
          getSponsors().query(
            function(sponsors){
              var newSponsorId = 1;
              for(var i in sponsors) {
                var u = sponsors[i];
                if(u.id >= newSponsorId) {newSponsorId = u.id + 1;}
                if(u.company === registerData.company) {
                  throw new Error('Sponsor-Company exists already!');
                }
              }
              var filteredSponsorActions = registerData.regactions.filter(function(action){return action.selected;});
              for(var i in filteredSponsorActions) {
                filteredSponsorActions[i] = {
                  action:filteredSponsorActions[i].action,
                  bidperaction:filteredSponsorActions[i].bidperaction,
                  maxcnt:filteredSponsorActions[i].maxcnt,
                  kinds:filteredSponsorActions[i].kinds.split(',').filter(function(action){return action.length > 0;})
                };
              }
              getSponsors().save({
                id:newSponsorId,
                name:registerData.company,
                homepage:registerData.homepage,
                googleplushandle: registerData.googleplushandle,
                facebookhandle: registerData.facebookhandle,
                twitterhandle: registerData.twitterhandle,
                youtubehandle: registerData.youtubehandle,
                slogan:registerData.slogan,
                image: "images/sponsor.png",
                sponsoractions: filteredSponsorActions
              }).$promise.then(
                function(savedSponsor){
                  getUsers().query(function(found){
                    var newId = 1;
                    for(var i in found) {
                      var u = found[i];
                      if(u.id >= newId) {newId = u.id + 1;}
                      if(u.username === registerData.username) {
                        throw new Error('User exists already!');
                      }
                    }
                    registerData.id = newId;
                    registerData.isMemberOfSponsor = savedSponsor.id;
                    getUsers().save(registerData).$promise.then(
                      function(){
                        authFac.login({username:registerData.username, password:registerData.password});
                        if (registerData.rememberMe) {
                          $localStorage.storeObject('userinfo',
                            {username:registerData.username, password:registerData.password});
                        }
                        $rootScope.$broadcast('registration:Successful');
                      },
                      function(response) {
                          console.log("Error: "+response.status + " " + response.statusText);
                      });
                  },
                  function(response) {
                      console.log("Error: "+response.status + " " + response.statusText);
                  });
                },
                function(response) {
                    console.log("Error: "+response.status + " " + response.statusText);
                });
            },
            function(response) {
                console.log("Error: "+response.status + " " + response.statusText);
            });
        }*/

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
;
