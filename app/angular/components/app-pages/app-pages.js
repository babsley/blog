(function () {
    'use strict';

    angular.module('app.components')
        .component('appPages', {
            templateUrl: 'app-pages.html',
            $canActivate: canActivate,
            controller: Ctrl,
            $routeConfig: [
                {path: '/home', name: 'Home', component: 'home'},
                {path: '/posts/...', name: 'Posts', component: 'posts', useAsDefault: true},
                {path: '/', redirectTo: ['/Login']},
                {path: '/**', name: 'NotFound', component: 'notFound'},
                {path: '/404', name: 'NotFound', component: 'notFound'}
            ]
        });

    // component controller
    function Ctrl($rootRouter, authService) {
        this.logout = function () {
            authService.logout().then(()=> {
                $rootRouter.navigate(['Login']);
            });
        };

        authService.isLogged().then((result)=> {
            if (!result) {
                $rootRouter.navigate(['Login']);
            }
        })
    }

    // canActivate route
    function canActivate($rootRouter, authService) {
        return authService.isLogged().then((result)=> {
            if (!result) {
                $rootRouter.navigate(['Login']);

                return false;
            }
            return true;
        });
    }
})();