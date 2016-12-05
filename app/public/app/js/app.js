'use strict';

angular.module('app', ['app.routes', 'app.components', 'app.services', 'app.auth', 'app.shared']);

angular.module('app.routes', ['ngComponentRouter']);
angular.module('app.components', ['ngMessages']);
angular.module('app.services', []);
angular.module('app.shared', ['ngSessionStorage']);
'use strict';

angular.module('app.routes').config(["$locationProvider", function ($locationProvider) {
    if (window.history && window.history.pushState) {
        $locationProvider.html5Mode(true);
    }
}]).value('$routerRootComponent', 'app');
'use strict';

(function () {
    'use strict';

    angular.module('app.auth', []).factory('authService', ["$http", "sessionService", function ($http, sessionService) {
        return {
            login: function login(data) {
                return $http.post('/api/auth', data).then(function (response) {
                    if (!response.data.auth) {
                        return false;
                    }

                    sessionService.set('userRole', response.data.role);

                    return response.data.auth;
                });
            },
            logout: function logout() {
                return $http.delete('/api/auth').then(function (response) {
                    if (!response.data.logout) {
                        return false;
                    }

                    sessionService.remove('userRole');

                    return response.data.logout;
                });
            },
            isLogged: function isLogged() {
                return $http.get('/api/auth').then(function (response) {
                    if (!response.data.session) {
                        return false;
                    }

                    sessionService.set('userRole', response.data.role);

                    return response.data.session;
                });
            }
        };
    }]);
})();
'use strict';

(function () {
    'use strict';

    angular.module('app.shared').directive('backImg', function () {
        return {
            restrict: 'A',
            link: function link($scope, element, $attrs) {
                $attrs.$observe('backImg', function (url) {
                    element.css({
                        'background-image': 'url(' + url + ')'
                    });
                });
            }
        };
    });
})();
'use strict';

(function () {
    'use strict';

    angular.module('app.shared').component('confirm', {
        template: '<div ng-class="$ctrl.show ? \'open\':\'\'" class="popup">\n                        <div class="popup-content">\n                            <p class="popup-title">Are you sure?</p>\n                            <button ng-click="$ctrl.confirm()" class="btn btn--success">Yes</button>\n                            <button ng-click="$ctrl.cancel()" class="btn btn--warning">No</button>\n                        </div>\n                   </div>',
        bindings: {
            callback: '='
        },
        controller: Ctrl
    });

    function Ctrl() {
        var _this = this;

        this.fn = null;
        this.show = false;
        this.open = function (fn) {
            _this.fn = fn;
            _this.show = true;
        };

        this.confirm = function () {
            if (!_this.fn) {
                throw {
                    name: 'confirm component',
                    message: 'fn() not found'
                };
            }

            if (typeof _this.fn != 'function') {
                throw {
                    name: 'confirm component',
                    message: 'fn() not function'
                };
            }

            _this.fn();
            _this.show = false;
        };

        this.cancel = function () {
            _this.fn = null;
            _this.show = false;
        };

        this.callback = this.open;
    }
})();
'use strict';

(function () {
    'use strict';

    Ctrl.$inject = ["$element", "$scope"];
    angular.module('app.shared').component('fileRead', {
        template: '<p>\n                        <span>File : </span> \n                        <a class="file-read_remove" ng-if="$ctrl.fileName" ng-click="$ctrl.remove()" ng-href="#"><i class="icon fa fa-times"></i> </a> \n                        {{$ctrl.fileName}}\n                   </p>\n                   <input type="file">\n                   <div class="ng-transclude"></div>',
        require: {
            ngModel: 'ngModel'
        },
        transclude: true,
        bindings: {
            fileReadCb: '<',
            mimeTypes: '<'
        },
        controller: Ctrl
    });

    function Ctrl($element, $scope) {
        var _this = this;

        var elem = angular.element($element[0].querySelector('[type="file"]'));

        this.fileName = null;

        if (!Array.isArray(this.mimeTypes)) {
            this.mimeTypes = [this.mimeTypes];
        }

        this.remove = function () {
            elem[0].value = '';
            this.fileName = null;
            this.ngModel.$setViewValue(null);
            this.fileReadCb();
        };

        elem.on('change', function (event) {
            _this.ngModel.$setDirty();
            _this.ngModel.$setTouched();

            var isValidMimeType = null;
            var file = event.target.files[0];

            if (file) {
                isValidMimeType = _this.mimeTypes.some(function (type) {
                    return type === file.type;
                });

                if (!isValidMimeType) {
                    file = null;
                    _this.ngModel.$setValidity('mimeTypes', false);
                } else {
                    _this.ngModel.$setValidity('mimeTypes', true);
                }
            } else {
                _this.ngModel.$setValidity('mimeTypes', true);
            }

            _this.fileName = file ? file.name : null;

            _this.ngModel.$setViewValue(file);

            _this.fileReadCb();
        });
    }
})();
'use strict';

(function () {
    'use strict';

    angular.module('app.shared').factory('sessionService', ["$sessionStorage", function ($sessionStorage) {
        return {
            get: function get(key) {
                return $sessionStorage.get(key);
            },
            set: function set(key, value) {
                return $sessionStorage.put(key, value);
            },
            remove: function remove(key) {
                return $sessionStorage.remove(key);
            }
        };
    }]);
})();
'use strict';

(function () {
    'use strict';

    angular.module('app.components').component('app', {
        template: '<ng-outlet></ng-outlet>',
        $routeConfig: [{ path: '/...', name: 'AppPages', component: 'appPages' }, { path: '/login', name: 'Login', component: 'login', useAsDefault: true }]
    });
})();
'use strict';

(function () {
    'use strict';

    Ctrl.$inject = ["$rootRouter", "authService"];
    angular.module('app.components').component('appPages', {
        templateUrl: 'app-pages.html',
        $canActivate: canActivate,
        controller: Ctrl,
        $routeConfig: [{ path: '/home', name: 'Home', component: 'home' }, { path: '/posts/...', name: 'Posts', component: 'posts', useAsDefault: true }, { path: '/', redirectTo: ['/Login'] }, { path: '/**', name: 'NotFound', component: 'notFound' }, { path: '/404', name: 'NotFound', component: 'notFound' }]
    });

    // component controller
    function Ctrl($rootRouter, authService) {
        this.logout = function () {
            authService.logout().then(function () {
                $rootRouter.navigate(['Login']);
            });
        };

        authService.isLogged().then(function (result) {
            if (!result) {
                $rootRouter.navigate(['Login']);
            }
        });
    }

    // canActivate route
    function canActivate($rootRouter, authService) {
        return authService.isLogged().then(function (result) {
            if (!result) {
                $rootRouter.navigate(['Login']);

                return false;
            }
            return true;
        });
    }
})();
'use strict';

(function () {
    'use strict';

    Ctrl.$inject = ["authService", "$rootRouter"];
    angular.module('app.components').component('login', {
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
            var _this = this;

            if (this.submited) {
                return false;
            }
            this.submited = true;

            authService.login(data).then(function (result) {
                if (result) {
                    $rootRouter.navigate(['AppPages']);
                }
            }, function (err) {
                _this.error.status = true;

                if (err.status == 401) {
                    _this.error.message = 'Username or password is incorrect';
                }

                _this.submited = false;
            });
        };
    }

    // canActivate route
    function canActivate(authService, $rootRouter) {
        return authService.isLogged().then(function (result) {
            if (result) {
                $rootRouter.navigate(['AppPages']);
                return false;
            }

            return true;
        });
    }
})();
'use strict';

(function () {
    'use strict';

    angular.module('app.components').component('notFound', {
        templateUrl: 'not-found.html'
    });
})();
'use strict';

(function () {
    'use strict';

    Ctrl.$inject = ["postsService", "sessionService", "$rootRouter", "$scope"];
    angular.module('app.components').component('postItem', {
        templateUrl: 'post-item.html',
        controller: Ctrl,
        $canActivate: canActivate,
        bindings: {
            $router: '<'
        }
    });

    // component's controller
    function Ctrl(postsService, sessionService, $rootRouter, $scope) {
        var _this = this;

        this.behavior = null;
        this.id = null;
        this.post = null;
        this.currentPage = null;
        this.file = null;
        this.prewFile = null;
        this.userRole = sessionService.get('userRole');

        this.showPrewImg = function () {
            /** I used scope.$apply because when image loaded view not update it */

            if (this.file) {
                var reader = new FileReader();

                reader.onload = function (e) {
                    this.prewFile = e.target.result;

                    $scope.$apply();
                }.bind(this);

                reader.readAsDataURL(this.file);
            } else {
                this.prewFile = null;
            }
        }.bind(this);

        this.goToBack = function () {
            _this.$router.navigate(['PostsList', { page: _this.currentPage }]);
        };

        this.postCreate = function () {
            var data = {
                heading: _this.post.heading,
                text: _this.post.text,
                file: _this.file
            };

            postsService.create(data).then(function (data) {
                _this.$router.navigate(['PostsList', { page: 1 }]);
            }, function (err) {
                console.log(err);
            });
        };

        this.postUpdate = function () {
            var data = {
                heading: _this.post.heading,
                text: _this.post.text,
                file: _this.file
            };

            postsService.put(_this.id, data).then(function (data) {
                _this.$router.navigate(['PostsList', { page: _this.currentPage }]);
            });
        };

        this.$routerOnActivate = function (next, prev) {
            window.scrollTo(0, 0);

            if (next.params.page) {
                _this.currentPage = next.params.page;
            } else {
                _this.currentPage = prev ? prev.params.page : 1;
            }

            _this.post = next.routeData.postItem;
            _this.id = next.params.id;
            _this.behavior = next.routeData.data.behavior ? next.routeData.data.behavior : null;
        };
    }

    function canActivate($rootRouter, $nextInstruction, sessionService, postsService) {
        var userRole = sessionService.get('userRole'),
            behavior = $nextInstruction.routeData.data.behavior,
            id = $nextInstruction.params.id;

        if (behavior && userRole > 1) {
            $rootRouter.navigateByUrl('404', true);
            return false;
        }

        if (behavior == 'create') {
            return true;
        }

        return postsService.get(id).then(function (res) {
            $nextInstruction.routeData.postItem = res;
        }, function (err) {
            if (err.status == 401) {
                $rootRouter.navigate(['Login']);
                return false;
            }
            if (err.status == 404) {
                $rootRouter.navigateByUrl('404', true);
                return false;
            }
        });
    }
})();
'use strict';

