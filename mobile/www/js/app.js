// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.controllers' is found in controllers.js
angular.module('GymCompetition', ['ionic', 'ngCordova', 'GymCompetition.controllers','GymCompetition.services'])
.run(function($ionicPlatform, $rootScope, $ionicLoading, $cordovaSplashscreen, $timeout) {
  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if (window.cordova && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
      cordova.plugins.Keyboard.disableScroll(true);

    }
    if (window.StatusBar) {
      // org.apache.cordova.statusbar required
      StatusBar.styleDefault();
    }

    $timeout(function(){
      $cordovaSplashscreen.hide();
    },20000);
  });

  $rootScope.$on('loading:show', function () {
    $ionicLoading.show({
      template: '<ion-spinner></ion-spinner> Loading ...'
    })
  });

  $rootScope.$on('loading:hide', function () {
    $ionicLoading.hide();
  });

  $rootScope.$on('$stateChangeStart', function () {
    console.log('Loading ...');
    $rootScope.$broadcast('loading:show');
  });

  $rootScope.$on('$stateChangeSuccess', function () {
    console.log('done');
    $rootScope.$broadcast('loading:hide');
  });
})

.config(function($stateProvider, $urlRouterProvider) {
  $stateProvider

  .state('app', {
    url: '/app',
    abstract: true,
    templateUrl: 'templates/sidebar.html',
    controller: 'AppCtrl'
  })

  .state('app.home', {
    url: '/home',
    views: {
      'mainContent': {
        templateUrl: 'templates/home.html',
        controller: 'IndexController',
        resolve: {
          competition: ['competitionFactory', function(competitionFactory){
            return competitionFactory.getNextCompetition().get();
          }],
          club: ['clubFactory', function(clubFactory) {
            return clubFactory.getClubOfMonth().get();
          }],
          sponsor: ['sponsorFactory', function(sponsorFactory) {
            return sponsorFactory.getSponsorOfMotnh().get();
          }]
        }
      }
    }
  })

  .state('app.competitions', {
    url: '/competitions',
    views: {
      'mainContent': {
        templateUrl: 'templates/competitions.html',
        controller: 'CompetitionsController',
        resolve: {
          competitions: ['competitionFactory', function(competitionFactory){
            return competitionFactory.getCompetitions().query();
          }]
        }
      }
    }
  })

  .state('app.favorites', {
     url: '/favorites',
     views: {
       'mainContent': {
          templateUrl: 'templates/favorites.html',
          controller:'FavoritesController',
          resolve: {
            competitions: ['competitionFactory', function(competitionFactory){
              return competitionFactory.getCompetitions().query();
            }],
            favorites: ['favoriteFactory', function(favoriteFactory) {
              return favoriteFactory.getFavorites();
            }]
          }
        }
      }
    })

  .state('app.competitiondetails', {
    url: '/competitiondetails/:id',
    views: {
      'mainContent': {
        templateUrl: 'templates/competition.html',
        controller: 'CompetitionController',
        resolve: {
          competition: ['$stateParams','competitionFactory', function($stateParams, competitionFactory){
            return competitionFactory.getCompetitions().get({id: $stateParams.id});
          }]
        }
      }
    }
  })

  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('/app/home');

});
