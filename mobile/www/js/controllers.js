angular.module('GymCompetition.controllers', [])

.controller('AppCtrl', function ($scope, $ionicModal, $timeout, $localStorage,
                                 $ionicPlatform, $cordovaCamera,
                                 // Task 1: inject the $cordovaImagePicker.
                                 $cordovaImagePicker) {

  // With the new view caching in Ionic, Controllers are only called
  // when they are recreated or on app start, instead of every page change.
  // To listen for when this page is active (for example, to refresh data),
  // listen for the $ionicView.enter event:
  //$scope.$on('$ionicView.enter', function(e) {
  //});

  // Form data for the login modal
  $scope.loginData = $localStorage.getObject('userinfo','{}');

  // Create the login modal that we will use later
  $ionicModal.fromTemplateUrl('templates/login.html', {
    scope: $scope
  }).then(function(modal) {
    $scope.modal = modal;
  });

  // Triggered in the login modal to close it
  $scope.closeLogin = function() {
    $scope.modal.hide();
  };

  // Open the login modal
  $scope.login = function() {
    $scope.modal.show();
  };

  // Perform the login action when the user submits the login form
  $scope.doLogin = function () {
    console.log('Doing login', $scope.loginData);
    $localStorage.storeObject('userinfo',$scope.loginData);

    // Simulate a login delay. Remove this and replace with your login
    // code if using a login system
    $timeout(function() {
      $scope.closeLogin();
    }, 1000);
  };

  $scope.registration = {};
  // Create the registration modal that we will use later
  $ionicModal.fromTemplateUrl('templates/register.html', {
      scope: $scope
  }).then(function (modal) {
      $scope.registerform = modal;
  });

  // Triggered in the registration modal to close it
  $scope.closeRegister = function () {
      $scope.registerform.hide();
  };

  // Open the registration modal
  $scope.register = function () {
      $scope.registerform.show();
  };

  // Perform the registration action when the user submits the registration form
  $scope.doRegister = function () {
      console.log('Doing reservation', $scope.reservation);

      // Simulate a registration delay. Remove this and replace with your registration
      // code if using a registration system
      $timeout(function () {
          $scope.closeRegister();
      }, 1000);
  };
  $ionicPlatform.ready(function() {
    var options = {};
    if (typeof(Camera) !== 'undefined') {
      options = {
          quality: 50,
          destinationType: Camera.DestinationType.DATA_URL,
          sourceType: Camera.PictureSourceType.CAMERA,
          allowEdit: true,
          encodingType: Camera.EncodingType.JPEG,
          targetWidth: 100,
          targetHeight: 100,
          popoverOptions: CameraPopoverOptions,
          saveToPhotoAlbum: false
      };
    }
    $scope.takePicture = function() {
      if (typeof(Camera) !== 'undefined') {
        $cordovaCamera.getPicture(options).then(function(imageData) {
          $scope.registration.imgSrc = "data:image/jpeg;base64," + imageData;
        }, function(err) {
          console.log(err);
        });
      }
      $scope.registerform.show();
    };

    // Task 1: The Image Picker plugin will enable you to select a picture from
    //         the picture gallery and add it to the registration page.
    var pickoptions = {
      maximumImagesCount: 1,
      width: 100,
      height: 100,
      quality: 50
    };
    $scope.pickPicture = function() {
      if (typeof($cordovaImagePicker) !== 'undefined') {
        $cordovaImagePicker.getPictures(pickoptions).then(function(imageData) {
          for (var i = 0; i < imageData.length; i++) {
            $scope.registration.imgSrc = imageData[i];
          }
        }, function(err) {
          console.log(err);
        });
        $scope.registerform.show();
      }
    };
  });
})