(function () {
    'use strict';

    angular.module('app.components').component('posts', {
        templateUrl: 'posts.html',
        bindings: {
            $router: '<'
        },
        $routeConfig: [{ path: '/:page', name: 'PostsList', component: 'postsList' }, { path: '/:page/:id', name: 'PostDetail', component: 'postItem' }, { path: '/create', name: 'PostCreate', data: { behavior: 'create' }, component: 'postItem' }, { path: '/:page/edit/:id', name: 'PostEdit', data: { behavior: 'edit' }, component: 'postItem' }, { path: '/', redirectTo: ['PostsList', { page: 1 }] }]
    });
})();
'use strict';

(function () {
    'use strict';

    angular.module('app.services').factory('postsService', ["$http", function ($http) {

        return {
            get: function get(id) {
                return $http.get('api/posts/' + id).then(function (response) {
                    return response.data;
                });
            },
            put: function put(id, data) {

                return $http.put('api/posts/' + id, dataPrep(data), {
                    transformRequest: angular.identity,
                    headers: { 'Content-Type': undefined }
                }).then(function (response) {
                    return response;
                });
            },
            remove: function remove(id) {
                return $http.delete('api/posts/' + id).then(function (response) {
                    return response;
                });
            },
            create: function create(data) {
                return $http.post('api/posts', dataPrep(data), {
                    transformRequest: angular.identity,
                    headers: { 'Content-Type': undefined }
                }).then(function (response) {
                    return response;
                });
            },
            getList: function getList() {
                var page = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 1;
                var limit = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 9;

                return $http.get('api/posts?limit=' + limit + '&page=' + page).then(function (response) {
                    return response.data;
                });
            }
        };
    }]);

    function dataPrep(data) {
        var fd = new FormData();

        for (var key in data) {
            fd.append(key, data[key]);
        }

        return fd;
    }
})();
'use strict';

