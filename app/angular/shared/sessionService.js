(function () {
    'use strict';

    angular.module('app.shared').factory('sessionService', ($sessionStorage)=> {
        return {
            get: function (key) {
                return $sessionStorage.get(key);
            },
            set: function (key, value) {
                return $sessionStorage.put(key, value);
            },
            remove: function (key) {
                return $sessionStorage.remove(key);
            }
        }
    })
})();