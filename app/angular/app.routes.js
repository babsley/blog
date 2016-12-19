'use strict';

angular.module('app.routes')
    .config(function ($locationProvider) {
        if (window.history && window.history.pushState) {
            $locationProvider.html5Mode(true);
        }
    })
    .value('$routerRootComponent', 'app');


