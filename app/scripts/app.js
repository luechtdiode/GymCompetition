'use strict';

angular.module('gymCompetitionApp', ['ui.router', 'ui.bootstrap', 'ngAnimate', 'ngTouch', 'ngResource'])
  .config(function($stateProvider, $urlRouterProvider) {
    $stateProvider

    // route for the home page
    .state('app', {
      url:'/',
      views: {
        'header': {
          templateUrl : 'views/header.html',
          controller  : 'HeaderController'
        },
        'content': {
          templateUrl : 'views/home.html',
          controller  : 'IndexController'
        },
        'footer': {
          templateUrl : 'views/footer.html',
        }
      }

    })

    .state('wkapp', {
      url:'/wk_:id',
      views: {
        'header': {
          templateUrl : 'views/wkheader.html',
        },
        'content': {
          templateUrl : 'views/wkhome.html',
          controller  : 'WKIndexController'
        },
        'footer': {
          templateUrl : 'views/wkfooter.html',
        }
      }

    })

    // route for the competitions page
    .state('app.competitions', {
      url: 'competitions',
      views: {
        'content@': {
          templateUrl : 'views/competitions.html',
          controller  : 'CompetitionsController'
        }
      },
      breadcrumb: {
          title: 'Competitions'
      }
    })
    // route for the clubs page
    .state('app.clubs', {
      url: 'clubs',
      views: {
        'content@': {
          templateUrl : 'views/clubs.html',
          controller  : 'ClubsController'
        }
      },
      breadcrumb: {
        title: 'Clubs'
      }
    })

    .state('app.clubdetails', {
      url: '/clubdetails/:id',
      views: {
        'content@': {
          templateUrl: 'views/clubdetails.html',
          controller: 'ClubDetailController'/*,
          resolve: {
            club: ['$stateParams','clubFactory', function($stateParams, clubFactory){
              return clubFactory.get({id:$stateParams.id});
            }],
            competitions: ['$stateParams','competitionFactory', function($stateParams, competitionFactory){
              return competitionFactory.query({clubid:parseInt($stateParams.id, 10)});
            }]
          }*/
        }
      }
    })

    .state('app.sponsordetails', {
      url: '/sponsordetails/:id',
      views: {
        'content@': {
          templateUrl: 'views/sponsordetails.html',
          controller: 'SponsorDetailController'
        }
      }
    })

    .state('app.createcompetition', {
      url: '/createcompetition/:id',
      views: {
        'content@': {
          templateUrl: 'views/createcompetition.html',
          controller: 'CreateCompetitionController'
        }
      },
      breadcrumb: {
          title: 'Create Competition'
      }
    })

    // route for the sponsors page
    .state('app.sponsors', {
      url: 'sponsors',
      views: {
        'content@': {
          templateUrl : 'views/sponsors.html',
          controller  : 'SponsorsController'
        }
      },
      breadcrumb: {
          title: 'Sponsors'
      }
    })

    // route for the sponsors page
    .state('app.aboutus', {
      url: 'aboutus',
      views: {
        'content@': {
          templateUrl : 'views/aboutus.html',
          controller  : 'AboutController'
        }
      },
      breadcrumb: {
          title: 'About us'
      }
    })

    // route for the login page
    .state('app.login', {
      url: 'login',
      views: {
        'content@': {
          templateUrl : 'views/login.html',
          controller  : 'LoginController'
        }
      },
      breadcrumb: {
          title: 'Login'
      }
    })

    // route for the club-register page
    .state('app.registerclub', {
      url: 'registerclub',
      views: {
        'content@': {
          templateUrl : 'views/register-club.html',
          controller  : 'RegisterController'
        }
      },
      breadcrumb: {
          title: 'Register as new Club'
      }
    })

    // route for the sponsor-register page
    .state('app.registersponsor', {
      url: 'registersponsor',
      views: {
        'content@': {
          templateUrl : 'views/register-sponsor.html',
          controller  : 'RegisterController'
        }
      },
      breadcrumb: {
          title: 'Register as new Sponsor'
      }
    })

    // route for the sponsor-edit page
    .state('app.editsponsor', {
      url: 'editsponsor',
      views: {
        'content@': {
          templateUrl : 'views/edit-sponsor.html',
          controller  : 'SponsorController'
        }
      },
      resolve: {
        sponsor: ['authFactory', 'sponsorFactory', function(authFactory, sponsorFactory) {
            return sponsorFactory.getSponsors().get({id:authFactory.isMemberOfSponsor});
        }]
      },
      breadcrumb: {
          title: 'Edit Sponsor details {sponsor.name}'
      }
    })

    // route for the sponsor-edit page
    .state('app.editclub', {
      url: 'editclub',
      views: {
        'content@': {
          templateUrl : 'views/edit-club.html',
          controller  : 'ClubController'
        }
      }
    })

    // route for the sponsor-edit page
    .state('app.editcompetition', {
      url: 'editcompetition/:id',
      views: {
        'content@': {
          templateUrl : 'views/edit-competition.html',
          controller  : 'EditCompetitionController'
        }
      }
    })

    ;

    $urlRouterProvider.otherwise('/');
  })
;