.controller('CompetitionsController', ['$scope', 'competitions', 'favoriteFactory', 'baseURL', '$ionicListDelegate', '$ionicPlatform', '$cordovaLocalNotification', '$cordovaToast',
                     function ($scope, competitions, favoriteFactory, baseURL, $ionicListDelegate, $ionicPlatform, $cordovaLocalNotification, $cordovaToast) {
    $scope.baseURL = baseURL;
    $scope.tab = 1;
    $scope.filtText = '';
    $scope.showDetails = false;
    $scope.competitions = competitions;

    $scope.addFavorite = function (index) {
        console.log("fav comp id is " + index);
        favoriteFactory.addToFavorites(competitions[index]._id);
        $ionicListDelegate.closeOptionButtons();
        $ionicPlatform.ready(function () {
          try {
            $cordovaLocalNotification.schedule({
                id: 1,
                title: "Added Favorite",
                text: $scope.competitions[index].name
            }).then(function () {
                console.log('Added Favorite '+$scope.competitiones[index].name);
            },
            function () {
                console.log('Failed to add Notification ');
            });

            $cordovaToast
            .show('Added Favorite '+$scope.competitions[index].name, 'long', 'center')
            .then(function (success) {
                // success
            }, function (error) {
                // error
            });
          }
          catch(e) {
            console.log(e);
          }
        });
    }

    $scope.select = function(setTab) {
        $scope.tab = setTab;

        if (setTab === 2) {
            $scope.filtText = "KuTu";
        }
        else if (setTab === 3) {
            $scope.filtText = "GeTu";
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

.controller('FavoritesController',
  ['$scope', 'competitionFactory', 'favoriteFactory', 'favorites', 'competitions', 'baseURL',
    '$ionicListDelegate', '$ionicPopup', '$ionicLoading', '$timeout',
    '$cordovaVibration', '$ionicPlatform', // Task 3: add vibration on removing an item from the favorites
  function ($scope, competitionFactory, favoriteFactory, favorites, competitions, baseURL,
    $ionicListDelegate, $ionicPopup, $ionicLoading, $timeout,
    $cordovaVibration, $ionicPlatform // Task 3: add vibration on removing an item from the favorites
  ) {

  $scope.baseURL = baseURL;
  $scope.shouldShowDelete = false;

  $scope.favorites = favorites;
  $scope.competitions = competitions.$promise.then(function(c, err){
    $scope.competitions = c;
  });

  console.log($scope.competitions, $scope.favorites);

  $scope.toggleDelete = function () {
      $scope.shouldShowDelete = !$scope.shouldShowDelete;
      console.log($scope.shouldShowDelete);
  };

  $scope.deleteFavorite = function (index) {

    var confirmPopup = $ionicPopup.confirm({
      title: 'Confirm Delete',
      template: 'Are you sure you want to delete this item?'
    });

    confirmPopup.then(function (res) {
      if (res) {
        console.log('Ok to delete');
        favoriteFactory.deleteFromFavorites(index);

        // Task 3: add vibration on removing an item from the favorites
        $ionicPlatform.ready(function(){
          try {
            $cordovaVibration.vibrate(100);
            console.log('vibrated on delete');
          }
          catch(e) {
            console.log('no vibration feature available');
          }
        });
      }
      else {
        console.log('Canceled delete');
      }
    });

    $scope.shouldShowDelete = false;
  }
}])

.controller('CompetitionController',
  ['$scope', '$stateParams', 'competition', 'favoriteFactory', 'competitionFactory', 'baseURL', '$ionicPopover', '$ionicModal',
   '$cordovaLocalNotification', '$cordovaToast', // Task 2 Give userfeedback via notification and toaster
    function($scope, $stateParams, competition, favoriteFactory, competitionFactory, baseURL, $ionicPopover, $ionicModal,
      $cordovaLocalNotification, $cordovaToast // Task 2 Give userfeedback via notification and toaster
    ) {

      $scope.baseURL = baseURL;
      $scope.competition = competition;
      $scope.cathegory = "K1";
      $scope.allresults = {"K1": [
          {rang: 1, name: "Jeff Walker", e: 12.4, d: 2.5, end: 42.3}
        , {rang: 2, name: "Mit Meyer", e: 12.4, d: 2.5, end: 42.3}
        , {rang: 3, name: "Rob Hiller", e: 12.4, d: 2.5, end: 42.3}
        , {rang: 4, name: "Caro Goldy", e: 12.4, d: 2.5, end: 42.3}
        , {rang: 5, name: "Phil Collo", e: 12.4, d: 2.5, end: 42.3}
        , {rang: 6, name: "Mey Anders", e: 12.4, d: 2.5, end: 42.3}
        , {rang: 7, name: "Clari Jefferson", e: 12.4, d: 2.5, end: 42.3}
        , {rang: 8, name: "Maya Hiker", e: 12.4, d: 2.5, end: 42.3}
      ],
      "K2": [
          {rang: 1, name: "Jeff Walker", e: 12.4, d: 2.5, end: 42.3}
        , {rang: 3, name: "Rob Hiller", e: 12.4, d: 2.5, end: 42.3}
        , {rang: 2, name: "Mit Meyer", e: 12.4, d: 2.5, end: 42.3}
        , {rang: 4, name: "Caro Goldy", e: 12.4, d: 2.5, end: 42.3}
        , {rang: 6, name: "Mey Anders", e: 12.4, d: 2.5, end: 42.3}
        , {rang: 5, name: "Phil Collo", e: 12.4, d: 2.5, end: 42.3}
        , {rang: 7, name: "Clari Jefferson", e: 12.4, d: 2.5, end: 42.3}
        , {rang: 8, name: "Maya Hiker", e: 12.4, d: 2.5, end: 42.3}
      ],
      "K3": [
          {rang: 1, name: "Jeff Walker", e: 12.4, d: 2.5, end: 42.3}
        , {rang: 5, name: "Phil Collo", e: 12.4, d: 2.5, end: 42.3}
        , {rang: 2, name: "Mit Meyer", e: 12.4, d: 2.5, end: 42.3}
        , {rang: 3, name: "Rob Hiller", e: 12.4, d: 2.5, end: 42.3}
        , {rang: 7, name: "Clari Jefferson", e: 12.4, d: 2.5, end: 42.3}
        , {rang: 4, name: "Caro Goldy", e: 12.4, d: 2.5, end: 42.3}
        , {rang: 6, name: "Mey Anders", e: 12.4, d: 2.5, end: 42.3}
        , {rang: 8, name: "Maya Hiker", e: 12.4, d: 2.5, end: 42.3}
      ],
      "K4": [
          {rang: 1, name: "Jeff Walker", e: 12.4, d: 2.5, end: 42.3}
          , {rang: 7, name: "Clari Jefferson", e: 12.4, d: 2.5, end: 42.3}
          , {rang: 8, name: "Maya Hiker", e: 12.4, d: 2.5, end: 42.3}
        , {rang: 2, name: "Mit Meyer", e: 12.4, d: 2.5, end: 42.3}
        , {rang: 3, name: "Rob Hiller", e: 12.4, d: 2.5, end: 42.3}
        , {rang: 4, name: "Caro Goldy", e: 12.4, d: 2.5, end: 42.3}
        , {rang: 5, name: "Phil Collo", e: 12.4, d: 2.5, end: 42.3}
        , {rang: 6, name: "Mey Anders", e: 12.4, d: 2.5, end: 42.3}
      ],
      "K5": [
          {rang: 1, name: "Jeff Walker", e: 12.4, d: 2.5, end: 42.3}
        , {rang: 2, name: "Mit Meyer", e: 12.4, d: 2.5, end: 42.3}
        , {rang: 3, name: "Rob Hiller", e: 12.4, d: 2.5, end: 42.3}
        , {rang: 6, name: "Mey Anders", e: 12.4, d: 2.5, end: 42.3}
        , {rang: 4, name: "Caro Goldy", e: 12.4, d: 2.5, end: 42.3}
        , {rang: 5, name: "Phil Collo", e: 12.4, d: 2.5, end: 42.3}
        , {rang: 7, name: "Clari Jefferson", e: 12.4, d: 2.5, end: 42.3}
        , {rang: 8, name: "Maya Hiker", e: 12.4, d: 2.5, end: 42.3}
      ],
      "K6": [
          {rang: 3, name: "Rob Hiller", e: 12.4, d: 2.5, end: 42.3}
        , {rang: 2, name: "Mit Meyer", e: 12.4, d: 2.5, end: 42.3}
        , {rang: 1, name: "Jeff Walker", e: 12.4, d: 2.5, end: 42.3}
        , {rang: 4, name: "Caro Goldy", e: 12.4, d: 2.5, end: 42.3}
        , {rang: 5, name: "Phil Collo", e: 12.4, d: 2.5, end: 42.3}
        , {rang: 6, name: "Mey Anders", e: 12.4, d: 2.5, end: 42.3}
        , {rang: 7, name: "Clari Jefferson", e: 12.4, d: 2.5, end: 42.3}
        , {rang: 8, name: "Maya Hiker", e: 12.4, d: 2.5, end: 42.3}
      ],
      "K7": [
          {rang: 8, name: "Maya Hiker", e: 12.4, d: 2.5, end: 42.3}
        , {rang: 1, name: "Jeff Walker", e: 12.4, d: 2.5, end: 42.3}
        , {rang: 2, name: "Mit Meyer", e: 12.4, d: 2.5, end: 42.3}
        , {rang: 3, name: "Rob Hiller", e: 12.4, d: 2.5, end: 42.3}
        , {rang: 4, name: "Caro Goldy", e: 12.4, d: 2.5, end: 42.3}
        , {rang: 5, name: "Phil Collo", e: 12.4, d: 2.5, end: 42.3}
        , {rang: 6, name: "Mey Anders", e: 12.4, d: 2.5, end: 42.3}
        , {rang: 7, name: "Clari Jefferson", e: 12.4, d: 2.5, end: 42.3}
      ]};
      $scope.results = $scope.allresults[$scope.cathegory];

          $scope.select = function(setTab) {
              $scope.cathegory = setTab;
              $scope.results = $scope.allresults[$scope.cathegory];
          };

          $scope.isSelected = function (checkTab) {
              return ($scope.cathegory === checkTab);
          };

      $ionicPopover.fromTemplateUrl('templates/competition-popover.html', {
        scope: $scope
      }).then(function(popover) {
        $scope.popover = popover;
      });
      // handle click-event from competitiondetail.html header-button
      $scope.showPopover = function($event) {
        $scope.popover.show($event);
      };
      //suggested from the ionic website:
      //Cleanup the popover when we're done with it!
      $scope.$on('$destroy', function() {
        $scope.popover.remove();
      });

      $scope.addFavorite = function () {
        favoriteFactory.addToFavorites($scope.competition._id);
        $scope.popover.hide();

         // Task 2 Give userfeedback via notification and toaster
        try {
          $cordovaLocalNotification.schedule({
              id: 1,
              title: "Added Favorite",
              text: $scope.competition.name
          }).then(function () {
              console.log('Added Favorite '+$scope.competition.name);
          },
          function (error) {
              console.log('Failed to add Notification ' + error);
          });
        }
        catch(e) {
          console.log('Notification not supported for adding a favorite '+$scope.competition.name);
        }

        try {
          $cordovaToast.show('Added Favorite '+$scope.competition.name, 'long', 'bottom');
        }
        catch(e) {
          console.log('Toaster not supported for adding a favorite '+$scope.competition.name);
        }
      };
    }
  ]
)

// implement the IndexController and About Controller here

.controller('IndexController', ['$scope', 'competition', 'club', 'sponsor', 'baseURL',
  function($scope, competition, club, sponsor, baseURL) {
    $scope.baseURL = baseURL;
    $scope.competition = competition;
    $scope.club = club;
    $scope.sponsor = sponsor;
}])

.filter('favoriteFilter', function () {
    return function (competitions, favorites) {
        var out = [];
        for (var i = 0; i < favorites.length; i++) {
            for (var j = 0; j < competitions.length; j++) {
                if (competitions[j]._id === favorites[i].id)
                    out.push(competitions[j]);
            }
        }
        return out;

    }});

;
