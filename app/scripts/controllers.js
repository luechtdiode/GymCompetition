'use strict';

angular.module('gymCompetitionApp')

        .controller('HeaderController', ['$scope', '$state', '$rootScope', 'authFactory', function ($scope, $state, $rootScope, authFactory) {
//        .controller('HeaderController', ['$scope', '$state', '$rootScope', 'ngDialog', 'authFactory', function ($scope, $state, $rootScope, ngDialog, authFactory) {

            $scope.loggedIn = false;
            $scope.clubid = "-1";
            $scope.sponsorid = "-1";
            $scope.username = '';

            if(authFactory.isAuthenticated()) {
                $scope.loggedIn = true;
                $scope.username = authFactory.getUsername();
                $scope.clubid = authFactory.isMemberOfClub();
                $scope.sponsorid = authFactory.isMemberOfSponsor();
            }

            $scope.openLogin = function () {
                //ngDialog.open({ template: 'views/login.html', scope: $scope, className: 'ngdialog-theme-default', controller:"LoginController" });
            };

            $scope.logOut = function() {
                authFactory.logout();
                $scope.loggedIn = false;
                $scope.clubid = "-1";
                $scope.sponsorid = "-1";
                $scope.username = '';
            };

            $rootScope.$on('login:Successful', function () {
                console.log("in controller:" + authFactory.getUsername());
                $scope.loggedIn = authFactory.isAuthenticated();
                $scope.username = authFactory.getUsername();
                $scope.clubid = authFactory.isMemberOfClub();
                $scope.sponsorid = authFactory.isMemberOfSponsor();
                if(authFactory.isMemberOfClub() > '-1') {
                  console.log("in controller goto club:" + authFactory.isMemberOfClub());
                  $state.go('app.clubdetails', {id: authFactory.isMemberOfClub()});
                }
                else {
                  console.log("in controller goto sponsor:" + authFactory.isMemberOfSponsor());
                  $state.go('app.sponsordetails', {id: authFactory.isMemberOfSponsor()});
                }
            });

            $rootScope.$on('logout:Successful', function () {
                $scope.loggedIn = authFactory.isAuthenticated();
                $scope.username = authFactory.getUsername();
                $scope.clubid = authFactory.isMemberOfClub();
                $scope.sponsorid = authFactory.isMemberOfSponsor();
                $state.go('app');
            });

            $rootScope.$on('registration:Successful', function () {
                $scope.loggedIn = authFactory.isAuthenticated();
                $scope.username = authFactory.getUsername();
                $scope.clubid = authFactory.isMemberOfClub();
                $scope.sponsorid = authFactory.isMemberOfSponsor();
            });

            $scope.stateis = function(curstate) {
               return $state.is(curstate);
            };

        }])

        .controller('AboutController', ['$scope', 'clubFactory', 'sponsorFactory', 'competitionFactory', function($scope, clubFactory, sponsorFactory, competitionFactory) {
          $scope.clubs = clubFactory.getClubs().query(function(clubs){
            $scope.clubs = clubs.length;
          });
          $scope.sponsors = sponsorFactory.getSponsors().query(function(sponsors){
            $scope.sponsors = sponsors.length;
          });
          $scope.competitions = competitionFactory.getCompetitions().query(function(competitions){
            $scope.competitions = competitions.length;
          });
        }])

        .controller('LoginController', ['$scope', '$state', '$localStorage', 'authFactory', function ($scope, $state, $localStorage, authFactory) {

            $scope.loginData = $localStorage.getObject('userinfo','{}');

            $scope.doLogin = function() {
              console.log("on doLogin");
                if($scope.rememberMe) {
                   $localStorage.storeObject('userinfo',$scope.loginData);
                }
                authFactory.login($scope.loginData);
            };

        }])

        .controller('RegisterController', ['$scope', '$state', '$localStorage', 'authFactory', 'actionsFactory', function ($scope, $state, $localStorage, authFactory, actionsFactory) {
          $scope.recalculateBudget = function() {
            $scope.registration.budget = 0;
            for(var i in $scope.registration.regactions) {
              var action = $scope.registration.regactions[i];
              if(action.selected) {
                var maxcost = action.bidperaction * action.maxcnt;
                $scope.registration.budget += maxcost;
              }
            }
            return $scope.registration.budget;
          };

            $scope.actions = actionsFactory.getActions().query(
              function(success) {
                $scope.actions = success;
                $scope.registration = {
                  username : '',
                  password : '',
                  firstname : '',
                  lastname : '',
                  homepage: '',
                  googleplushandle: '',
                  facebookhandle: '',
                  twitterhandle: '',
                  youtubehandle: '',
                  company : '',
                  slogan : '',
                  budget : 0.0,
                  regactions : []
                };
                for(var a in $scope.actions) {
                  if($scope.actions[a].id !== undefined) {
                    $scope.registration.regactions.push(
                      {
                        action:$scope.actions[a].id,
                        name:$scope.actions[a].name,
                        selected:true,
                        bidperaction:10.0,
                        maxcnt:100,
                        kinds:''
                      });
                  }
                }
                $scope.recalculateBudget();
              },
              function(response) {
                  console.log("Error: "+response.status + " " + response.statusText);
              });

            $scope.doRegister = function() {
                console.log('Doing registration', $scope.registration);

                authFactory.register($scope.registration);
                //ngDialog.close();

            };
        }])

        .controller('SponsorController', ['$scope', '$state', '$localStorage', 'authFactory', 'actionsFactory', 'sponsorFactory',
          function ($scope, $state, $localStorage, authFactory, actionsFactory, sponsorFactory) {
            $scope.recalculateBudget = function() {
              $scope.registration.budget = 0;
              for(var i in $scope.registration.regactions) {
                var action = $scope.registration.regactions[i];
                if(action.selected) {
                  var maxcost = action.bidperaction * action.maxcnt;
                  $scope.registration.budget += maxcost;
                }
              }
              return $scope.registration.budget;
            };
            //angular.bind(self, fn, args);
            $scope.actions = actionsFactory.getActions().query(
              function(success) {
                $scope.actions = success;
                $scope.registration = {
                  username : '',
                  password : '',
                  firstname : '',
                  lastname : '',
                  company : '',
                  homepage : '',
                  slogan : '',
                  budget : 1000.0,
                  regactions : []
                };
                sponsorFactory.getSponsors().get({id:authFactory.isMemberOfSponsor()}).$promise.then(
                  function(sponsor){
                    $scope.registration.company = sponsor.name;
                    $scope.registration.homepage = sponsor.homepage;
                    $scope.registration.slogan = sponsor.slogan;
                    $scope.registration.budget = sponsor.budget;
                    $scope.registration.googleplushandle = sponsor.googleplushandle;
                    $scope.registration.facebookhandle = sponsor.facebookhandle;
                    $scope.registration.twitterhandle = sponsor.twitterhandle;
                    $scope.registration.youtubehandle = sponsor.youtubehandle;

                    for(var a in $scope.actions) {
                      if($scope.actions[a]._id !== undefined) {
                        var sat = $scope.actions[a];
                        var found = false;
                        for(var b in sponsor.sponsoractions) {
                          var sa = sponsor.sponsoractions[b];
                          if(sa.action === sat._id) {
                            found = true;
                            $scope.registration.regactions.push(
                              {
                                action:$scope.actions[a]._id,
                                name:$scope.actions[a].name,
                                selected:true,
                                bidperaction:sa.bidperaction,
                                maxcnt:sa.maxcnt,
                                kinds:sa.kinds + ''
                              });
                            break;
                          }
                        }
                        if(!found) {
                          $scope.registration.regactions.push(
                            {
                              action:$scope.actions[a]._id,
                              name:$scope.actions[a].name,
                              selected:false,
                              bidperaction:10.0,
                              maxcnt:100,
                              kinds:''
                            });
                        }
                      }
                    }
                    $scope.recalculateBudget();
                  },
                  function(response) {
                      console.log("Error: "+response.status + " " + response.statusText);
                  });
              },
              function(response) {
                  console.log("Error: "+response.status + " " + response.statusText);
              });

            $scope.doSave = function() {
                $scope.registration.regactions = $scope.registration.regactions.filter(function(action){return action.selected;});
                for(var i in $scope.registration.regactions) {
                  $scope.registration.regactions[i] = {
                    _id:$scope.registration.regactions[i].action,
                    action:$scope.registration.regactions[i].action,
                    bidperaction:$scope.registration.regactions[i].bidperaction,
                    maxcnt:$scope.registration.regactions[i].maxcnt,
                    kinds:$scope.registration.regactions[i].kinds.split(',').filter(function(action){return action.length > 0;})
                  };
                }
                console.log('Saving sponsor', $scope.registration);
                sponsorFactory.getSponsors().update({id: authFactory.isMemberOfSponsor()},{
                  name: $scope.registration.company,
                  homepage:  $scope.registration.homepage,
                  googleplushandle:$scope.registration.googleplushandle,
                  facebookhandle:$scope.registration.facebookhandle,
                  twitterhandle:$scope.registration.twitterhandle,
                  youtubehandle:$scope.registration.youtubehandle,
                  slogan: $scope.registration.slogan,
                  image: "images/sponsor.png",
                  sponsoractions: $scope.registration.regactions
                }).$promise.then(function(){
                  $state.go('app.sponsordetails', {id: authFactory.isMemberOfSponsor()});
                },
                function(response) {
                    console.log("Error: "+response.status + " " + response.statusText);
                });

            };
        }])

        .controller('ClubController', ['$scope', '$state', '$localStorage', 'authFactory', 'clubFactory',
          function ($scope, $state, $localStorage, authFactory, clubFactory) {
          $scope.registration = clubFactory.getClubs().get({id:authFactory.isMemberOfClub()}).$promise.then(
            function(club){
              $scope.registration = club;
              $scope.registration.kind = "" + club.kind;
              console.log($scope.registration);
            },
            function(response) {
                console.log("Error: "+response.status + " " + response.statusText);
            }
          );

          $scope.doSave = function() {
            console.log('Saving club', $scope.registration);
            clubFactory.getClubs().update({id:authFactory.isMemberOfClub()}, {
              name: $scope.registration.name,
              image: "images/verein-flag.png",
              label: $scope.registration.label,
              kind: $scope.registration.kind.split(","),
              homepage:  $scope.registration.homepage,
              googleplushandle:$scope.registration.googleplushandle,
              facebookhandle:$scope.registration.facebookhandle,
              twitterhandle:$scope.registration.twitterhandle,
              youtubehandle:$scope.registration.youtubehandle,
              description: $scope.registration.description
            }).$promise.then(function(){
              $state.go('app.clubs');
            },
            function(response) {
                console.log("Error: "+response.status + " " + response.statusText);
            });
          };
        }])

        .controller('CreateCompetitionController', ['$scope', '$stateParams', '$state', 'competitionFactory', 'clubFactory', 'authFactory', 'actionsFactory',
        function ($scope, $stateParams, $state, competitionFactory, clubFactory, authFactory, actionsFactory) {
          $scope.recalculateBudget = function() {
            $scope.competition.budget = 0;
            for(var i in $scope.competition.sponsoractions) {
              var action = $scope.competition.sponsoractions[i];
              if(action.selected) {
                var maxcost = action.costperaction * action.maxcnt;
                $scope.competition.budget += maxcost;
              }
            }
            return $scope.competition.budget;
          };

          clubFactory.getClubs().get({id:$stateParams.id}).$promise.then(
            function(club){
              $scope.club = club;
              $scope.actions = actionsFactory.getActions().query(
                function(success) {
                  $scope.actions = success;
                  $scope.competition = {
                    club: $scope.club.name,
                    clubid: $scope.club._id,
                    image: 'images/wettkampf.png',
                    name: '',
                    date : new Date().toISOString(),
                    date2 : undefined,
                    location : '',
                    kind : '' + $scope.club.kind,
                    description : '',
                    budget : 0.0,
                    sponsoractions : []
                  };
                  for(var a in $scope.actions) {
                    if($scope.actions[a]._id !== undefined) {
                      $scope.competition.sponsoractions.push(
                        {
                          action:$scope.actions[a]._id,
                          name:$scope.actions[a].name,
                          selected:true,
                          costperaction:10.0,
                          maxcnt:100
                        });
                    }
                  }
                  $scope.recalculateBudget();
                },
                function(response) {
                    console.log("Error: "+response.status + " " + response.statusText);
                });
              },
              function(response) {
                  console.log("Error: "+response.status + " " + response.statusText);
              }
            );

            $scope.doSave = function() {
                $scope.competition.sponsoractions = $scope.competition.sponsoractions.filter(function(action){return action.selected;});
                for(var i in $scope.competition.sponsoractions) {
                  $scope.competition.sponsoractions[i] = {
                    _id: $scope.competition.sponsoractions[i].action,
                    action: $scope.competition.sponsoractions[i].action,
                    costperaction: $scope.competition.sponsoractions[i].costperaction,
                    maxcnt: $scope.competition.sponsoractions[i].maxcnt
                  };
                }
                if($scope.competition.date2 === undefined ||
                  $scope.competition.date2 === '' ||
                  new Date($scope.competition.date2).toISOString() === '1970-01-01T00:00:00.000Z' ||
                  $scope.competition.date2 === $scope.competition.date) {
                  $scope.competition.dates = [new Date($scope.competition.date).toISOString()];
                }
                else {
                  $scope.competition.dates = [new Date($scope.competition.date).toISOString(), new Date($scope.competition.date2).toISOString()];
                }

                competitionFactory.getCompetitions().save({
                  clubid: $scope.competition.clubid,
                  club: $scope.competition.club,
                  image: $scope.competition.image,
                  name: $scope.competition.name,
                  location: $scope.competition.location,
                  kind: $scope.competition.kind,
                  description: $scope.competition.description,
                  budget: $scope.competition.budget,
                  sponsoractions: $scope.competition.sponsoractions,
                  dates: $scope.competition.dates
                }).$promise.then(function(wk){
                  $state.go('wkapp', {id:wk.id});
                },
                function(response) {
                    console.log("Error: "+response.status + " " + response.statusText);
                });

                //ngDialog.close();

            };
        }])

        .controller('EditCompetitionController', ['$scope', '$stateParams', '$state', 'competitionFactory', 'clubFactory', 'authFactory', 'actionsFactory',
        function ($scope, $stateParams, $state, competitionFactory, clubFactory, authFactory, actionsFactory) {
          $scope.recalculateBudget = function() {
            $scope.competition.budget = 0;
            for(var i in $scope.competition.sponsoractions) {
              var action = $scope.competition.sponsoractions[i];
              if(action.selected) {
                var maxcost = action.costperaction * action.maxcnt;
                $scope.competition.budget += maxcost;
              }
            }
            return $scope.competition.budget;
          };

          competitionFactory.getCompetitions().get({id:$stateParams.id}).$promise.then(
            function(competition){
              $scope.competition = competition;
              $scope.competition.date = new Date($scope.competition.dates[0]);
              if($scope.competition.dates.length > 1 && "1970-01-01T00:00:00.000Z" !== $scope.competition.dates[1]) {
                $scope.competition.date2 = new Date($scope.competition.dates[1]);
              }
              console.log($scope.competition);
              $scope.actions = actionsFactory.getActions().query(
                function(success) {
                  $scope.actions = success;
                  var saMaterialized = [];
                  for(var a in $scope.actions) {
                    if($scope.actions[a]._id !== undefined) {
                      var sat = $scope.actions[a];
                      var found = false;
                      for(var b in competition.sponsoractions) {
                        var sa = competition.sponsoractions[b];
                        if(sa.action === sat._id) {
                          found = true;
                          saMaterialized.push(
                            {
                              action:$scope.actions[a]._id,
                              name:$scope.actions[a].name,
                              selected:true,
                              costperaction:sa.costperaction,
                              maxcnt:sa.maxcnt
                            });
                          break;
                        }
                      }
                      if(!found) {
                        saMaterialized.push(
                          {
                            _id:$scope.actions[a]._id,
                            action:$scope.actions[a]._id,
                            name:$scope.actions[a].name,
                            selected:false,
                            costperaction:10.0,
                            maxcnt:100
                          });
                      }
                    }
                  }
                  $scope.competition.sponsoractions = saMaterialized;
                  $scope.recalculateBudget();
                },
                function(response) {
                    console.log("Error: "+response.status + " " + response.statusText);
                });
              },
              function(response) {
                  console.log("Error: "+response.status + " " + response.statusText);
              }
            );

            $scope.doSave = function() {
                $scope.competition.sponsoractions = $scope.competition.sponsoractions.filter(function(action){return action.selected;});
                for(var i in $scope.competition.sponsoractions) {
                  $scope.competition.sponsoractions[i] = {
                    _id: $scope.competition.sponsoractions[i].action,
                    action: $scope.competition.sponsoractions[i].action,
                    costperaction: $scope.competition.sponsoractions[i].costperaction,
                    maxcnt: $scope.competition.sponsoractions[i].maxcnt
                  };
                }
                if($scope.competition.date2 === undefined ||
                  $scope.competition.date2 === '' ||
                  new Date($scope.competition.date2).toISOString() === '1970-01-01T00:00:00.000Z' ||
                  $scope.competition.date2 === $scope.competition.date) {
                  $scope.competition.dates = [new Date($scope.competition.date).toISOString()];
                }
                else {
                  $scope.competition.dates = [new Date($scope.competition.date).toISOString(), new Date($scope.competition.date2).toISOString()];
                }

                competitionFactory.getCompetitions().update({id:$scope.competition._id}, {
                  clubid: $scope.competition.clubid,
                  club: $scope.competition.club,
                  image: $scope.competition.image,
                  name: $scope.competition.name,
                  location: $scope.competition.location,
                  kind: $scope.competition.kind,
                  description: $scope.competition.description,
                  budget: $scope.competition.budget,
                  sponsoractions: $scope.competition.sponsoractions,
                  dates: $scope.competition.dates
                }).$promise.then(function(wk){
                  $state.go('wkapp', {id:wk.id});
                },
                function(response) {
                    console.log("Error: "+response.status + " " + response.statusText);
                });
            };
        }])

        .controller('IndexController', ['$scope', 'clubFactory', 'sponsorFactory', 'competitionFactory', function($scope, clubFactory, sponsorFactory, competitionFactory) {

          $scope.showClub = false;
          $scope.clubmessage="Loading ...";
          $scope.club = clubFactory.getClubs().query()
            .$promise.then(
                function(response){
                    $scope.club = response[0];
                    $scope.showClub = true;
                },
                function(response) {
                    $scope.clubmessage = "Error: "+response.status + " " + response.statusText;
                }
            );

          $scope.showSponsor = false;
          $scope.sponsormessage="Loading ...";
          $scope.sponsor = sponsorFactory.getSponsors().query()
            .$promise.then(
                function(response){
                    $scope.sponsor = response[0];
                    $scope.showSponsor = true;
                },
                function(response) {
                    $scope.sponsormessage = "Error: "+response.status + " " + response.statusText;
                }
            );

          $scope.showCompetition = false;
          $scope.comptetitionmessage = "Loading ...";
          $scope.competition = competitionFactory.getCompetitions().query()
            .$promise.then(
                function(response){
                    $scope.competition = response[0];
                    $scope.showCompetition = true;
                },
                function(response) {
                    console.log("Error: "+response.status + " " + response.statusText);
                    $scope.comptetitionmessage = "Error: "+response.status + " " + response.statusText;
                }
            );

        }])

        .controller('CompetitionsController', ['$scope', 'competitionFactory', 'authFactory', function($scope, competitionFactory, authFactory) {
            $scope.tab = 1;
            $scope.filtText = '';
            $scope.showCompetition = false;
            $scope.message = "Loading ...";

            $scope.competitions = competitionFactory.getCompetitions().query(
                function(response) {
                    for(var i in response) {
                      console.log(response[i]);
                      if(response[i]._id !== undefined) {
                        response[i].editable = authFactory.isMemberOfClub() > '-1' && authFactory.isMemberOfClub() === response[i].clubid._id;
                      }
                    }
                    $scope.competitions = response;
                    $scope.showCompetition = true;
                },
                function(response) {
                    $scope.message = "Error: "+response.status + " " + response.statusText;
                });

            $scope.select = function(setTab) {
                $scope.tab = setTab;

                if (setTab === 2) {
                    $scope.filtText = "GeTu";
                }
                else if (setTab === 3) {
                    $scope.filtText = "KuTu";
                }
                else if (setTab === 4) {
                    $scope.filtText = "Other";
                }
                else {
                    $scope.filtText = "";
                }
            };

            $scope.cmpCompetition = function(actual, expected) {
              if(expected === "") {
                return true;
              }
              if(expected !== "Other") {
                return actual.kind === expected;
              }
              else if(actual.kind !== undefined) {
                if(actual.kind === "GeTu" || actual.kind === "KuTu") {
                  return false;
                }
                else {
                  return true;
                }
              }
              else {
                return false;
              }
            };

            $scope.isSelected = function (checkTab) {
                return ($scope.tab === checkTab);
            };

        }])

        .controller('ClubsController', ['$scope', 'clubFactory', 'authFactory', function($scope, clubFactory, authFactory) {

            $scope.tab = 1;
            $scope.filtText = '';
            $scope.showClub = false;
            $scope.clubmessage = "Loading ...";

            $scope.clubs = clubFactory.getClubs().query(
                function(response) {
                    for(var i in response) {
                      if(response[i]._id !== undefined) {
                        response[i].editable = authFactory.isMemberOfClub() > '-1' && authFactory.isMemberOfClub() === response[i]._id;
                      }
                    }
                    $scope.clubs = response;
                    $scope.showClub = true;
                },
                function(response) {
                    $scope.clubmessage = "Error: "+response.status + " " + response.statusText;
                });

            $scope.select = function(setTab) {
                $scope.tab = setTab;

                if (setTab === 2) {
                    $scope.filtText = "GeTu";
                }
                else if (setTab === 3) {
                    $scope.filtText = "KuTu";
                }
                else if (setTab === 4) {
                    $scope.filtText = "Other";
                }
                else {
                    $scope.filtText = "";
                }
            };

            $scope.cmpClub = function(actual, expected) {
              if(expected === "") {
                return true;
              }
              if(expected !== "Other") {
                return actual.kind === expected;
              }
              else if(actual.kind !== undefined) {
                if(actual.kind === "GeTu" || actual.kind === "KuTu") {
                  return false;
                }
                else {
                  return true;
                }
              }
              else {
                return false;
              }
            };

            $scope.isSelected = function (checkTab) {
                return ($scope.tab === checkTab);
            };
        }])

        .controller('SponsorsController', ['$scope', 'sponsorFactory', 'authFactory', function($scope, sponsorFactory, authFactory) {
            $scope.showSponsor = false;
            $scope.message = "Loading ...";
            $scope.sponsors = sponsorFactory.getSponsors().query(
                function(response) {
                    for(var i in response) {
                      console.log(response[i]);
                      if(response[i]._id !== undefined) {
                        response[i].editable = authFactory.isMemberOfSponsor() > '-1' && authFactory.isMemberOfSponsor() === response[i]._id;
                      }
                    }
                    $scope.sponsors = response;
                    $scope.showSponsor = true;
                },
                function(response) {
                    $scope.message = "Error: "+response.status + " " + response.statusText;
                });
        }])

        .controller('ClubDetailController', ['$scope', '$stateParams', 'authFactory', 'clubFactory', 'competitionFactory',
                                     function($scope, $stateParams, authFactory, clubFactory, competitionFactory) {
            $scope.clubmessage = "loading ...";
            $scope.competitionmessage = "loading ...";
            $scope.showClub = false;
            $scope.showCompetition = false;
            $scope.isClubUser = authFactory.isMemberOfClub() === $stateParams.id;
            $scope.club = clubFactory.getClubs().get({id:$stateParams.id}).$promise.then(
                function(response){
                    $scope.club = response;
                    $scope.showClub = true;
                },
                function(response) {
                    $scope.clubmessage = "Error: "+response.status + " " + response.statusText;
                }
            );
            $scope.competitions = competitionFactory.getCompetitions().query({clubid:$stateParams.id},
                function(response) {
                    for(var i in response) {
                      if(response[i].clubid !== undefined) {
                        response[i].editable = authFactory.isMemberOfClub() !== '-1' && authFactory.isMemberOfClub() === response[i].clubid;
                      }
                    }
                    $scope.competitions = response;
                    $scope.showCompetition = true;
                },
                function(response) {
                    $scope.competitionmessage = "Error: "+response.status + " " + response.statusText;
                }
            );
        }])

        .controller('SponsorDetailController', ['$scope', '$stateParams', 'authFactory', 'sponsorFactory', 'competitionFactory',
                                     function($scope, $stateParams, authFactory, sponsorFactory, competitionFactory) {
            $scope.sponsormessage = "loading ...";
            $scope.competitionmessage = "loading ...";
            $scope.showSponsor = false;
            $scope.showCompetition = false;
            console.log( $stateParams.id);
            console.log( authFactory.isMemberOfSponsor());
            $scope.isSponsorUser = authFactory.isMemberOfSponsor() === $stateParams.id;
            console.log($scope.isSponsorUser );
            $scope.sponsor = sponsorFactory.getSponsors().get({id:$stateParams.id}).$promise.then(
                function(response){
                    $scope.sponsor = response;
                    console.log(response);
                    $scope.sponsor.editable = $scope.isSponsorUser;
                    $scope.showSponsor = true;
                    $scope.competitions = competitionFactory.getCompetitions().query(
                      function(competition){
                        var filtered = [];
                        for (var j = 0; j < competition.length; j++) {
                          competition[j].editable = competition[j].clubid === authFactory.isMemberOfClub();
                          var found = false;
                          for (var i = 0; i < $scope.sponsor.sponsoractions.length; i++) {
                            for (var h = 0; h < competition[j].sponsoractions.length; h++) {
                              if ( competition[j].sponsoractions[h].action === $scope.sponsor.sponsoractions[i].action &&
                                   competition[j].sponsoractions[h].costperaction <= $scope.sponsor.sponsoractions[i].bidperaction &&
                                   competition[j].sponsoractions[h].maxcnt >= 0 && $scope.sponsor.sponsoractions[i].maxcnt >= 0) {
                                if($scope.sponsor.sponsoractions[i].kinds === undefined || $scope.sponsor.sponsoractions[i].kinds.length === 0) {
                                  filtered.push(competition[j]);
                                  found = true;
                                }
                                else {
                                  for(var k in $scope.sponsor.sponsoractions[i].kinds) {
                                    if(competition[j].kind.indexOf($scope.sponsor.sponsoractions[i].kinds[k]) > -1) {
                                      filtered.push(competition[j]);
                                      found = true;
                                    }
                                    if(found) {
                                      break;
                                    }
                                  }
                                }
                              }
                              if(found) {
                                break;
                              }
                            }
                            if(found) {
                              break;
                            }
                          }
                        }
                        $scope.competitions = filtered;
                        $scope.showCompetition = true;
                      },
                      function(response) {
                          $scope.competitionmessage = "Error: "+response.status + " " + response.statusText;
                      }
                    );
                },
                function(response) {
                    $scope.sponsormessage = "Error: "+response.status + " " + response.statusText;
                }
            );

        }])

        .controller('WKIndexController', ['$scope', '$stateParams', 'authFactory', 'clubFactory', 'sponsorFactory', 'competitionFactory', function($scope, $stateParams, authFactory, clubFactory, sponsorFactory, competitionFactory) {
          $scope.showCompetition = false;
          $scope.comptetitionmessage = "Loading ...";
          $scope.showSponsor = false;
          $scope.sponsormessage="Loading ...";
          $scope.showClub = false;
          $scope.clubmessage="Loading ...";
          $scope.competition = competitionFactory.getCompetitions().get({id:$stateParams.id})
            .$promise.then(
                function(response){
                    $scope.competition = response;
                    $scope.showCompetition = true;

                    $scope.club = clubFactory.getClubs().get({id:$scope.competition.clubid._id})
                      .$promise.then(
                          function(response){
                              $scope.club = response;
                              $scope.showClub = true;
                          },
                          function(response) {
                              $scope.clubmessage = "Error: "+response.status + " " + response.statusText;
                          }
                      );

                    $scope.sponsor = sponsorFactory.getSponsors().query(
                          function(sponsor){
                            var filtered = [];
                              for (var j = 0; j < sponsor.length; j++) {
                                sponsor[j].editable = sponsor[j]._id === authFactory.isMemberOfSponsor();
                                var found = false;
                                for (var i = 0; i < $scope.competition.sponsoractions.length; i++) {
                                  for (var h = 0; h < sponsor[j].sponsoractions.length; h++) {
                                    if ( sponsor[j].sponsoractions[h].action === $scope.competition.sponsoractions[i].action &&
                                         sponsor[j].sponsoractions[h].bidperaction >= $scope.competition.sponsoractions[i].costperaction &&
                                         sponsor[j].sponsoractions[h].maxcnt >= 0 && $scope.competition.sponsoractions[i].maxcnt >= 0) {
                                      if(sponsor[j].sponsoractions[h].kinds === undefined || sponsor[j].sponsoractions[h].kinds.length === 0) {
                                        filtered.push(sponsor[j]);
                                        found = true;
                                      }
                                      else {
                                        for(var k in sponsor[j].sponsoractions[h].kinds) {
                                          if($scope.competition.kind.indexOf(sponsor[j].sponsoractions[h].kinds[k]) > -1) {
                                            filtered.push(sponsor[j]);
                                            found = true;
                                          }
                                          if(found) {
                                            break;
                                          }
                                        }
                                      }
                                    }
                                    if(found) {
                                      break;
                                    }
                                  }
                                  if(found) {
                                    break;
                                  }
                                }
                            }
                            $scope.sponsors = filtered;
                            $scope.showSponsor = true;
                          },
                          function(response) {
                            $scope.sponsormessage = "Error: "+response.status + " " + response.statusText;
                          }
                      );
                },
                function(response) {
                    console.log("Error: "+response.status + " " + response.statusText);
                    $scope.comptetitionmessage = "Error: "+response.status + " " + response.statusText;
                }
            );
        }])
;
