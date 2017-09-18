(function () {
  'use strict';

  angular.module('app.services').factory('postsService', ($http) => {
    return {
      get: (id) => {
        return $http.get('api/posts/' + id)
          .then((response) => {
            return response.data;
          })
      },
      put: (id, data) => {
        return $http.put('api/posts/' + id, dataPrep(data), {
          transformRequest: angular.identity,
          headers: {'Content-Type': undefined}
        }).then((response) => {
          return response;
        })
      },
      remove: (id) => {
        return $http.delete('api/posts/' + id).then((response) => {
          return response;
        });
      },
      create: (data) => {
        return $http.post('api/posts', dataPrep(data), {
          transformRequest: angular.identity,
          headers: {'Content-Type': undefined}
        }).then((response) => {
          return response;
        })
      },
      getList: (page = 1, limit = 9) => {
        return $http.get('api/posts?limit=' + limit + '&page=' + page).then((response) => {
          return response.data;
        });
      }
    }
  });

  function dataPrep(data) {
    let fd = new FormData();

    for (let key in data) {
      fd.append(key, data[key]);
    }

    return fd;
  }
})();