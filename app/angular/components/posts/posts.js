(function () {
    'use strict';

    angular.module('app.components').component('posts', {
        templateUrl: 'posts.html',
        bindings: {
            $router: '<'
        },
        $routeConfig: [
            {path: '/:page', name: 'PostsList', component: 'postsList'},
            {path: '/:page/:id', name: 'PostDetail', component: 'postItem'},
            {path: '/create', name: 'PostCreate', data: {behavior: 'create'}, component: 'postItem'},
            {path: '/:page/edit/:id', name: 'PostEdit', data: {behavior: 'edit'}, component: 'postItem'},
            {path: '/', redirectTo: ['PostsList', {page: 1}]}
        ]
    });
})();