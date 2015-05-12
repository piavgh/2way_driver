// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
angular.module('driver2way', ['ionic', 'ui.router', 'globaltpl', 'driver2way.controllers', 'driver2way.services', 'ngCordova'])

    .run(function ($ionicPlatform, $rootScope) {

        $rootScope.config = {
            url: 'http://hmac.nhahang.bz/v1'
        };

        $ionicPlatform.ready(function () {
            // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
            // for form inputs)
            if (window.cordova && window.cordova.plugins.Keyboard) {
                cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
            }
            if (window.StatusBar) {
                StatusBar.styleDefault();
            }
        });
    })

    .config(function ($stateProvider, $urlRouterProvider) {
        $stateProvider

            // setup an abstract state for the tabs directive
            .state('tab', {
                url: "/tab",
                abstract: true,
                templateUrl: "templates/tabs.html",
                controller: 'TabCtrl'
            })

            .state('login', {
                url: '/login',
                templateUrl: 'templates/login.html',
                controller: 'LoginCtrl'
            })

            .state('tab.profile', {
                url: '/profile',
                views: {
                    'menuContent': {
                        templateUrl: 'templates/profile.html',
                        controller: 'ProfileCtrl'
                    }
                }
            })

            .state('tab.chance', {
                url: '/chance',
                views: {
                    'menuContent': {
                        templateUrl: 'templates/chance.html',
                        controller: 'ChanceCtrl'
                    }
                }
            })

            .state('tab.working', {
                url: '/working',
                views: {
                    'menuContent': {
                        templateUrl: 'templates/working.html',
                        controller: 'WorkingCtrl'
                    }
                }
            })

            .state('tab.history', {
                url: '/history',
                views: {
                    'menuContent': {
                        templateUrl: 'templates/history.html',
                        controller: 'HistoryCtrl'
                    }
                }
            })

            .state('tab.requestDetail', {
                url: '/requestDetail/:id',
                views: {
                    'menuContent': {
                        templateUrl: 'templates/requestDetail.html',
                        controller: 'RequestDetailCtrl'
                    }
                }
            })

            .state('tab.workingDetail', {
                url: '/workingDetail/:id',
                views: {
                    'menuContent': {
                        templateUrl: 'templates/workingDetail.html',
                        controller: 'WorkingDetailCtrl'
                    }
                }
            })

            .state('tab.historyDetail', {
                url: '/historyDetail/:id',
                views: {
                    'menuContent': {
                        templateUrl: 'templates/historyDetail.html',
                        controller: 'HistoryDetailCtrl'
                    }
                }
            })

            .state('tab.cardCharge', {
                url: '/cardCharge',
                views: {
                    'menuContent': {
                        templateUrl: 'templates/cardCharge.html',
                        controller: 'CardChargeCtrl'
                    }
                }
            })

            .state('tab.cardManage', {
                url: '/cardManage',
                views: {
                    'menuContent': {
                        templateUrl: 'templates/cardManage.html',
                        controller: 'CardManageCtrl'
                    }
                }
            })

            .state('tab.about', {
                url: '/about',
                views: {
                    'menuContent': {
                        templateUrl: 'templates/about.html'
                    }
                }
            })

        // if none of the above states are matched, use this as the fallback
        $urlRouterProvider.otherwise('/login');

    });