(function () {
    'use strict';

    Ctrl.$inject = ["postsService", "sessionService"];
    angular.module('app.components').component('postsList', {
        templateUrl: 'posts-list.html',
        bindings: {
            $router: '<',
            confirm: '<'
        },
        controller: Ctrl,
        $canActivate: canActivate
    });

    function Ctrl(postsService, sessionService) {
        var _this2 = this;

        this.paginationLimit = 5;
        this.pagination = [];
        this.limit = 9;
        this.posts = null;
        this.currentPage = null;
        this.postsSum = null;
        this.userRole = sessionService.get('userRole') || 2;
        this.confirm = null;

        // return pagination arr
        this.makePagination = function (currentPage, maxSize, pagesSum) {
            var magicNumber = void 0;

            if (!maxSize || !currentPage) {
                throw {
                    message: 'pagination wrong data'
                };
            }

            magicNumber = Math.ceil(maxSize / 2);
            maxSize = pagesSum < maxSize ? pagesSum : maxSize;

            if (currentPage < magicNumber) {
                return createArr(1, maxSize);
            }
            if (currentPage > pagesSum - magicNumber) {
                return createArr(pagesSum - maxSize + 1, maxSize);
            }

            if (currentPage >= magicNumber && currentPage <= pagesSum - magicNumber) {
                return createArr(currentPage - Math.floor(maxSize / 2), maxSize);
            }

            function createArr(min, max) {
                var arr = [];

                for (var i = min; i < min + max; i++) {
                    arr.push(i);
                }

                return arr;
            }
        };

        // remove post
        this.remove = function (id, index) {
            return function () {
                var _this = this;

                return postsService.remove(id).then(function (data) {

                    if (data) {
                        _this.posts.splice(index, 1);

                        if (_this.posts.length == 0) {
                            _this.$router.navigate(['PostsList', { page: _this.currentPage - 1 }]);
                        }
                    } else {
                        // error handling
                        console.log('remove error');
                    }
                });
            }.bind(this);
        };

        this.goToPage = function (id) {
            _this2.$router.navigate(['PostsList', { page: id }]);
        };

        this.$routerOnActivate = function (next) {
            window.scrollTo(0, 0);

            _this2.currentPage = next.params.page || 1;
            _this2.posts = next.routeData.myData.posts;
            _this2.postsSum = Math.ceil(next.routeData.myData.postsSum / _this2.limit);
            _this2.pagination = _this2.makePagination(_this2.currentPage, _this2.paginationLimit, _this2.postsSum);

            return true;
        };
    }

    function canActivate($nextInstruction, postsService, $rootRouter) {
        return postsService.getList($nextInstruction.params.page - 1).then(function (res) {
            $nextInstruction.routeData.myData = {
                posts: res.posts,
                postsSum: res.postsSum
            };

            return true;
        }, function (err) {
            if (err.status == 404) {
                $rootRouter.navigateByUrl('404', true);

                return false;
            }
            if (err.status == 401) {
                $rootRouter.navigate(['Login']);

                return false;
            }
        });
    }
})();
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFwcC5qcyIsImFwcC5yb3V0ZXMuanMiLCJhdHVoL2F1dGhTZXJ2aWNlLmpzIiwic2hhcmVkL2JhY2tJbWcuanMiLCJzaGFyZWQvY29uZmlybS5qcyIsInNoYXJlZC9maWxlUmVhZC5qcyIsInNoYXJlZC9zZXNzaW9uU2VydmljZS5qcyIsImNvbXBvbmVudHMvYXBwL2FwcC5qcyIsImNvbXBvbmVudHMvYXBwLXBhZ2VzL2FwcC1wYWdlcy5qcyIsImNvbXBvbmVudHMvbG9naW4vbG9naW4uanMiLCJjb21wb25lbnRzL25vdC1mb3VuZC9ub3QtZm91bmQuanMiLCJjb21wb25lbnRzL3Bvc3QtaXRlbS9wb3N0LWl0ZW0uanMiLCJjb21wb25lbnRzL3Bvc3RzL3Bvc3RzLmpzIiwiY29tcG9uZW50cy9wb3N0cy9wb3N0c1NlcnZpY2UuanMiLCJjb21wb25lbnRzL3Bvc3RzLWxpc3QvcG9zdHMtbGlzdC5qcyJdLCJuYW1lcyI6WyJhbmd1bGFyIiwibW9kdWxlIiwiY29uZmlnIiwiJGxvY2F0aW9uUHJvdmlkZXIiLCJ3aW5kb3ciLCJoaXN0b3J5IiwicHVzaFN0YXRlIiwiaHRtbDVNb2RlIiwidmFsdWUiLCJmYWN0b3J5IiwiJGh0dHAiLCJzZXNzaW9uU2VydmljZSIsImxvZ2luIiwiZGF0YSIsInBvc3QiLCJ0aGVuIiwicmVzcG9uc2UiLCJhdXRoIiwic2V0Iiwicm9sZSIsImxvZ291dCIsImRlbGV0ZSIsInJlbW92ZSIsImlzTG9nZ2VkIiwiZ2V0Iiwic2Vzc2lvbiIsImRpcmVjdGl2ZSIsInJlc3RyaWN0IiwibGluayIsIiRzY29wZSIsImVsZW1lbnQiLCIkYXR0cnMiLCIkb2JzZXJ2ZSIsInVybCIsImNzcyIsImNvbXBvbmVudCIsInRlbXBsYXRlIiwiYmluZGluZ3MiLCJjYWxsYmFjayIsImNvbnRyb2xsZXIiLCJDdHJsIiwiX3RoaXMiLCJmbiIsInNob3ciLCJvcGVuIiwiY29uZmlybSIsIm5hbWUiLCJtZXNzYWdlIiwiY2FuY2VsIiwiJGluamVjdCIsInJlcXVpcmUiLCJuZ01vZGVsIiwidHJhbnNjbHVkZSIsImZpbGVSZWFkQ2IiLCJtaW1lVHlwZXMiLCIkZWxlbWVudCIsImVsZW0iLCJxdWVyeVNlbGVjdG9yIiwiZmlsZU5hbWUiLCJBcnJheSIsImlzQXJyYXkiLCIkc2V0Vmlld1ZhbHVlIiwib24iLCJldmVudCIsIiRzZXREaXJ0eSIsIiRzZXRUb3VjaGVkIiwiaXNWYWxpZE1pbWVUeXBlIiwiZmlsZSIsInRhcmdldCIsImZpbGVzIiwic29tZSIsInR5cGUiLCIkc2V0VmFsaWRpdHkiLCIkc2Vzc2lvblN0b3JhZ2UiLCJrZXkiLCJwdXQiLCIkcm91dGVDb25maWciLCJwYXRoIiwidXNlQXNEZWZhdWx0IiwidGVtcGxhdGVVcmwiLCIkY2FuQWN0aXZhdGUiLCJjYW5BY3RpdmF0ZSIsInJlZGlyZWN0VG8iLCIkcm9vdFJvdXRlciIsImF1dGhTZXJ2aWNlIiwibmF2aWdhdGUiLCJyZXN1bHQiLCJjcmVkZW50aWFscyIsInBhc3N3b3JkIiwic3VibWl0ZWQiLCJlcnJvciIsInN0YXR1cyIsImVyciIsIiRyb3V0ZXIiLCJwb3N0c1NlcnZpY2UiLCJiZWhhdmlvciIsImlkIiwiY3VycmVudFBhZ2UiLCJwcmV3RmlsZSIsInVzZXJSb2xlIiwic2hvd1ByZXdJbWciLCJyZWFkZXIiLCJGaWxlUmVhZGVyIiwib25sb2FkIiwiZSIsIiRhcHBseSIsImJpbmQiLCJyZWFkQXNEYXRhVVJMIiwiZ29Ub0JhY2siLCJwYWdlIiwicG9zdENyZWF0ZSIsImhlYWRpbmciLCJ0ZXh0IiwiY3JlYXRlIiwiY29uc29sZSIsImxvZyIsInBvc3RVcGRhdGUiLCIkcm91dGVyT25BY3RpdmF0ZSIsIm5leHQiLCJwcmV2Iiwic2Nyb2xsVG8iLCJwYXJhbXMiLCJyb3V0ZURhdGEiLCJwb3N0SXRlbSIsIiRuZXh0SW5zdHJ1Y3Rpb24iLCJuYXZpZ2F0ZUJ5VXJsIiwicmVzIiwiZGF0YVByZXAiLCJ0cmFuc2Zvcm1SZXF1ZXN0IiwiaWRlbnRpdHkiLCJoZWFkZXJzIiwidW5kZWZpbmVkIiwiZ2V0TGlzdCIsImFyZ3VtZW50cyIsImxlbmd0aCIsImxpbWl0IiwiZmQiLCJGb3JtRGF0YSIsImFwcGVuZCIsIl90aGlzMiIsInBhZ2luYXRpb25MaW1pdCIsInBhZ2luYXRpb24iLCJwb3N0cyIsInBvc3RzU3VtIiwibWFrZVBhZ2luYXRpb24iLCJtYXhTaXplIiwicGFnZXNTdW0iLCJtYWdpY051bWJlciIsIk1hdGgiLCJjZWlsIiwiY3JlYXRlQXJyIiwiZmxvb3IiLCJtaW4iLCJtYXgiLCJhcnIiLCJpIiwicHVzaCIsImluZGV4Iiwic3BsaWNlIiwiZ29Ub1BhZ2UiLCJteURhdGEiXSwibWFwcGluZ3MiOiJBQUFBOztBQUVBQSxRQUFRQyxPQUFPLE9BQU8sQ0FBQyxjQUFjLGtCQUFrQixnQkFBZ0IsWUFBVzs7QUFFbEZELFFBQVFDLE9BQU8sY0FBYyxDQUFDO0FBQzlCRCxRQUFRQyxPQUFPLGtCQUFrQixDQUFDO0FBQ2xDRCxRQUFRQyxPQUFPLGdCQUFnQjtBQUMvQkQsUUFBUUMsT0FBTyxjQUFjLENBQUMscUJBQTlCRDtBQ1BBOztBQUVBQSxRQUFRQyxPQUFPLGNBQ1ZDLE9BQUFBLENBQUFBLHFCQUFPLFVBQVVDLG1CQUFtQjtJQUNqQyxJQUFJQyxPQUFPQyxXQUFXRCxPQUFPQyxRQUFRQyxXQUFXO1FBQzVDSCxrQkFBa0JJLFVBQVU7O0lBR25DQyxNQUFNLHdCQUF3QixPQU5uQ1I7QUNGQTs7QUFBQSxDQUFDLFlBQVk7SUFDVDs7SUFFQUEsUUFBUUMsT0FBTyxZQUFZLElBQ3RCUSxRQUFRLGVBQUEsQ0FBQSxTQUFBLGtCQUFlLFVBQUNDLE9BQU9DLGdCQUFtQjtRQUMvQyxPQUFPO1lBQ0hDLE9BQU8sU0FBQUEsTUFBQ0MsTUFBUztnQkFDYixPQUFPSCxNQUFNSSxLQUFLLGFBQWFELE1BQU1FLEtBQUssVUFBQ0MsVUFBYTtvQkFDcEQsSUFBSSxDQUFDQSxTQUFTSCxLQUFLSSxNQUFNO3dCQUNyQixPQUFPOzs7b0JBR1hOLGVBQWVPLElBQUksWUFBWUYsU0FBU0gsS0FBS007O29CQUU3QyxPQUFP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QUFhMEMsT0FBS0MsaUJBQWlCRCxPQUFLSTs7WUFFbkYsT0FBTzs7OztJQUlmLFNBQVM5RCxZQUFZMkMsa0JBQWtCOUIsY0FBY1gsYUFBYTtRQUM5RCxPQUFPVyxhQUFhc0MsUUFBUVIsaUJBQWlCSCxPQUFPWixPQUFPLEdBQUc5RixLQUMxRCxVQUFDK0csS0FBTztZQUNKRixpQkFBaUJGLFVBQVVzQyxTQUFTO2dCQUNoQ2xCLE9BQU9oQixJQUFJZ0I7Z0JBQ1hDLFVBQVVqQixJQUFJaUI7OztZQUdsQixPQUFPO1dBRVgsVUFBQ25ELEtBQU87WUFDSixJQUFJQSxJQUFJRCxVQUFVLEtBQUs7Z0JBQ25CUixZQUFZMEMsY0FBYyxPQUFPOztnQkFFakMsT0FBTzs7WUFFWCxJQUFJakMsSUFBSUQsVUFBVSxLQUFLO2dCQUNuQlIsWUFBWUUsU0FBUyxDQUFDOztnQkFFdEIsT0FBTzs7OztLQXJIM0IiLCJmaWxlIjoiYXBwLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBzdHJpY3QnO1xyXG5cclxuYW5ndWxhci5tb2R1bGUoJ2FwcCcsIFsnYXBwLnJvdXRlcycsICdhcHAuY29tcG9uZW50cycsICdhcHAuc2VydmljZXMnLCAnYXBwLmF1dGgnLCdhcHAuc2hhcmVkJ10pO1xyXG5cclxuYW5ndWxhci5tb2R1bGUoJ2FwcC5yb3V0ZXMnLCBbJ25nQ29tcG9uZW50Um91dGVyJ10pO1xyXG5hbmd1bGFyLm1vZHVsZSgnYXBwLmNvbXBvbmVudHMnLCBbJ25nTWVzc2FnZXMnXSk7XHJcbmFuZ3VsYXIubW9kdWxlKCdhcHAuc2VydmljZXMnLCBbXSk7XHJcbmFuZ3VsYXIubW9kdWxlKCdhcHAuc2hhcmVkJywgWyduZ1Nlc3Npb25TdG9yYWdlJ10pO1xyXG4iLCIndXNlIHN0cmljdCc7XHJcblxyXG5hbmd1bGFyLm1vZHVsZSgnYXBwLnJvdXRlcycpXHJcbiAgICAuY29uZmlnKGZ1bmN0aW9uICgkbG9jYXRpb25Qcm92aWRlcikge1xyXG4gICAgICAgIGlmICh3aW5kb3cuaGlzdG9yeSAmJiB3aW5kb3cuaGlzdG9yeS5wdXNoU3RhdGUpIHtcclxuICAgICAgICAgICAgJGxvY2F0aW9uUHJvdmlkZXIuaHRtbDVNb2RlKHRydWUpO1xyXG4gICAgICAgIH1cclxuICAgIH0pXHJcbiAgICAudmFsdWUoJyRyb3V0ZXJSb290Q29tcG9uZW50JywgJ2FwcCcpO1xyXG5cclxuXHJcbiIsIihmdW5jdGlvbiAoKSB7XHJcbiAgICAndXNlIHN0cmljdCc7XHJcblxyXG4gICAgYW5ndWxhci5tb2R1bGUoJ2FwcC5hdXRoJywgW10pXHJcbiAgICAgICAgLmZhY3RvcnkoJ2F1dGhTZXJ2aWNlJywgKCRodHRwLCBzZXNzaW9uU2VydmljZSkgPT4ge1xyXG4gICAgICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICAgICAgbG9naW46IChkYXRhKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuICRodHRwLnBvc3QoJy9hcGkvYXV0aCcsIGRhdGEpLnRoZW4oKHJlc3BvbnNlKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICghcmVzcG9uc2UuZGF0YS5hdXRoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHNlc3Npb25TZXJ2aWNlLnNldCgndXNlclJvbGUnLCByZXNwb25zZS5kYXRhLnJvbGUpO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHJlc3BvbnNlLmRhdGEuYXV0aDtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgbG9nb3V0OiAoKT0+IHtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gJGh0dHAuZGVsZXRlKCcvYXBpL2F1dGgnKS50aGVuKChyZXNwb25zZSk9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICghcmVzcG9uc2UuZGF0YS5sb2dvdXQpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgc2Vzc2lvblNlcnZpY2UucmVtb3ZlKCd1c2VyUm9sZScpO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHJlc3BvbnNlLmRhdGEubG9nb3V0O1xyXG4gICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgIGlzTG9nZ2VkOiAoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuICRodHRwLmdldCgnL2FwaS9hdXRoJykudGhlbigocmVzcG9uc2UpPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoIXJlc3BvbnNlLmRhdGEuc2Vzc2lvbikge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICBzZXNzaW9uU2VydmljZS5zZXQoJ3VzZXJSb2xlJywgcmVzcG9uc2UuZGF0YS5yb2xlKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiByZXNwb25zZS5kYXRhLnNlc3Npb247XHJcbiAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxufSkoKTsiLCIoZnVuY3Rpb24gKCkge1xyXG4gICAgJ3VzZSBzdHJpY3QnO1xyXG5cclxuICAgIGFuZ3VsYXIubW9kdWxlKCdhcHAuc2hhcmVkJykuZGlyZWN0aXZlKCdiYWNrSW1nJywgKCk9PiB7XHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgcmVzdHJpY3Q6ICdBJyxcclxuICAgICAgICAgICAgbGluazogZnVuY3Rpb24gKCRzY29wZSwgZWxlbWVudCwgJGF0dHJzKSB7XHJcbiAgICAgICAgICAgICAgICAkYXR0cnMuJG9ic2VydmUoJ2JhY2tJbWcnLCBmdW5jdGlvbih1cmwpe1xyXG4gICAgICAgICAgICAgICAgICAgIGVsZW1lbnQuY3NzKHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgJ2JhY2tncm91bmQtaW1hZ2UnOiAndXJsKCcgKyB1cmwgKyAnKSdcclxuICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfSlcclxufSkoKTsiLCIoZnVuY3Rpb24gKCkge1xyXG4gICAgJ3VzZSBzdHJpY3QnO1xyXG5cclxuICAgIGFuZ3VsYXIubW9kdWxlKCdhcHAuc2hhcmVkJykuY29tcG9uZW50KCdjb25maXJtJywge1xyXG4gICAgICAgIHRlbXBsYXRlOiBgPGRpdiBuZy1jbGFzcz1cIiRjdHJsLnNob3cgPyAnb3Blbic6JydcIiBjbGFzcz1cInBvcHVwXCI+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJwb3B1cC1jb250ZW50XCI+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8cCBjbGFzcz1cInBvcHVwLXRpdGxlXCI+QXJlIHlvdSBzdXJlPzwvcD5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxidXR0b24gbmctY2xpY2s9XCIkY3RybC5jb25maXJtKClcIiBjbGFzcz1cImJ0biBidG4tLXN1Y2Nlc3NcIj5ZZXM8L2J1dHRvbj5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxidXR0b24gbmctY2xpY2s9XCIkY3RybC5jYW5jZWwoKVwiIGNsYXNzPVwiYnRuIGJ0bi0td2FybmluZ1wiPk5vPC9idXR0b24+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICAgICAgICAgPC9kaXY+YCxcclxuICAgICAgICBiaW5kaW5nczoge1xyXG4gICAgICAgICAgICBjYWxsYmFjazogJz0nXHJcbiAgICAgICAgfSxcclxuICAgICAgICBjb250cm9sbGVyOiBDdHJsXHJcbiAgICB9KTtcclxuXHJcbiAgICBmdW5jdGlvbiBDdHJsKCkge1xyXG4gICAgICAgIHRoaXMuZm4gPSBudWxsO1xyXG4gICAgICAgIHRoaXMuc2hvdyA9IGZhbHNlO1xyXG4gICAgICAgIHRoaXMub3BlbiA9IChmbik9PiB7XHJcbiAgICAgICAgICAgIHRoaXMuZm4gPSBmbjtcclxuICAgICAgICAgICAgdGhpcy5zaG93ID0gdHJ1ZTtcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICB0aGlzLmNvbmZpcm0gPSAoKT0+IHtcclxuICAgICAgICAgICAgaWYgKCF0aGlzLmZuKSB7XHJcbiAgICAgICAgICAgICAgICB0aHJvdyB7XHJcbiAgICAgICAgICAgICAgICAgICAgbmFtZTogJ2NvbmZpcm0gY29tcG9uZW50JyxcclxuICAgICAgICAgICAgICAgICAgICBtZXNzYWdlOiAnZm4oKSBub3QgZm91bmQnXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGlmICh0eXBlb2YgdGhpcy5mbiAhPSAnZnVuY3Rpb24nKSB7XHJcbiAgICAgICAgICAgICAgICB0aHJvdyB7XHJcbiAgICAgICAgICAgICAgICAgICAgbmFtZTogJ2NvbmZpcm0gY29tcG9uZW50JyxcclxuICAgICAgICAgICAgICAgICAgICBtZXNzYWdlOiAnZm4oKSBub3QgZnVuY3Rpb24nXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIHRoaXMuZm4oKTtcclxuICAgICAgICAgICAgdGhpcy5zaG93ID0gZmFsc2U7XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgdGhpcy5jYW5jZWwgPSAoKT0+IHtcclxuICAgICAgICAgICAgdGhpcy5mbiA9IG51bGw7XHJcbiAgICAgICAgICAgIHRoaXMuc2hvdyA9IGZhbHNlO1xyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIHRoaXMuY2FsbGJhY2sgPSB0aGlzLm9wZW47XHJcbiAgICB9XHJcbn0pKCk7XHJcblxyXG4iLCIoZnVuY3Rpb24gKCkge1xyXG4gICAgJ3VzZSBzdHJpY3QnO1xyXG5cclxuICAgIGFuZ3VsYXIubW9kdWxlKCdhcHAuc2hhcmVkJykuY29tcG9uZW50KCdmaWxlUmVhZCcsIHtcclxuICAgICAgICB0ZW1wbGF0ZTogYDxwPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICA8c3Bhbj5GaWxlIDogPC9zcGFuPiBcclxuICAgICAgICAgICAgICAgICAgICAgICAgPGEgY2xhc3M9XCJmaWxlLXJlYWRfcmVtb3ZlXCIgbmctaWY9XCIkY3RybC5maWxlTmFtZVwiIG5nLWNsaWNrPVwiJGN0cmwucmVtb3ZlKClcIiBuZy1ocmVmPVwiI1wiPjxpIGNsYXNzPVwiaWNvbiBmYSBmYS10aW1lc1wiPjwvaT4gPC9hPiBcclxuICAgICAgICAgICAgICAgICAgICAgICAge3skY3RybC5maWxlTmFtZX19XHJcbiAgICAgICAgICAgICAgICAgICA8L3A+XHJcbiAgICAgICAgICAgICAgICAgICA8aW5wdXQgdHlwZT1cImZpbGVcIj5cclxuICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJuZy10cmFuc2NsdWRlXCI+PC9kaXY+YCxcclxuICAgICAgICByZXF1aXJlOiB7XHJcbiAgICAgICAgICAgIG5nTW9kZWw6ICduZ01vZGVsJ1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgdHJhbnNjbHVkZTogdHJ1ZSxcclxuICAgICAgICBiaW5kaW5nczoge1xyXG4gICAgICAgICAgICBmaWxlUmVhZENiOiAnPCcsXHJcbiAgICAgICAgICAgIG1pbWVUeXBlczogJzwnXHJcbiAgICAgICAgfSxcclxuICAgICAgICBjb250cm9sbGVyOiBDdHJsXHJcbiAgICB9KTtcclxuXHJcbiAgICBmdW5jdGlvbiBDdHJsKCRlbGVtZW50LCAkc2NvcGUpIHtcclxuICAgICAgICBsZXQgZWxlbSA9IGFuZ3VsYXIuZWxlbWVudCgkZWxlbWVudFswXS5xdWVyeVNlbGVjdG9yKCdbdHlwZT1cImZpbGVcIl0nKSk7XHJcblxyXG4gICAgICAgIHRoaXMuZmlsZU5hbWUgPSBudWxsO1xyXG5cclxuICAgICAgICBpZiAoIUFycmF5LmlzQXJyYXkodGhpcy5taW1lVHlwZXMpKSB7XHJcbiAgICAgICAgICAgIHRoaXMubWltZVR5cGVzID0gW3RoaXMubWltZVR5cGVzXTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHRoaXMucmVtb3ZlID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICBlbGVtWzBdLnZhbHVlID0gJyc7XHJcbiAgICAgICAgICAgIHRoaXMuZmlsZU5hbWUgPSBudWxsO1xyXG4gICAgICAgICAgICB0aGlzLm5nTW9kZWwuJHNldFZpZXdWYWx1ZShudWxsKTtcclxuICAgICAgICAgICAgdGhpcy5maWxlUmVhZENiKCk7XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgZWxlbS5vbignY2hhbmdlJywgKGV2ZW50KT0+IHtcclxuICAgICAgICAgICAgdGhpcy5uZ01vZGVsLiRzZXREaXJ0eSgpO1xyXG4gICAgICAgICAgICB0aGlzLm5nTW9kZWwuJHNldFRvdWNoZWQoKTtcclxuXHJcbiAgICAgICAgICAgIGxldCBpc1ZhbGlkTWltZVR5cGUgPSBudWxsO1xyXG4gICAgICAgICAgICBsZXQgZmlsZSA9IGV2ZW50LnRhcmdldC5maWxlc1swXTtcclxuXHJcbiAgICAgICAgICAgIGlmIChmaWxlKSB7XHJcbiAgICAgICAgICAgICAgICBpc1ZhbGlkTWltZVR5cGUgPSB0aGlzLm1pbWVUeXBlcy5zb21lKGZ1bmN0aW9uICh0eXBlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHR5cGUgPT09IGZpbGUudHlwZTtcclxuICAgICAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgICAgIGlmICghaXNWYWxpZE1pbWVUeXBlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgZmlsZSA9IG51bGw7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5uZ01vZGVsLiRzZXRWYWxpZGl0eSgnbWltZVR5cGVzJywgZmFsc2UpO1xyXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLm5nTW9kZWwuJHNldFZhbGlkaXR5KCdtaW1lVHlwZXMnLCB0cnVlKTtcclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLm5nTW9kZWwuJHNldFZhbGlkaXR5KCdtaW1lVHlwZXMnLCB0cnVlKTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgdGhpcy5maWxlTmFtZSA9IGZpbGUgPyBmaWxlLm5hbWUgOiBudWxsO1xyXG5cclxuICAgICAgICAgICAgdGhpcy5uZ01vZGVsLiRzZXRWaWV3VmFsdWUoZmlsZSk7XHJcblxyXG4gICAgICAgICAgICB0aGlzLmZpbGVSZWFkQ2IoKTtcclxuICAgICAgICB9KTtcclxuICAgIH1cclxufSkoKTtcclxuIiwiKGZ1bmN0aW9uICgpIHtcclxuICAgICd1c2Ugc3RyaWN0JztcclxuXHJcbiAgICBhbmd1bGFyLm1vZHVsZSgnYXBwLnNoYXJlZCcpLmZhY3RvcnkoJ3Nlc3Npb25TZXJ2aWNlJywgKCRzZXNzaW9uU3RvcmFnZSk9PiB7XHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgZ2V0OiBmdW5jdGlvbiAoa2V5KSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gJHNlc3Npb25TdG9yYWdlLmdldChrZXkpO1xyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBzZXQ6IGZ1bmN0aW9uIChrZXksIHZhbHVlKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gJHNlc3Npb25TdG9yYWdlLnB1dChrZXksIHZhbHVlKTtcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgcmVtb3ZlOiBmdW5jdGlvbiAoa2V5KSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gJHNlc3Npb25TdG9yYWdlLnJlbW92ZShrZXkpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfSlcclxufSkoKTsiLCIoZnVuY3Rpb24gKCkge1xyXG4gICAgJ3VzZSBzdHJpY3QnO1xyXG5cclxuICAgIGFuZ3VsYXIubW9kdWxlKCdhcHAuY29tcG9uZW50cycpLmNvbXBvbmVudCgnYXBwJywge1xyXG4gICAgICAgIHRlbXBsYXRlOiAnPG5nLW91dGxldD48L25nLW91dGxldD4nLFxyXG4gICAgICAgICRyb3V0ZUNvbmZpZzogW1xyXG4gICAgICAgICAgICB7cGF0aDogJy8uLi4nLCBuYW1lOiAnQXBwUGFnZXMnLCBjb21wb25lbnQ6ICdhcHBQYWdlcyd9LFxyXG4gICAgICAgICAgICB7cGF0aDogJy9sb2dpbicsIG5hbWU6ICdMb2dpbicsIGNvbXBvbmVudDogJ2xvZ2luJywgdXNlQXNEZWZhdWx0OiB0cnVlfVxyXG4gICAgICAgIF1cclxuICAgIH0pO1xyXG59KSgpO1xyXG5cclxuIiwiKGZ1bmN0aW9uICgpIHtcclxuICAgICd1c2Ugc3RyaWN0JztcclxuXHJcbiAgICBhbmd1bGFyLm1vZHVsZSgnYXBwLmNvbXBvbmVudHMnKVxyXG4gICAgICAgIC5jb21wb25lbnQoJ2FwcFBhZ2VzJywge1xyXG4gICAgICAgICAgICB0ZW1wbGF0ZVVybDogJ2FwcC1wYWdlcy5odG1sJyxcclxuICAgICAgICAgICAgJGNhbkFjdGl2YXRlOiBjYW5BY3RpdmF0ZSxcclxuICAgICAgICAgICAgY29udHJvbGxlcjogQ3RybCxcclxuICAgICAgICAgICAgJHJvdXRlQ29uZmlnOiBbXHJcbiAgICAgICAgICAgICAgICB7cGF0aDogJy9ob21lJywgbmFtZTogJ0hvbWUnLCBjb21wb25lbnQ6ICdob21lJ30sXHJcbiAgICAgICAgICAgICAgICB7cGF0aDogJy9wb3N0cy8uLi4nLCBuYW1lOiAnUG9zdHMnLCBjb21wb25lbnQ6ICdwb3N0cycsIHVzZUFzRGVmYXVsdDogdHJ1ZX0sXHJcbiAgICAgICAgICAgICAgICB7cGF0aDogJy8nLCByZWRpcmVjdFRvOiBbJy9Mb2dpbiddfSxcclxuICAgICAgICAgICAgICAgIHtwYXRoOiAnLyoqJywgbmFtZTogJ05vdEZvdW5kJywgY29tcG9uZW50OiAnbm90Rm91bmQnfSxcclxuICAgICAgICAgICAgICAgIHtwYXRoOiAnLzQwNCcsIG5hbWU6ICdOb3RGb3VuZCcsIGNvbXBvbmVudDogJ25vdEZvdW5kJ31cclxuICAgICAgICAgICAgXVxyXG4gICAgICAgIH0pO1xyXG5cclxuICAgIC8vIGNvbXBvbmVudCBjb250cm9sbGVyXHJcbiAgICBmdW5jdGlvbiBDdHJsKCRyb290Um91dGVyLCBhdXRoU2VydmljZSkge1xyXG4gICAgICAgIHRoaXMubG9nb3V0ID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICBhdXRoU2VydmljZS5sb2dvdXQoKS50aGVuKCgpPT4ge1xyXG4gICAgICAgICAgICAgICAgJHJvb3RSb3V0ZXIubmF2aWdhdGUoWydMb2dpbiddKTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgYXV0aFNlcnZpY2UuaXNMb2dnZWQoKS50aGVuKChyZXN1bHQpPT4ge1xyXG4gICAgICAgICAgICBpZiAoIXJlc3VsdCkge1xyXG4gICAgICAgICAgICAgICAgJHJvb3RSb3V0ZXIubmF2aWdhdGUoWydMb2dpbiddKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pXHJcbiAgICB9XHJcblxyXG4gICAgLy8gY2FuQWN0aXZhdGUgcm91dGVcclxuICAgIGZ1bmN0aW9uIGNhbkFjdGl2YXRlKCRyb290Um91dGVyLCBhdXRoU2VydmljZSkge1xyXG4gICAgICAgIHJldHVybiBhdXRoU2VydmljZS5pc0xvZ2dlZCgpLnRoZW4oKHJlc3VsdCk9PiB7XHJcbiAgICAgICAgICAgIGlmICghcmVzdWx0KSB7XHJcbiAgICAgICAgICAgICAgICAkcm9vdFJvdXRlci5uYXZpZ2F0ZShbJ0xvZ2luJ10pO1xyXG5cclxuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgICB9KTtcclxuICAgIH1cclxufSkoKTsiLCIoZnVuY3Rpb24gKCkge1xyXG4gICAgJ3VzZSBzdHJpY3QnO1xyXG5cclxuICAgIGFuZ3VsYXIubW9kdWxlKCdhcHAuY29tcG9uZW50cycpXHJcbiAgICAgICAgLmNvbXBvbmVudCgnbG9naW4nLCB7XHJcbiAgICAgICAgICAgIHRlbXBsYXRlVXJsOiAnbG9naW4uaHRtbCcsXHJcbiAgICAgICAgICAgIGNvbnRyb2xsZXI6IEN0cmwsXHJcbiAgICAgICAgICAgICRjYW5BY3RpdmF0ZTogY2FuQWN0aXZhdGVcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAvLyBjb21wb25lbnQncyBjb250cm9sbGVyXHJcbiAgICBmdW5jdGlvbiBDdHJsKGF1dGhTZXJ2aWNlLCAkcm9vdFJvdXRlcikge1xyXG4gICAgICAgIHRoaXMuY3JlZGVudGlhbHMgPSB7XHJcbiAgICAgICAgICAgIG5hbWU6ICcnLFxyXG4gICAgICAgICAgICBwYXNzd29yZDogJydcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICB0aGlzLnN1Ym1pdGVkID0gZmFsc2U7XHJcbiAgICAgICAgXHJcbiAgICAgICAgdGhpcy5lcnJvciA9IHtcclxuICAgICAgICAgICAgc3RhdHVzOiBmYWxzZSxcclxuICAgICAgICAgICAgbWVzc2FnZTogJydcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICB0aGlzLmxvZ2luID0gZnVuY3Rpb24gKGRhdGEpIHtcclxuICAgICAgICAgICAgaWYgKHRoaXMuc3VibWl0ZWQpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB0aGlzLnN1Ym1pdGVkID0gdHJ1ZTtcclxuXHJcbiAgICAgICAgICAgIGF1dGhTZXJ2aWNlLmxvZ2luKGRhdGEpLnRoZW4oXHJcbiAgICAgICAgICAgICAgICAocmVzdWx0KT0+IHtcclxuICAgICAgICAgICAgICAgICAgICBpZiAocmVzdWx0KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICRyb290Um91dGVyLm5hdmlnYXRlKFsnQXBwUGFnZXMnXSk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgIChlcnIpPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZXJyb3Iuc3RhdHVzID0gdHJ1ZTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGVyci5zdGF0dXMgPT0gNDAxKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuZXJyb3IubWVzc2FnZSA9ICdVc2VybmFtZSBvciBwYXNzd29yZCBpcyBpbmNvcnJlY3QnXHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgICAgICB0aGlzLnN1Ym1pdGVkID0gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICk7XHJcbiAgICAgICAgfTtcclxuICAgIH1cclxuXHJcbiAgICAvLyBjYW5BY3RpdmF0ZSByb3V0ZVxyXG4gICAgZnVuY3Rpb24gY2FuQWN0aXZhdGUoYXV0aFNlcnZpY2UsICRyb290Um91dGVyKSB7XHJcbiAgICAgICAgcmV0dXJuIGF1dGhTZXJ2aWNlLmlzTG9nZ2VkKCkudGhlbigocmVzdWx0KT0+IHtcclxuICAgICAgICAgICAgaWYgKHJlc3VsdCkge1xyXG4gICAgICAgICAgICAgICAgJHJvb3RSb3V0ZXIubmF2aWdhdGUoWydBcHBQYWdlcyddKTtcclxuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcbn0pKCk7IiwiKGZ1bmN0aW9uICgpIHtcclxuICAgICd1c2Ugc3RyaWN0JztcclxuICAgIGFuZ3VsYXIubW9kdWxlKCdhcHAuY29tcG9uZW50cycpLmNvbXBvbmVudCgnbm90Rm91bmQnLCB7XHJcbiAgICAgICAgdGVtcGxhdGVVcmw6ICdub3QtZm91bmQuaHRtbCdcclxuICAgIH0pO1xyXG59KSgpOyIsIihmdW5jdGlvbiAoKSB7XHJcbiAgICAndXNlIHN0cmljdCc7XHJcblxyXG4gICAgYW5ndWxhci5tb2R1bGUoJ2FwcC5jb21wb25lbnRzJykuY29tcG9uZW50KCdwb3N0SXRlbScsIHtcclxuICAgICAgICB0ZW1wbGF0ZVVybDogJ3Bvc3QtaXRlbS5odG1sJyxcclxuICAgICAgICBjb250cm9sbGVyOiBDdHJsLFxyXG4gICAgICAgICRjYW5BY3RpdmF0ZTogY2FuQWN0aXZhdGUsXHJcbiAgICAgICAgYmluZGluZ3M6IHtcclxuICAgICAgICAgICAgJHJvdXRlcjogJzwnXHJcbiAgICAgICAgfVxyXG4gICAgfSk7XHJcblxyXG5cclxuICAgIC8vIGNvbXBvbmVudCdzIGNvbnRyb2xsZXJcclxuICAgIGZ1bmN0aW9uIEN0cmwocG9zdHNTZXJ2aWNlLCBzZXNzaW9uU2VydmljZSwgJHJvb3RSb3V0ZXIsICRzY29wZSkge1xyXG4gICAgICAgIHRoaXMuYmVoYXZpb3IgPSBudWxsO1xyXG4gICAgICAgIHRoaXMuaWQgPSBudWxsO1xyXG4gICAgICAgIHRoaXMucG9zdCA9IG51bGw7XHJcbiAgICAgICAgdGhpcy5jdXJyZW50UGFnZSA9IG51bGw7XHJcbiAgICAgICAgdGhpcy5maWxlID0gbnVsbDtcclxuICAgICAgICB0aGlzLnByZXdGaWxlID0gbnVsbDtcclxuICAgICAgICB0aGlzLnVzZXJSb2xlID0gc2Vzc2lvblNlcnZpY2UuZ2V0KCd1c2VyUm9sZScpO1xyXG5cclxuICAgICAgICB0aGlzLnNob3dQcmV3SW1nID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAvKiogSSB1c2VkIHNjb3BlLiRhcHBseSBiZWNhdXNlIHdoZW4gaW1hZ2UgbG9hZGVkIHZpZXcgbm90IHVwZGF0ZSBpdCAqL1xyXG5cclxuICAgICAgICAgICAgaWYgKHRoaXMuZmlsZSkge1xyXG4gICAgICAgICAgICAgICAgdmFyIHJlYWRlciA9IG5ldyBGaWxlUmVhZGVyKCk7XHJcblxyXG4gICAgICAgICAgICAgICAgcmVhZGVyLm9ubG9hZCA9IGZ1bmN0aW9uIChlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5wcmV3RmlsZSA9IGUudGFyZ2V0LnJlc3VsdDtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgJHNjb3BlLiRhcHBseSgpO1xyXG5cclxuICAgICAgICAgICAgICAgIH0uYmluZCh0aGlzKTtcclxuXHJcbiAgICAgICAgICAgICAgICByZWFkZXIucmVhZEFzRGF0YVVSTCh0aGlzLmZpbGUpO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHRoaXMucHJld0ZpbGUgPSBudWxsO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfS5iaW5kKHRoaXMpO1xyXG5cclxuICAgICAgICB0aGlzLmdvVG9CYWNrID0gKCk9PiB7XHJcbiAgICAgICAgICAgIHRoaXMuJHJvdXRlci5uYXZpZ2F0ZShbJ1Bvc3RzTGlzdCcsIHtwYWdlOiB0aGlzLmN1cnJlbnRQYWdlfV0pO1xyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIHRoaXMucG9zdENyZWF0ZSA9ICgpPT4ge1xyXG4gICAgICAgICAgICBsZXQgZGF0YSA9IHtcclxuICAgICAgICAgICAgICAgIGhlYWRpbmc6IHRoaXMucG9zdC5oZWFkaW5nLFxyXG4gICAgICAgICAgICAgICAgdGV4dDogdGhpcy5wb3N0LnRleHQsXHJcbiAgICAgICAgICAgICAgICBmaWxlOiB0aGlzLmZpbGVcclxuICAgICAgICAgICAgfTtcclxuXHJcbiAgICAgICAgICAgIHBvc3RzU2VydmljZS5jcmVhdGUoZGF0YSkudGhlbigoZGF0YSk9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy4kcm91dGVyLm5hdmlnYXRlKFsnUG9zdHNMaXN0Jywge3BhZ2U6IDF9XSk7XHJcbiAgICAgICAgICAgICAgICB9LCAoZXJyKT0+IHtcclxuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhlcnIpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICApXHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgdGhpcy5wb3N0VXBkYXRlID0gKCk9PiB7XHJcbiAgICAgICAgICAgIGxldCBkYXRhID0ge1xyXG4gICAgICAgICAgICAgICAgaGVhZGluZzogdGhpcy5wb3N0LmhlYWRpbmcsXHJcbiAgICAgICAgICAgICAgICB0ZXh0OiB0aGlzLnBvc3QudGV4dCxcclxuICAgICAgICAgICAgICAgIGZpbGU6IHRoaXMuZmlsZVxyXG4gICAgICAgICAgICB9O1xyXG5cclxuICAgICAgICAgICAgcG9zdHNTZXJ2aWNlLnB1dCh0aGlzLmlkLCBkYXRhKS50aGVuKChkYXRhKT0+IHtcclxuICAgICAgICAgICAgICAgIHRoaXMuJHJvdXRlci5uYXZpZ2F0ZShbJ1Bvc3RzTGlzdCcsIHtwYWdlOiB0aGlzLmN1cnJlbnRQYWdlfV0pO1xyXG4gICAgICAgICAgICB9KVxyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIHRoaXMuJHJvdXRlck9uQWN0aXZhdGUgPSAobmV4dCwgcHJldikgPT4ge1xyXG4gICAgICAgICAgICB3aW5kb3cuc2Nyb2xsVG8oMCwgMCk7XHJcblxyXG4gICAgICAgICAgICBpZiAobmV4dC5wYXJhbXMucGFnZSkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5jdXJyZW50UGFnZSA9IG5leHQucGFyYW1zLnBhZ2U7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmN1cnJlbnRQYWdlID0gcHJldiA/IHByZXYucGFyYW1zLnBhZ2UgOiAxO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICB0aGlzLnBvc3QgPSBuZXh0LnJvdXRlRGF0YS5wb3N0SXRlbTtcclxuICAgICAgICAgICAgdGhpcy5pZCA9IG5leHQucGFyYW1zLmlkO1xyXG4gICAgICAgICAgICB0aGlzLmJlaGF2aW9yID0gbmV4dC5yb3V0ZURhdGEuZGF0YS5iZWhhdmlvciA/IG5leHQucm91dGVEYXRhLmRhdGEuYmVoYXZpb3IgOiBudWxsO1xyXG4gICAgICAgIH07XHJcblxyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIGNhbkFjdGl2YXRlKCRyb290Um91dGVyLCAkbmV4dEluc3RydWN0aW9uLCBzZXNzaW9uU2VydmljZSwgcG9zdHNTZXJ2aWNlKSB7XHJcbiAgICAgICAgbGV0IHVzZXJSb2xlID0gc2Vzc2lvblNlcnZpY2UuZ2V0KCd1c2VyUm9sZScpLFxyXG4gICAgICAgICAgICBiZWhhdmlvciA9ICRuZXh0SW5zdHJ1Y3Rpb24ucm91dGVEYXRhLmRhdGEuYmVoYXZpb3IsXHJcbiAgICAgICAgICAgIGlkID0gJG5leHRJbnN0cnVjdGlvbi5wYXJhbXMuaWQ7XHJcblxyXG4gICAgICAgIGlmIChiZWhhdmlvciAmJiB1c2VyUm9sZSA+IDEpIHtcclxuICAgICAgICAgICAgJHJvb3RSb3V0ZXIubmF2aWdhdGVCeVVybCgnNDA0JywgdHJ1ZSk7XHJcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmIChiZWhhdmlvciA9PSAnY3JlYXRlJykge1xyXG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiBwb3N0c1NlcnZpY2UuZ2V0KGlkKVxyXG4gICAgICAgICAgICAudGhlbihcclxuICAgICAgICAgICAgICAgIChyZXMpPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgICRuZXh0SW5zdHJ1Y3Rpb24ucm91dGVEYXRhLnBvc3RJdGVtID0gcmVzO1xyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgIChlcnIpPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChlcnIuc3RhdHVzID09IDQwMSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAkcm9vdFJvdXRlci5uYXZpZ2F0ZShbJ0xvZ2luJ10pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIGlmIChlcnIuc3RhdHVzID09IDQwNCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAkcm9vdFJvdXRlci5uYXZpZ2F0ZUJ5VXJsKCc0MDQnLCB0cnVlKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgKTtcclxuICAgIH1cclxufSkoKTsiLCIoZnVuY3Rpb24gKCkge1xyXG4gICAgJ3VzZSBzdHJpY3QnO1xyXG5cclxuICAgIGFuZ3VsYXIubW9kdWxlKCdhcHAuY29tcG9uZW50cycpLmNvbXBvbmVudCgncG9zdHMnLCB7XHJcbiAgICAgICAgdGVtcGxhdGVVcmw6ICdwb3N0cy5odG1sJyxcclxuICAgICAgICBiaW5kaW5nczoge1xyXG4gICAgICAgICAgICAkcm91dGVyOiAnPCdcclxuICAgICAgICB9LFxyXG4gICAgICAgICRyb3V0ZUNvbmZpZzogW1xyXG4gICAgICAgICAgICB7cGF0aDogJy86cGFnZScsIG5hbWU6ICdQb3N0c0xpc3QnLCBjb21wb25lbnQ6ICdwb3N0c0xpc3QnfSxcclxuICAgICAgICAgICAge3BhdGg6ICcvOnBhZ2UvOmlkJywgbmFtZTogJ1Bvc3REZXRhaWwnLCBjb21wb25lbnQ6ICdwb3N0SXRlbSd9LFxyXG4gICAgICAgICAgICB7cGF0aDogJy9jcmVhdGUnLCBuYW1lOiAnUG9zdENyZWF0ZScsIGRhdGE6IHtiZWhhdmlvcjogJ2NyZWF0ZSd9LCBjb21wb25lbnQ6ICdwb3N0SXRlbSd9LFxyXG4gICAgICAgICAgICB7cGF0aDogJy86cGFnZS9lZGl0LzppZCcsIG5hbWU6ICdQb3N0RWRpdCcsIGRhdGE6IHtiZWhhdmlvcjogJ2VkaXQnfSwgY29tcG9uZW50OiAncG9zdEl0ZW0nfSxcclxuICAgICAgICAgICAge3BhdGg6ICcvJywgcmVkaXJlY3RUbzogWydQb3N0c0xpc3QnLCB7cGFnZTogMX1dfVxyXG4gICAgICAgIF1cclxuICAgIH0pO1xyXG59KSgpOyIsIihmdW5jdGlvbiAoKSB7XHJcbiAgICAndXNlIHN0cmljdCc7XHJcblxyXG4gICAgYW5ndWxhci5tb2R1bGUoJ2FwcC5zZXJ2aWNlcycpLmZhY3RvcnkoJ3Bvc3RzU2VydmljZScsICgkaHR0cCkgPT4ge1xyXG5cclxuXHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgZ2V0OiAoaWQpID0+IHtcclxuICAgICAgICAgICAgICAgIHJldHVybiAkaHR0cC5nZXQoJ2FwaS9wb3N0cy8nICsgaWQpXHJcbiAgICAgICAgICAgICAgICAgICAgLnRoZW4oKHJlc3BvbnNlKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiByZXNwb25zZS5kYXRhO1xyXG4gICAgICAgICAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIHB1dDogKGlkLCBkYXRhKT0+IHtcclxuXHJcbiAgICAgICAgICAgICAgICByZXR1cm4gJGh0dHAucHV0KCdhcGkvcG9zdHMvJyArIGlkLCBkYXRhUHJlcChkYXRhKSwge1xyXG4gICAgICAgICAgICAgICAgICAgIHRyYW5zZm9ybVJlcXVlc3Q6IGFuZ3VsYXIuaWRlbnRpdHksXHJcbiAgICAgICAgICAgICAgICAgICAgaGVhZGVyczogeydDb250ZW50LVR5cGUnOiB1bmRlZmluZWR9XHJcbiAgICAgICAgICAgICAgICB9KS50aGVuKChyZXNwb25zZSk9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHJlc3BvbnNlO1xyXG4gICAgICAgICAgICAgICAgfSlcclxuXHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIHJlbW92ZTogKGlkKT0+IHtcclxuICAgICAgICAgICAgICAgIHJldHVybiAkaHR0cC5kZWxldGUoJ2FwaS9wb3N0cy8nICsgaWQpLnRoZW4oKHJlc3BvbnNlKT0+IHtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gcmVzcG9uc2U7XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgY3JlYXRlOiAoZGF0YSk9PiB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gJGh0dHAucG9zdCgnYXBpL3Bvc3RzJywgZGF0YVByZXAoZGF0YSksIHtcclxuICAgICAgICAgICAgICAgICAgICB0cmFuc2Zvcm1SZXF1ZXN0OiBhbmd1bGFyLmlkZW50aXR5LFxyXG4gICAgICAgICAgICAgICAgICAgIGhlYWRlcnM6IHsnQ29udGVudC1UeXBlJzogdW5kZWZpbmVkfVxyXG4gICAgICAgICAgICAgICAgfSkudGhlbigocmVzcG9uc2UpPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiByZXNwb25zZTtcclxuICAgICAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIGdldExpc3Q6IChwYWdlID0gMSwgbGltaXQgPSA5KSA9PiB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gJGh0dHAuZ2V0KCdhcGkvcG9zdHM/bGltaXQ9JyArIGxpbWl0ICsgJyZwYWdlPScgKyBwYWdlKS50aGVuKChyZXNwb25zZSkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiByZXNwb25zZS5kYXRhO1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9KTtcclxuXHJcbiAgICBmdW5jdGlvbiBkYXRhUHJlcChkYXRhKSB7XHJcbiAgICAgICAgbGV0IGZkID0gbmV3IEZvcm1EYXRhKCk7XHJcblxyXG4gICAgICAgIGZvciAobGV0IGtleSBpbiBkYXRhKSB7XHJcbiAgICAgICAgICAgIGZkLmFwcGVuZChrZXksIGRhdGFba2V5XSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4gZmQ7XHJcbiAgICB9XHJcblxyXG59KSgpOyIsIihmdW5jdGlvbiAoKSB7XHJcbiAgICAndXNlIHN0cmljdCc7XHJcblxyXG4gICAgYW5ndWxhci5tb2R1bGUoJ2FwcC5jb21wb25lbnRzJykuY29tcG9uZW50KCdwb3N0c0xpc3QnLCB7XHJcbiAgICAgICAgdGVtcGxhdGVVcmw6ICdwb3N0cy1saXN0Lmh0bWwnLFxyXG4gICAgICAgIGJpbmRpbmdzOiB7XHJcbiAgICAgICAgICAgICRyb3V0ZXI6ICc8JyxcclxuICAgICAgICAgICAgY29uZmlybTogJzwnXHJcbiAgICAgICAgfSxcclxuICAgICAgICBjb250cm9sbGVyOiBDdHJsLFxyXG4gICAgICAgICRjYW5BY3RpdmF0ZTogY2FuQWN0aXZhdGVcclxuICAgIH0pO1xyXG5cclxuICAgIGZ1bmN0aW9uIEN0cmwocG9zdHNTZXJ2aWNlLCBzZXNzaW9uU2VydmljZSkge1xyXG4gICAgICAgIHRoaXMucGFnaW5hdGlvbkxpbWl0ID0gNTtcclxuICAgICAgICB0aGlzLnBhZ2luYXRpb24gPSBbXTtcclxuICAgICAgICB0aGlzLmxpbWl0ID0gOTtcclxuICAgICAgICB0aGlzLnBvc3RzID0gbnVsbDtcclxuICAgICAgICB0aGlzLmN1cnJlbnRQYWdlID0gbnVsbDtcclxuICAgICAgICB0aGlzLnBvc3RzU3VtID0gbnVsbDtcclxuICAgICAgICB0aGlzLnVzZXJSb2xlID0gc2Vzc2lvblNlcnZpY2UuZ2V0KCd1c2VyUm9sZScpIHx8IDI7XHJcbiAgICAgICAgdGhpcy5jb25maXJtID0gbnVsbDtcclxuXHJcbiAgICAgICAgLy8gcmV0dXJuIHBhZ2luYXRpb24gYXJyXHJcbiAgICAgICAgdGhpcy5tYWtlUGFnaW5hdGlvbiA9IChjdXJyZW50UGFnZSwgbWF4U2l6ZSwgcGFnZXNTdW0pID0+IHtcclxuICAgICAgICAgICAgbGV0IG1hZ2ljTnVtYmVyO1xyXG5cclxuICAgICAgICAgICAgaWYgKCFtYXhTaXplIHx8ICFjdXJyZW50UGFnZSkge1xyXG4gICAgICAgICAgICAgICAgdGhyb3cge1xyXG4gICAgICAgICAgICAgICAgICAgIG1lc3NhZ2U6ICdwYWdpbmF0aW9uIHdyb25nIGRhdGEnXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIG1hZ2ljTnVtYmVyID0gTWF0aC5jZWlsKG1heFNpemUgLyAyKTtcclxuICAgICAgICAgICAgbWF4U2l6ZSA9IHBhZ2VzU3VtIDwgbWF4U2l6ZSA/IHBhZ2VzU3VtIDogbWF4U2l6ZTtcclxuXHJcbiAgICAgICAgICAgIGlmIChjdXJyZW50UGFnZSA8IG1hZ2ljTnVtYmVyKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gY3JlYXRlQXJyKDEsIG1heFNpemUpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmIChjdXJyZW50UGFnZSA+IHBhZ2VzU3VtIC0gbWFnaWNOdW1iZXIpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiBjcmVhdGVBcnIocGFnZXNTdW0gLSBtYXhTaXplICsgMSwgbWF4U2l6ZSk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGlmIChjdXJyZW50UGFnZSA+PSBtYWdpY051bWJlciAmJiBjdXJyZW50UGFnZSA8PSBwYWdlc1N1bSAtIG1hZ2ljTnVtYmVyKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gY3JlYXRlQXJyKGN1cnJlbnRQYWdlIC0gTWF0aC5mbG9vcihtYXhTaXplIC8gMiksIG1heFNpemUpO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBmdW5jdGlvbiBjcmVhdGVBcnIobWluLCBtYXgpIHtcclxuICAgICAgICAgICAgICAgIGxldCBhcnIgPSBbXTtcclxuXHJcbiAgICAgICAgICAgICAgICBmb3IgKGxldCBpID0gbWluOyBpIDwgbWluICsgbWF4OyBpKyspIHtcclxuICAgICAgICAgICAgICAgICAgICBhcnIucHVzaChpKTtcclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICByZXR1cm4gYXJyO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgLy8gcmVtb3ZlIHBvc3RcclxuICAgICAgICB0aGlzLnJlbW92ZSA9IGZ1bmN0aW9uIChpZCwgaW5kZXgpIHtcclxuICAgICAgICAgICAgcmV0dXJuIGZ1bmN0aW9uICgpIHtcclxuXHJcbiAgICAgICAgICAgICAgICByZXR1cm4gcG9zdHNTZXJ2aWNlLnJlbW92ZShpZCkudGhlbigoZGF0YSk9PiB7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGlmIChkYXRhKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMucG9zdHMuc3BsaWNlKGluZGV4LCAxKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICh0aGlzLnBvc3RzLmxlbmd0aCA9PSAwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLiRyb3V0ZXIubmF2aWdhdGUoWydQb3N0c0xpc3QnLCB7cGFnZTogdGhpcy5jdXJyZW50UGFnZSAtIDF9XSk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIGVycm9yIGhhbmRsaW5nXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdyZW1vdmUgZXJyb3InKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9KVxyXG5cclxuICAgICAgICAgICAgfS5iaW5kKHRoaXMpO1xyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIHRoaXMuZ29Ub1BhZ2UgPSAoaWQpPT4ge1xyXG4gICAgICAgICAgICB0aGlzLiRyb3V0ZXIubmF2aWdhdGUoWydQb3N0c0xpc3QnLCB7cGFnZTogaWR9XSk7XHJcbiAgICAgICAgfTtcclxuXHJcblxyXG4gICAgICAgIHRoaXMuJHJvdXRlck9uQWN0aXZhdGUgPSAobmV4dCk9PiB7XHJcbiAgICAgICAgICAgIHdpbmRvdy5zY3JvbGxUbygwLCAwKTtcclxuXHJcbiAgICAgICAgICAgIHRoaXMuY3VycmVudFBhZ2UgPSBuZXh0LnBhcmFtcy5wYWdlIHx8IDE7XHJcbiAgICAgICAgICAgIHRoaXMucG9zdHMgPSBuZXh0LnJvdXRlRGF0YS5teURhdGEucG9zdHM7XHJcbiAgICAgICAgICAgIHRoaXMucG9zdHNTdW0gPSBNYXRoLmNlaWwobmV4dC5yb3V0ZURhdGEubXlEYXRhLnBvc3RzU3VtIC8gdGhpcy5saW1pdCk7XHJcbiAgICAgICAgICAgIHRoaXMucGFnaW5hdGlvbiA9IHRoaXMubWFrZVBhZ2luYXRpb24odGhpcy5jdXJyZW50UGFnZSwgdGhpcy5wYWdpbmF0aW9uTGltaXQsIHRoaXMucG9zdHNTdW0pO1xyXG5cclxuICAgICAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgICAgfTtcclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiBjYW5BY3RpdmF0ZSgkbmV4dEluc3RydWN0aW9uLCBwb3N0c1NlcnZpY2UsICRyb290Um91dGVyKSB7XHJcbiAgICAgICAgcmV0dXJuIHBvc3RzU2VydmljZS5nZXRMaXN0KCRuZXh0SW5zdHJ1Y3Rpb24ucGFyYW1zLnBhZ2UgLSAxKS50aGVuKFxyXG4gICAgICAgICAgICAocmVzKT0+IHtcclxuICAgICAgICAgICAgICAgICRuZXh0SW5zdHJ1Y3Rpb24ucm91dGVEYXRhLm15RGF0YSA9IHtcclxuICAgICAgICAgICAgICAgICAgICBwb3N0czogcmVzLnBvc3RzLFxyXG4gICAgICAgICAgICAgICAgICAgIHBvc3RzU3VtOiByZXMucG9zdHNTdW1cclxuICAgICAgICAgICAgICAgIH07XHJcblxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIChlcnIpPT4ge1xyXG4gICAgICAgICAgICAgICAgaWYgKGVyci5zdGF0dXMgPT0gNDA0KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgJHJvb3RSb3V0ZXIubmF2aWdhdGVCeVVybCgnNDA0JywgdHJ1ZSk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGlmIChlcnIuc3RhdHVzID09IDQwMSkge1xyXG4gICAgICAgICAgICAgICAgICAgICRyb290Um91dGVyLm5hdmlnYXRlKFsnTG9naW4nXSk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICk7XHJcblxyXG4gICAgfVxyXG59KSgpOyJdfQ==
