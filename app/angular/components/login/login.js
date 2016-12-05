(function () {
    'use strict';

    angular.module('app.components')
        .component('login', {
            templateUrl: 'login.html',
            controller: Ctrl,
            $canActivate: canActivate
        });

    // component's controller
    function Ctrl(authService, $rootRouter) {
        this.credentials = {
            name: '',
            password: ''
        };

        this.submited = false;
        
        this.error = {
            status: false,
            message: ''
        };

        this.login = function (data) {
            if (this.submited) {
                return false;
            }
            this.submited = true;

            authService.login(data).then(
                (result)=> {
                    if (result) {
                        $rootRouter.navigate(['AppPages']);
                    }
                },
                (err)=> {
                    this.error.status = true;

                    if (err.status == 401) {
                        this.error.message = 'Username or password is incorrect'
                    }

                    this.submited = false;
                }
            );
        };
    }

    // canActivate route
    function canActivate(authService, $rootRouter) {
        return authService.isLogged().then((result)=> {
            if (result) {
                $rootRouter.navigate(['AppPages']);
                return false;
            }

            return true;
        });
    }
})();