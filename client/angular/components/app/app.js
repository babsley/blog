(function () {
    'use strict';

    angular.module('app.components').component('app', {
        template: '<ng-outlet></ng-outlet>',
        $routeConfig: [
            {path: '/...', name: 'AppPages', component: 'appPages'},
            {path: '/login', name: 'Login', component: 'login', useAsDefault: true}
        ]
    });
})();

