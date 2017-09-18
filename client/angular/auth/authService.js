(function () {
  'use strict';

  angular.module('app.auth', [])
    .factory('authService', ($http, sessionService) => {
      return {
        login: (data) => {
          return $http.post('/api/users/login', data).then((response) => {
            if (!response.data.auth) {
              return false;
            }

            sessionService.set('userRole', response.data.role);

            return response.data.auth;

          });
        },
        logout: () => {
          return $http.get('/api/users/logout').then((response) => {
            if (!response.data.logout) {
              return false;
            }

            sessionService.remove('userRole');

            return response.data.logout;
          });
        },
        isLogged: () => {
          return $http.get('/api/users/login').then((response) => {
            if (!response.data.session) {
              return false;
            }

            sessionService.set('userRole', response.data.role);

            return response.data.session;
          });
        }
      }
    });
})();