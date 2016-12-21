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
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFwcC5qcyIsImFwcC5yb3V0ZXMuanMiLCJhdXRoL2F1dGhTZXJ2aWNlLmpzIiwic2hhcmVkL2JhY2tJbWcuanMiLCJzaGFyZWQvY29uZmlybS5qcyIsInNoYXJlZC9maWxlUmVhZC5qcyIsInNoYXJlZC9zZXNzaW9uU2VydmljZS5qcyIsImNvbXBvbmVudHMvYXBwL2FwcC5qcyIsImNvbXBvbmVudHMvYXBwLXBhZ2VzL2FwcC1wYWdlcy5qcyIsImNvbXBvbmVudHMvbG9naW4vbG9naW4uanMiLCJjb21wb25lbnRzL25vdC1mb3VuZC9ub3QtZm91bmQuanMiLCJjb21wb25lbnRzL3Bvc3QtaXRlbS9wb3N0LWl0ZW0uanMiLCJjb21wb25lbnRzL3Bvc3RzL3Bvc3RzLmpzIiwiY29tcG9uZW50cy9wb3N0cy9wb3N0c1NlcnZpY2UuanMiLCJjb21wb25lbnRzL3Bvc3RzLWxpc3QvcG9zdHMtbGlzdC5qcyJdLCJuYW1lcyI6WyJhbmd1bGFyIiwibW9kdWxlIiwiY29uZmlnIiwiJGxvY2F0aW9uUHJvdmlkZXIiLCJ3aW5kb3ciLCJoaXN0b3J5IiwicHVzaFN0YXRlIiwiaHRtbDVNb2RlIiwidmFsdWUiLCJmYWN0b3J5IiwiJGh0dHAiLCJzZXNzaW9uU2VydmljZSIsImxvZ2luIiwiZGF0YSIsInBvc3QiLCJ0aGVuIiwicmVzcG9uc2UiLCJhdXRoIiwic2V0Iiwicm9sZSIsImxvZ291dCIsImRlbGV0ZSIsInJlbW92ZSIsImlzTG9nZ2VkIiwiZ2V0Iiwic2Vzc2lvbiIsImRpcmVjdGl2ZSIsInJlc3RyaWN0IiwibGluayIsIiRzY29wZSIsImVsZW1lbnQiLCIkYXR0cnMiLCIkb2JzZXJ2ZSIsInVybCIsImNzcyIsImNvbXBvbmVudCIsInRlbXBsYXRlIiwiYmluZGluZ3MiLCJjYWxsYmFjayIsImNvbnRyb2xsZXIiLCJDdHJsIiwiZm4iLCJzaG93Iiwib3BlbiIsImNvbmZpcm0iLCJuYW1lIiwibWVzc2FnZSIsImNhbmNlbCIsInJlcXVpcmUiLCJuZ01vZGVsIiwidHJhbnNjbHVkZSIsImZpbGVSZWFkQ2IiLCJtaW1lVHlwZXMiLCIkZWxlbWVudCIsImVsZW0iLCJxdWVyeVNlbGVjdG9yIiwiZmlsZU5hbWUiLCJBcnJheSIsImlzQXJyYXkiLCIkc2V0Vmlld1ZhbHVlIiwib24iLCJldmVudCIsIiRzZXREaXJ0eSIsIiRzZXRUb3VjaGVkIiwiaXNWYWxpZE1pbWVUeXBlIiwiZmlsZSIsInRhcmdldCIsImZpbGVzIiwic29tZSIsInR5cGUiLCIkc2V0VmFsaWRpdHkiLCIkc2Vzc2lvblN0b3JhZ2UiLCJrZXkiLCJwdXQiLCIkcm91dGVDb25maWciLCJwYXRoIiwidXNlQXNEZWZhdWx0IiwidGVtcGxhdGVVcmwiLCIkY2FuQWN0aXZhdGUiLCJjYW5BY3RpdmF0ZSIsInJlZGlyZWN0VG8iLCIkcm9vdFJvdXRlciIsImF1dGhTZXJ2aWNlIiwibmF2aWdhdGUiLCJyZXN1bHQiLCJjcmVkZW50aWFscyIsInBhc3N3b3JkIiwic3VibWl0ZWQiLCJlcnJvciIsInN0YXR1cyIsImVyciIsIiRyb3V0ZXIiLCJwb3N0c1NlcnZpY2UiLCJiZWhhdmlvciIsImlkIiwiY3VycmVudFBhZ2UiLCJwcmV3RmlsZSIsInVzZXJSb2xlIiwic2hvd1ByZXdJbWciLCJyZWFkZXIiLCJGaWxlUmVhZGVyIiwib25sb2FkIiwiZSIsIiRhcHBseSIsImJpbmQiLCJyZWFkQXNEYXRhVVJMIiwiZ29Ub0JhY2siLCJwYWdlIiwicG9zdENyZWF0ZSIsImhlYWRpbmciLCJ0ZXh0IiwiY3JlYXRlIiwiY29uc29sZSIsImxvZyIsInBvc3RVcGRhdGUiLCIkcm91dGVyT25BY3RpdmF0ZSIsIm5leHQiLCJwcmV2Iiwic2Nyb2xsVG8iLCJwYXJhbXMiLCJyb3V0ZURhdGEiLCJwb3N0SXRlbSIsIiRuZXh0SW5zdHJ1Y3Rpb24iLCJuYXZpZ2F0ZUJ5VXJsIiwicmVzIiwiZGF0YVByZXAiLCJ0cmFuc2Zvcm1SZXF1ZXN0IiwiaWRlbnRpdHkiLCJoZWFkZXJzIiwidW5kZWZpbmVkIiwiZ2V0TGlzdCIsImxpbWl0IiwiZmQiLCJGb3JtRGF0YSIsImFwcGVuZCIsInBhZ2luYXRpb25MaW1pdCIsInBhZ2luYXRpb24iLCJwb3N0cyIsInBvc3RzU3VtIiwibWFrZVBhZ2luYXRpb24iLCJtYXhTaXplIiwicGFnZXNTdW0iLCJtYWdpY051bWJlciIsIk1hdGgiLCJjZWlsIiwiY3JlYXRlQXJyIiwiZmxvb3IiLCJtaW4iLCJtYXgiLCJhcnIiLCJpIiwicHVzaCIsImluZGV4Iiwic3BsaWNlIiwibGVuZ3RoIiwiZ29Ub1BhZ2UiLCJteURhdGEiXSwibWFwcGluZ3MiOiJBQUFBOztBQUVBQSxRQUFRQyxPQUFPLE9BQU8sQ0FBQyxjQUFjLGtCQUFrQixnQkFBZ0IsWUFBVzs7QUFFbEZELFFBQVFDLE9BQU8sY0FBYyxDQUFDO0FBQzlCRCxRQUFRQyxPQUFPLGtCQUFrQixDQUFDO0FBQ2xDRCxRQUFRQyxPQUFPLGdCQUFnQjtBQUMvQkQsUUFBUUMsT0FBTyxjQUFjLENBQUMscUJBQTlCO0FDUEE7O0FBRUFELFFBQVFDLE9BQU8sY0FDVkMsNkJBQU8sVUFBVUMsbUJBQW1CO0lBQ2pDLElBQUlDLE9BQU9DLFdBQVdELE9BQU9DLFFBQVFDLFdBQVc7UUFDNUNILGtCQUFrQkksVUFBVTs7SUFHbkNDLE1BQU0sd0JBQXdCLE9BTm5DO0FDRkE7O0FBQUEsQ0FBQyxZQUFZO0lBQ1Q7O0lBRUFSLFFBQVFDLE9BQU8sWUFBWSxJQUN0QlEsUUFBUSwyQ0FBZSxVQUFDQyxPQUFPQyxnQkFBbUI7UUFDL0MsT0FBTztZQUNIQyxPQUFPLFNBQUEsTUFBQ0MsTUFBUztnQkFDYixPQUFPSCxNQUFNSSxLQUFLLGFBQWFELE1BQU1FLEtBQUssVUFBQ0MsVUFBYTtvQkFDcEQsSUFBSSxDQUFDQSxTQUFTSCxLQUFLSSxNQUFNO3dCQUNyQixPQUFPOzs7b0JBR1hOLGVBQWVPLElBQUksWUFBWUYsU0FBU0gsS0FBS007O29CQUU3QyxPQUFPSCxTQUFTSCxLQUFLSTs7O1lBSTdCRyxRQUFRLFNBQUEsU0FBSztnQkFDVCxPQUFPVixNQUFNVyxPQUFPLGFBQWFOLEtB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dEIsT0FBTzs7OztLQXJIM0IiLCJmaWxlIjoiYXBwLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBzdHJpY3QnO1xyXG5cclxuYW5ndWxhci5tb2R1bGUoJ2FwcCcsIFsnYXBwLnJvdXRlcycsICdhcHAuY29tcG9uZW50cycsICdhcHAuc2VydmljZXMnLCAnYXBwLmF1dGgnLCdhcHAuc2hhcmVkJ10pO1xyXG5cclxuYW5ndWxhci5tb2R1bGUoJ2FwcC5yb3V0ZXMnLCBbJ25nQ29tcG9uZW50Um91dGVyJ10pO1xyXG5hbmd1bGFyLm1vZHVsZSgnYXBwLmNvbXBvbmVudHMnLCBbJ25nTWVzc2FnZXMnXSk7XHJcbmFuZ3VsYXIubW9kdWxlKCdhcHAuc2VydmljZXMnLCBbXSk7XHJcbmFuZ3VsYXIubW9kdWxlKCdhcHAuc2hhcmVkJywgWyduZ1Nlc3Npb25TdG9yYWdlJ10pO1xyXG4iLCIndXNlIHN0cmljdCc7XHJcblxyXG5hbmd1bGFyLm1vZHVsZSgnYXBwLnJvdXRlcycpXHJcbiAgICAuY29uZmlnKGZ1bmN0aW9uICgkbG9jYXRpb25Qcm92aWRlcikge1xyXG4gICAgICAgIGlmICh3aW5kb3cuaGlzdG9yeSAmJiB3aW5kb3cuaGlzdG9yeS5wdXNoU3RhdGUpIHtcclxuICAgICAgICAgICAgJGxvY2F0aW9uUHJvdmlkZXIuaHRtbDVNb2RlKHRydWUpO1xyXG4gICAgICAgIH1cclxuICAgIH0pXHJcbiAgICAudmFsdWUoJyRyb3V0ZXJSb290Q29tcG9uZW50JywgJ2FwcCcpO1xyXG5cclxuXHJcbiIsIihmdW5jdGlvbiAoKSB7XHJcbiAgICAndXNlIHN0cmljdCc7XHJcblxyXG4gICAgYW5ndWxhci5tb2R1bGUoJ2FwcC5hdXRoJywgW10pXHJcbiAgICAgICAgLmZhY3RvcnkoJ2F1dGhTZXJ2aWNlJywgKCRodHRwLCBzZXNzaW9uU2VydmljZSkgPT4ge1xyXG4gICAgICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICAgICAgbG9naW46IChkYXRhKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuICRodHRwLnBvc3QoJy9hcGkvYXV0aCcsIGRhdGEpLnRoZW4oKHJlc3BvbnNlKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICghcmVzcG9uc2UuZGF0YS5hdXRoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHNlc3Npb25TZXJ2aWNlLnNldCgndXNlclJvbGUnLCByZXNwb25zZS5kYXRhLnJvbGUpO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHJlc3BvbnNlLmRhdGEuYXV0aDtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgbG9nb3V0OiAoKT0+IHtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gJGh0dHAuZGVsZXRlKCcvYXBpL2F1dGgnKS50aGVuKChyZXNwb25zZSk9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICghcmVzcG9uc2UuZGF0YS5sb2dvdXQpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgc2Vzc2lvblNlcnZpY2UucmVtb3ZlKCd1c2VyUm9sZScpO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHJlc3BvbnNlLmRhdGEubG9nb3V0O1xyXG4gICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgIGlzTG9nZ2VkOiAoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuICRodHRwLmdldCgnL2FwaS9hdXRoJykudGhlbigocmVzcG9uc2UpPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoIXJlc3BvbnNlLmRhdGEuc2Vzc2lvbikge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICBzZXNzaW9uU2VydmljZS5zZXQoJ3VzZXJSb2xlJywgcmVzcG9uc2UuZGF0YS5yb2xlKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiByZXNwb25zZS5kYXRhLnNlc3Npb247XHJcbiAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxufSkoKTsiLCIoZnVuY3Rpb24gKCkge1xyXG4gICAgJ3VzZSBzdHJpY3QnO1xyXG5cclxuICAgIGFuZ3VsYXIubW9kdWxlKCdhcHAuc2hhcmVkJykuZGlyZWN0aXZlKCdiYWNrSW1nJywgKCk9PiB7XHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgcmVzdHJpY3Q6ICdBJyxcclxuICAgICAgICAgICAgbGluazogZnVuY3Rpb24gKCRzY29wZSwgZWxlbWVudCwgJGF0dHJzKSB7XHJcbiAgICAgICAgICAgICAgICAkYXR0cnMuJG9ic2VydmUoJ2JhY2tJbWcnLCBmdW5jdGlvbih1cmwpe1xyXG4gICAgICAgICAgICAgICAgICAgIGVsZW1lbnQuY3NzKHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgJ2JhY2tncm91bmQtaW1hZ2UnOiAndXJsKCcgKyB1cmwgKyAnKSdcclxuICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfSlcclxufSkoKTsiLCIoZnVuY3Rpb24gKCkge1xyXG4gICAgJ3VzZSBzdHJpY3QnO1xyXG5cclxuICAgIGFuZ3VsYXIubW9kdWxlKCdhcHAuc2hhcmVkJykuY29tcG9uZW50KCdjb25maXJtJywge1xyXG4gICAgICAgIHRlbXBsYXRlOiBgPGRpdiBuZy1jbGFzcz1cIiRjdHJsLnNob3cgPyAnb3Blbic6JydcIiBjbGFzcz1cInBvcHVwXCI+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJwb3B1cC1jb250ZW50XCI+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8cCBjbGFzcz1cInBvcHVwLXRpdGxlXCI+QXJlIHlvdSBzdXJlPzwvcD5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxidXR0b24gbmctY2xpY2s9XCIkY3RybC5jb25maXJtKClcIiBjbGFzcz1cImJ0biBidG4tLXN1Y2Nlc3NcIj5ZZXM8L2J1dHRvbj5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxidXR0b24gbmctY2xpY2s9XCIkY3RybC5jYW5jZWwoKVwiIGNsYXNzPVwiYnRuIGJ0bi0td2FybmluZ1wiPk5vPC9idXR0b24+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICAgICAgICAgPC9kaXY+YCxcclxuICAgICAgICBiaW5kaW5nczoge1xyXG4gICAgICAgICAgICBjYWxsYmFjazogJz0nXHJcbiAgICAgICAgfSxcclxuICAgICAgICBjb250cm9sbGVyOiBDdHJsXHJcbiAgICB9KTtcclxuXHJcbiAgICBmdW5jdGlvbiBDdHJsKCkge1xyXG4gICAgICAgIHRoaXMuZm4gPSBudWxsO1xyXG4gICAgICAgIHRoaXMuc2hvdyA9IGZhbHNlO1xyXG4gICAgICAgIHRoaXMub3BlbiA9IChmbik9PiB7XHJcbiAgICAgICAgICAgIHRoaXMuZm4gPSBmbjtcclxuICAgICAgICAgICAgdGhpcy5zaG93ID0gdHJ1ZTtcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICB0aGlzLmNvbmZpcm0gPSAoKT0+IHtcclxuICAgICAgICAgICAgaWYgKCF0aGlzLmZuKSB7XHJcbiAgICAgICAgICAgICAgICB0aHJvdyB7XHJcbiAgICAgICAgICAgICAgICAgICAgbmFtZTogJ2NvbmZpcm0gY29tcG9uZW50JyxcclxuICAgICAgICAgICAgICAgICAgICBtZXNzYWdlOiAnZm4oKSBub3QgZm91bmQnXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGlmICh0eXBlb2YgdGhpcy5mbiAhPSAnZnVuY3Rpb24nKSB7XHJcbiAgICAgICAgICAgICAgICB0aHJvdyB7XHJcbiAgICAgICAgICAgICAgICAgICAgbmFtZTogJ2NvbmZpcm0gY29tcG9uZW50JyxcclxuICAgICAgICAgICAgICAgICAgICBtZXNzYWdlOiAnZm4oKSBub3QgZnVuY3Rpb24nXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIHRoaXMuZm4oKTtcclxuICAgICAgICAgICAgdGhpcy5zaG93ID0gZmFsc2U7XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgdGhpcy5jYW5jZWwgPSAoKT0+IHtcclxuICAgICAgICAgICAgdGhpcy5mbiA9IG51bGw7XHJcbiAgICAgICAgICAgIHRoaXMuc2hvdyA9IGZhbHNlO1xyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIHRoaXMuY2FsbGJhY2sgPSB0aGlzLm9wZW47XHJcbiAgICB9XHJcbn0pKCk7XHJcblxyXG4iLCIoZnVuY3Rpb24gKCkge1xyXG4gICAgJ3VzZSBzdHJpY3QnO1xyXG5cclxuICAgIGFuZ3VsYXIubW9kdWxlKCdhcHAuc2hhcmVkJykuY29tcG9uZW50KCdmaWxlUmVhZCcsIHtcclxuICAgICAgICB0ZW1wbGF0ZTogYDxwPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICA8c3Bhbj5GaWxlIDogPC9zcGFuPiBcclxuICAgICAgICAgICAgICAgICAgICAgICAgPGEgY2xhc3M9XCJmaWxlLXJlYWRfcmVtb3ZlXCIgbmctaWY9XCIkY3RybC5maWxlTmFtZVwiIG5nLWNsaWNrPVwiJGN0cmwucmVtb3ZlKClcIiBuZy1ocmVmPVwiI1wiPjxpIGNsYXNzPVwiaWNvbiBmYSBmYS10aW1lc1wiPjwvaT4gPC9hPiBcclxuICAgICAgICAgICAgICAgICAgICAgICAge3skY3RybC5maWxlTmFtZX19XHJcbiAgICAgICAgICAgICAgICAgICA8L3A+XHJcbiAgICAgICAgICAgICAgICAgICA8aW5wdXQgdHlwZT1cImZpbGVcIj5cclxuICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJuZy10cmFuc2NsdWRlXCI+PC9kaXY+YCxcclxuICAgICAgICByZXF1aXJlOiB7XHJcbiAgICAgICAgICAgIG5nTW9kZWw6ICduZ01vZGVsJ1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgdHJhbnNjbHVkZTogdHJ1ZSxcclxuICAgICAgICBiaW5kaW5nczoge1xyXG4gICAgICAgICAgICBmaWxlUmVhZENiOiAnPCcsXHJcbiAgICAgICAgICAgIG1pbWVUeXBlczogJzwnXHJcbiAgICAgICAgfSxcclxuICAgICAgICBjb250cm9sbGVyOiBDdHJsXHJcbiAgICB9KTtcclxuXHJcbiAgICBmdW5jdGlvbiBDdHJsKCRlbGVtZW50LCAkc2NvcGUpIHtcclxuICAgICAgICBsZXQgZWxlbSA9IGFuZ3VsYXIuZWxlbWVudCgkZWxlbWVudFswXS5xdWVyeVNlbGVjdG9yKCdbdHlwZT1cImZpbGVcIl0nKSk7XHJcblxyXG4gICAgICAgIHRoaXMuZmlsZU5hbWUgPSBudWxsO1xyXG5cclxuICAgICAgICBpZiAoIUFycmF5LmlzQXJyYXkodGhpcy5taW1lVHlwZXMpKSB7XHJcbiAgICAgICAgICAgIHRoaXMubWltZVR5cGVzID0gW3RoaXMubWltZVR5cGVzXTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHRoaXMucmVtb3ZlID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICBlbGVtWzBdLnZhbHVlID0gJyc7XHJcbiAgICAgICAgICAgIHRoaXMuZmlsZU5hbWUgPSBudWxsO1xyXG4gICAgICAgICAgICB0aGlzLm5nTW9kZWwuJHNldFZpZXdWYWx1ZShudWxsKTtcclxuICAgICAgICAgICAgdGhpcy5maWxlUmVhZENiKCk7XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgZWxlbS5vbignY2hhbmdlJywgKGV2ZW50KT0+IHtcclxuICAgICAgICAgICAgdGhpcy5uZ01vZGVsLiRzZXREaXJ0eSgpO1xyXG4gICAgICAgICAgICB0aGlzLm5nTW9kZWwuJHNldFRvdWNoZWQoKTtcclxuXHJcbiAgICAgICAgICAgIGxldCBpc1ZhbGlkTWltZVR5cGUgPSBudWxsO1xyXG4gICAgICAgICAgICBsZXQgZmlsZSA9IGV2ZW50LnRhcmdldC5maWxlc1swXTtcclxuXHJcbiAgICAgICAgICAgIGlmIChmaWxlKSB7XHJcbiAgICAgICAgICAgICAgICBpc1ZhbGlkTWltZVR5cGUgPSB0aGlzLm1pbWVUeXBlcy5zb21lKGZ1bmN0aW9uICh0eXBlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHR5cGUgPT09IGZpbGUudHlwZTtcclxuICAgICAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgICAgIGlmICghaXNWYWxpZE1pbWVUeXBlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgZmlsZSA9IG51bGw7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5uZ01vZGVsLiRzZXRWYWxpZGl0eSgnbWltZVR5cGVzJywgZmFsc2UpO1xyXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLm5nTW9kZWwuJHNldFZhbGlkaXR5KCdtaW1lVHlwZXMnLCB0cnVlKTtcclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLm5nTW9kZWwuJHNldFZhbGlkaXR5KCdtaW1lVHlwZXMnLCB0cnVlKTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgdGhpcy5maWxlTmFtZSA9IGZpbGUgPyBmaWxlLm5hbWUgOiBudWxsO1xyXG5cclxuICAgICAgICAgICAgdGhpcy5uZ01vZGVsLiRzZXRWaWV3VmFsdWUoZmlsZSk7XHJcblxyXG4gICAgICAgICAgICB0aGlzLmZpbGVSZWFkQ2IoKTtcclxuICAgICAgICB9KTtcclxuICAgIH1cclxufSkoKTtcclxuIiwiKGZ1bmN0aW9uICgpIHtcclxuICAgICd1c2Ugc3RyaWN0JztcclxuXHJcbiAgICBhbmd1bGFyLm1vZHVsZSgnYXBwLnNoYXJlZCcpLmZhY3RvcnkoJ3Nlc3Npb25TZXJ2aWNlJywgKCRzZXNzaW9uU3RvcmFnZSk9PiB7XHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgZ2V0OiBmdW5jdGlvbiAoa2V5KSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gJHNlc3Npb25TdG9yYWdlLmdldChrZXkpO1xyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBzZXQ6IGZ1bmN0aW9uIChrZXksIHZhbHVlKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gJHNlc3Npb25TdG9yYWdlLnB1dChrZXksIHZhbHVlKTtcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgcmVtb3ZlOiBmdW5jdGlvbiAoa2V5KSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gJHNlc3Npb25TdG9yYWdlLnJlbW92ZShrZXkpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfSlcclxufSkoKTsiLCIoZnVuY3Rpb24gKCkge1xyXG4gICAgJ3VzZSBzdHJpY3QnO1xyXG5cclxuICAgIGFuZ3VsYXIubW9kdWxlKCdhcHAuY29tcG9uZW50cycpLmNvbXBvbmVudCgnYXBwJywge1xyXG4gICAgICAgIHRlbXBsYXRlOiAnPG5nLW91dGxldD48L25nLW91dGxldD4nLFxyXG4gICAgICAgICRyb3V0ZUNvbmZpZzogW1xyXG4gICAgICAgICAgICB7cGF0aDogJy8uLi4nLCBuYW1lOiAnQXBwUGFnZXMnLCBjb21wb25lbnQ6ICdhcHBQYWdlcyd9LFxyXG4gICAgICAgICAgICB7cGF0aDogJy9sb2dpbicsIG5hbWU6ICdMb2dpbicsIGNvbXBvbmVudDogJ2xvZ2luJywgdXNlQXNEZWZhdWx0OiB0cnVlfVxyXG4gICAgICAgIF1cclxuICAgIH0pO1xyXG59KSgpO1xyXG5cclxuIiwiKGZ1bmN0aW9uICgpIHtcclxuICAgICd1c2Ugc3RyaWN0JztcclxuXHJcbiAgICBhbmd1bGFyLm1vZHVsZSgnYXBwLmNvbXBvbmVudHMnKVxyXG4gICAgICAgIC5jb21wb25lbnQoJ2FwcFBhZ2VzJywge1xyXG4gICAgICAgICAgICB0ZW1wbGF0ZVVybDogJ2FwcC1wYWdlcy5odG1sJyxcclxuICAgICAgICAgICAgJGNhbkFjdGl2YXRlOiBjYW5BY3RpdmF0ZSxcclxuICAgICAgICAgICAgY29udHJvbGxlcjogQ3RybCxcclxuICAgICAgICAgICAgJHJvdXRlQ29uZmlnOiBbXHJcbiAgICAgICAgICAgICAgICB7cGF0aDogJy9ob21lJywgbmFtZTogJ0hvbWUnLCBjb21wb25lbnQ6ICdob21lJ30sXHJcbiAgICAgICAgICAgICAgICB7cGF0aDogJy9wb3N0cy8uLi4nLCBuYW1lOiAnUG9zdHMnLCBjb21wb25lbnQ6ICdwb3N0cycsIHVzZUFzRGVmYXVsdDogdHJ1ZX0sXHJcbiAgICAgICAgICAgICAgICB7cGF0aDogJy8nLCByZWRpcmVjdFRvOiBbJy9Mb2dpbiddfSxcclxuICAgICAgICAgICAgICAgIHtwYXRoOiAnLyoqJywgbmFtZTogJ05vdEZvdW5kJywgY29tcG9uZW50OiAnbm90Rm91bmQnfSxcclxuICAgICAgICAgICAgICAgIHtwYXRoOiAnLzQwNCcsIG5hbWU6ICdOb3RGb3VuZCcsIGNvbXBvbmVudDogJ25vdEZvdW5kJ31cclxuICAgICAgICAgICAgXVxyXG4gICAgICAgIH0pO1xyXG5cclxuICAgIC8vIGNvbXBvbmVudCBjb250cm9sbGVyXHJcbiAgICBmdW5jdGlvbiBDdHJsKCRyb290Um91dGVyLCBhdXRoU2VydmljZSkge1xyXG4gICAgICAgIHRoaXMubG9nb3V0ID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICBhdXRoU2VydmljZS5sb2dvdXQoKS50aGVuKCgpPT4ge1xyXG4gICAgICAgICAgICAgICAgJHJvb3RSb3V0ZXIubmF2aWdhdGUoWydMb2dpbiddKTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgYXV0aFNlcnZpY2UuaXNMb2dnZWQoKS50aGVuKChyZXN1bHQpPT4ge1xyXG4gICAgICAgICAgICBpZiAoIXJlc3VsdCkge1xyXG4gICAgICAgICAgICAgICAgJHJvb3RSb3V0ZXIubmF2aWdhdGUoWydMb2dpbiddKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pXHJcbiAgICB9XHJcblxyXG4gICAgLy8gY2FuQWN0aXZhdGUgcm91dGVcclxuICAgIGZ1bmN0aW9uIGNhbkFjdGl2YXRlKCRyb290Um91dGVyLCBhdXRoU2VydmljZSkge1xyXG4gICAgICAgIHJldHVybiBhdXRoU2VydmljZS5pc0xvZ2dlZCgpLnRoZW4oKHJlc3VsdCk9PiB7XHJcbiAgICAgICAgICAgIGlmICghcmVzdWx0KSB7XHJcbiAgICAgICAgICAgICAgICAkcm9vdFJvdXRlci5uYXZpZ2F0ZShbJ0xvZ2luJ10pO1xyXG5cclxuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgICB9KTtcclxuICAgIH1cclxufSkoKTsiLCIoZnVuY3Rpb24gKCkge1xyXG4gICAgJ3VzZSBzdHJpY3QnO1xyXG5cclxuICAgIGFuZ3VsYXIubW9kdWxlKCdhcHAuY29tcG9uZW50cycpXHJcbiAgICAgICAgLmNvbXBvbmVudCgnbG9naW4nLCB7XHJcbiAgICAgICAgICAgIHRlbXBsYXRlVXJsOiAnbG9naW4uaHRtbCcsXHJcbiAgICAgICAgICAgIGNvbnRyb2xsZXI6IEN0cmwsXHJcbiAgICAgICAgICAgICRjYW5BY3RpdmF0ZTogY2FuQWN0aXZhdGVcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAvLyBjb21wb25lbnQncyBjb250cm9sbGVyXHJcbiAgICBmdW5jdGlvbiBDdHJsKGF1dGhTZXJ2aWNlLCAkcm9vdFJvdXRlcikge1xyXG4gICAgICAgIHRoaXMuY3JlZGVudGlhbHMgPSB7XHJcbiAgICAgICAgICAgIG5hbWU6ICcnLFxyXG4gICAgICAgICAgICBwYXNzd29yZDogJydcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICB0aGlzLnN1Ym1pdGVkID0gZmFsc2U7XHJcbiAgICAgICAgXHJcbiAgICAgICAgdGhpcy5lcnJvciA9IHtcclxuICAgICAgICAgICAgc3RhdHVzOiBmYWxzZSxcclxuICAgICAgICAgICAgbWVzc2FnZTogJydcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICB0aGlzLmxvZ2luID0gZnVuY3Rpb24gKGRhdGEpIHtcclxuICAgICAgICAgICAgaWYgKHRoaXMuc3VibWl0ZWQpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB0aGlzLnN1Ym1pdGVkID0gdHJ1ZTtcclxuXHJcbiAgICAgICAgICAgIGF1dGhTZXJ2aWNlLmxvZ2luKGRhdGEpLnRoZW4oXHJcbiAgICAgICAgICAgICAgICAocmVzdWx0KT0+IHtcclxuICAgICAgICAgICAgICAgICAgICBpZiAocmVzdWx0KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICRyb290Um91dGVyLm5hdmlnYXRlKFsnQXBwUGFnZXMnXSk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgIChlcnIpPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZXJyb3Iuc3RhdHVzID0gdHJ1ZTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGVyci5zdGF0dXMgPT0gNDAxKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuZXJyb3IubWVzc2FnZSA9ICdVc2VybmFtZSBvciBwYXNzd29yZCBpcyBpbmNvcnJlY3QnXHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgICAgICB0aGlzLnN1Ym1pdGVkID0gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICk7XHJcbiAgICAgICAgfTtcclxuICAgIH1cclxuXHJcbiAgICAvLyBjYW5BY3RpdmF0ZSByb3V0ZVxyXG4gICAgZnVuY3Rpb24gY2FuQWN0aXZhdGUoYXV0aFNlcnZpY2UsICRyb290Um91dGVyKSB7XHJcbiAgICAgICAgcmV0dXJuIGF1dGhTZXJ2aWNlLmlzTG9nZ2VkKCkudGhlbigocmVzdWx0KT0+IHtcclxuICAgICAgICAgICAgaWYgKHJlc3VsdCkge1xyXG4gICAgICAgICAgICAgICAgJHJvb3RSb3V0ZXIubmF2aWdhdGUoWydBcHBQYWdlcyddKTtcclxuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcbn0pKCk7IiwiKGZ1bmN0aW9uICgpIHtcclxuICAgICd1c2Ugc3RyaWN0JztcclxuICAgIGFuZ3VsYXIubW9kdWxlKCdhcHAuY29tcG9uZW50cycpLmNvbXBvbmVudCgnbm90Rm91bmQnLCB7XHJcbiAgICAgICAgdGVtcGxhdGVVcmw6ICdub3QtZm91bmQuaHRtbCdcclxuICAgIH0pO1xyXG59KSgpOyIsIihmdW5jdGlvbiAoKSB7XHJcbiAgICAndXNlIHN0cmljdCc7XHJcblxyXG4gICAgYW5ndWxhci5tb2R1bGUoJ2FwcC5jb21wb25lbnRzJykuY29tcG9uZW50KCdwb3N0SXRlbScsIHtcclxuICAgICAgICB0ZW1wbGF0ZVVybDogJ3Bvc3QtaXRlbS5odG1sJyxcclxuICAgICAgICBjb250cm9sbGVyOiBDdHJsLFxyXG4gICAgICAgICRjYW5BY3RpdmF0ZTogY2FuQWN0aXZhdGUsXHJcbiAgICAgICAgYmluZGluZ3M6IHtcclxuICAgICAgICAgICAgJHJvdXRlcjogJzwnXHJcbiAgICAgICAgfVxyXG4gICAgfSk7XHJcblxyXG5cclxuICAgIC8vIGNvbXBvbmVudCdzIGNvbnRyb2xsZXJcclxuICAgIGZ1bmN0aW9uIEN0cmwocG9zdHNTZXJ2aWNlLCBzZXNzaW9uU2VydmljZSwgJHJvb3RSb3V0ZXIsICRzY29wZSkge1xyXG4gICAgICAgIHRoaXMuYmVoYXZpb3IgPSBudWxsO1xyXG4gICAgICAgIHRoaXMuaWQgPSBudWxsO1xyXG4gICAgICAgIHRoaXMucG9zdCA9IG51bGw7XHJcbiAgICAgICAgdGhpcy5jdXJyZW50UGFnZSA9IG51bGw7XHJcbiAgICAgICAgdGhpcy5maWxlID0gbnVsbDtcclxuICAgICAgICB0aGlzLnByZXdGaWxlID0gbnVsbDtcclxuICAgICAgICB0aGlzLnVzZXJSb2xlID0gc2Vzc2lvblNlcnZpY2UuZ2V0KCd1c2VyUm9sZScpO1xyXG5cclxuICAgICAgICB0aGlzLnNob3dQcmV3SW1nID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAvKiogSSB1c2VkIHNjb3BlLiRhcHBseSBiZWNhdXNlIHdoZW4gaW1hZ2UgbG9hZGVkIHZpZXcgbm90IHVwZGF0ZSBpdCAqL1xyXG5cclxuICAgICAgICAgICAgaWYgKHRoaXMuZmlsZSkge1xyXG4gICAgICAgICAgICAgICAgdmFyIHJlYWRlciA9IG5ldyBGaWxlUmVhZGVyKCk7XHJcblxyXG4gICAgICAgICAgICAgICAgcmVhZGVyLm9ubG9hZCA9IGZ1bmN0aW9uIChlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5wcmV3RmlsZSA9IGUudGFyZ2V0LnJlc3VsdDtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgJHNjb3BlLiRhcHBseSgpO1xyXG5cclxuICAgICAgICAgICAgICAgIH0uYmluZCh0aGlzKTtcclxuXHJcbiAgICAgICAgICAgICAgICByZWFkZXIucmVhZEFzRGF0YVVSTCh0aGlzLmZpbGUpO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHRoaXMucHJld0ZpbGUgPSBudWxsO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfS5iaW5kKHRoaXMpO1xyXG5cclxuICAgICAgICB0aGlzLmdvVG9CYWNrID0gKCk9PiB7XHJcbiAgICAgICAgICAgIHRoaXMuJHJvdXRlci5uYXZpZ2F0ZShbJ1Bvc3RzTGlzdCcsIHtwYWdlOiB0aGlzLmN1cnJlbnRQYWdlfV0pO1xyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIHRoaXMucG9zdENyZWF0ZSA9ICgpPT4ge1xyXG4gICAgICAgICAgICBsZXQgZGF0YSA9IHtcclxuICAgICAgICAgICAgICAgIGhlYWRpbmc6IHRoaXMucG9zdC5oZWFkaW5nLFxyXG4gICAgICAgICAgICAgICAgdGV4dDogdGhpcy5wb3N0LnRleHQsXHJcbiAgICAgICAgICAgICAgICBmaWxlOiB0aGlzLmZpbGVcclxuICAgICAgICAgICAgfTtcclxuXHJcbiAgICAgICAgICAgIHBvc3RzU2VydmljZS5jcmVhdGUoZGF0YSkudGhlbigoZGF0YSk9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy4kcm91dGVyLm5hdmlnYXRlKFsnUG9zdHNMaXN0Jywge3BhZ2U6IDF9XSk7XHJcbiAgICAgICAgICAgICAgICB9LCAoZXJyKT0+IHtcclxuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhlcnIpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICApXHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgdGhpcy5wb3N0VXBkYXRlID0gKCk9PiB7XHJcbiAgICAgICAgICAgIGxldCBkYXRhID0ge1xyXG4gICAgICAgICAgICAgICAgaGVhZGluZzogdGhpcy5wb3N0LmhlYWRpbmcsXHJcbiAgICAgICAgICAgICAgICB0ZXh0OiB0aGlzLnBvc3QudGV4dCxcclxuICAgICAgICAgICAgICAgIGZpbGU6IHRoaXMuZmlsZVxyXG4gICAgICAgICAgICB9O1xyXG5cclxuICAgICAgICAgICAgcG9zdHNTZXJ2aWNlLnB1dCh0aGlzLmlkLCBkYXRhKS50aGVuKChkYXRhKT0+IHtcclxuICAgICAgICAgICAgICAgIHRoaXMuJHJvdXRlci5uYXZpZ2F0ZShbJ1Bvc3RzTGlzdCcsIHtwYWdlOiB0aGlzLmN1cnJlbnRQYWdlfV0pO1xyXG4gICAgICAgICAgICB9KVxyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIHRoaXMuJHJvdXRlck9uQWN0aXZhdGUgPSAobmV4dCwgcHJldikgPT4ge1xyXG4gICAgICAgICAgICB3aW5kb3cuc2Nyb2xsVG8oMCwgMCk7XHJcblxyXG4gICAgICAgICAgICBpZiAobmV4dC5wYXJhbXMucGFnZSkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5jdXJyZW50UGFnZSA9IG5leHQucGFyYW1zLnBhZ2U7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmN1cnJlbnRQYWdlID0gcHJldiA/IHByZXYucGFyYW1zLnBhZ2UgOiAxO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICB0aGlzLnBvc3QgPSBuZXh0LnJvdXRlRGF0YS5wb3N0SXRlbTtcclxuICAgICAgICAgICAgdGhpcy5pZCA9IG5leHQucGFyYW1zLmlkO1xyXG4gICAgICAgICAgICB0aGlzLmJlaGF2aW9yID0gbmV4dC5yb3V0ZURhdGEuZGF0YS5iZWhhdmlvciA/IG5leHQucm91dGVEYXRhLmRhdGEuYmVoYXZpb3IgOiBudWxsO1xyXG4gICAgICAgIH07XHJcblxyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIGNhbkFjdGl2YXRlKCRyb290Um91dGVyLCAkbmV4dEluc3RydWN0aW9uLCBzZXNzaW9uU2VydmljZSwgcG9zdHNTZXJ2aWNlKSB7XHJcbiAgICAgICAgbGV0IHVzZXJSb2xlID0gc2Vzc2lvblNlcnZpY2UuZ2V0KCd1c2VyUm9sZScpLFxyXG4gICAgICAgICAgICBiZWhhdmlvciA9ICRuZXh0SW5zdHJ1Y3Rpb24ucm91dGVEYXRhLmRhdGEuYmVoYXZpb3IsXHJcbiAgICAgICAgICAgIGlkID0gJG5leHRJbnN0cnVjdGlvbi5wYXJhbXMuaWQ7XHJcblxyXG4gICAgICAgIGlmIChiZWhhdmlvciAmJiB1c2VyUm9sZSA+IDEpIHtcclxuICAgICAgICAgICAgJHJvb3RSb3V0ZXIubmF2aWdhdGVCeVVybCgnNDA0JywgdHJ1ZSk7XHJcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmIChiZWhhdmlvciA9PSAnY3JlYXRlJykge1xyXG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiBwb3N0c1NlcnZpY2UuZ2V0KGlkKVxyXG4gICAgICAgICAgICAudGhlbihcclxuICAgICAgICAgICAgICAgIChyZXMpPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgICRuZXh0SW5zdHJ1Y3Rpb24ucm91dGVEYXRhLnBvc3RJdGVtID0gcmVzO1xyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgIChlcnIpPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChlcnIuc3RhdHVzID09IDQwMSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAkcm9vdFJvdXRlci5uYXZpZ2F0ZShbJ0xvZ2luJ10pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIGlmIChlcnIuc3RhdHVzID09IDQwNCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAkcm9vdFJvdXRlci5uYXZpZ2F0ZUJ5VXJsKCc0MDQnLCB0cnVlKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgKTtcclxuICAgIH1cclxufSkoKTsiLCIoZnVuY3Rpb24gKCkge1xyXG4gICAgJ3VzZSBzdHJpY3QnO1xyXG5cclxuICAgIGFuZ3VsYXIubW9kdWxlKCdhcHAuY29tcG9uZW50cycpLmNvbXBvbmVudCgncG9zdHMnLCB7XHJcbiAgICAgICAgdGVtcGxhdGVVcmw6ICdwb3N0cy5odG1sJyxcclxuICAgICAgICBiaW5kaW5nczoge1xyXG4gICAgICAgICAgICAkcm91dGVyOiAnPCdcclxuICAgICAgICB9LFxyXG4gICAgICAgICRyb3V0ZUNvbmZpZzogW1xyXG4gICAgICAgICAgICB7cGF0aDogJy86cGFnZScsIG5hbWU6ICdQb3N0c0xpc3QnLCBjb21wb25lbnQ6ICdwb3N0c0xpc3QnfSxcclxuICAgICAgICAgICAge3BhdGg6ICcvOnBhZ2UvOmlkJywgbmFtZTogJ1Bvc3REZXRhaWwnLCBjb21wb25lbnQ6ICdwb3N0SXRlbSd9LFxyXG4gICAgICAgICAgICB7cGF0aDogJy9jcmVhdGUnLCBuYW1lOiAnUG9zdENyZWF0ZScsIGRhdGE6IHtiZWhhdmlvcjogJ2NyZWF0ZSd9LCBjb21wb25lbnQ6ICdwb3N0SXRlbSd9LFxyXG4gICAgICAgICAgICB7cGF0aDogJy86cGFnZS9lZGl0LzppZCcsIG5hbWU6ICdQb3N0RWRpdCcsIGRhdGE6IHtiZWhhdmlvcjogJ2VkaXQnfSwgY29tcG9uZW50OiAncG9zdEl0ZW0nfSxcclxuICAgICAgICAgICAge3BhdGg6ICcvJywgcmVkaXJlY3RUbzogWydQb3N0c0xpc3QnLCB7cGFnZTogMX1dfVxyXG4gICAgICAgIF1cclxuICAgIH0pO1xyXG59KSgpOyIsIihmdW5jdGlvbiAoKSB7XHJcbiAgICAndXNlIHN0cmljdCc7XHJcblxyXG4gICAgYW5ndWxhci5tb2R1bGUoJ2FwcC5zZXJ2aWNlcycpLmZhY3RvcnkoJ3Bvc3RzU2VydmljZScsICgkaHR0cCkgPT4ge1xyXG5cclxuXHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgZ2V0OiAoaWQpID0+IHtcclxuICAgICAgICAgICAgICAgIHJldHVybiAkaHR0cC5nZXQoJ2FwaS9wb3N0cy8nICsgaWQpXHJcbiAgICAgICAgICAgICAgICAgICAgLnRoZW4oKHJlc3BvbnNlKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiByZXNwb25zZS5kYXRhO1xyXG4gICAgICAgICAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIHB1dDogKGlkLCBkYXRhKT0+IHtcclxuXHJcbiAgICAgICAgICAgICAgICByZXR1cm4gJGh0dHAucHV0KCdhcGkvcG9zdHMvJyArIGlkLCBkYXRhUHJlcChkYXRhKSwge1xyXG4gICAgICAgICAgICAgICAgICAgIHRyYW5zZm9ybVJlcXVlc3Q6IGFuZ3VsYXIuaWRlbnRpdHksXHJcbiAgICAgICAgICAgICAgICAgICAgaGVhZGVyczogeydDb250ZW50LVR5cGUnOiB1bmRlZmluZWR9XHJcbiAgICAgICAgICAgICAgICB9KS50aGVuKChyZXNwb25zZSk9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHJlc3BvbnNlO1xyXG4gICAgICAgICAgICAgICAgfSlcclxuXHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIHJlbW92ZTogKGlkKT0+IHtcclxuICAgICAgICAgICAgICAgIHJldHVybiAkaHR0cC5kZWxldGUoJ2FwaS9wb3N0cy8nICsgaWQpLnRoZW4oKHJlc3BvbnNlKT0+IHtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gcmVzcG9uc2U7XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgY3JlYXRlOiAoZGF0YSk9PiB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gJGh0dHAucG9zdCgnYXBpL3Bvc3RzJywgZGF0YVByZXAoZGF0YSksIHtcclxuICAgICAgICAgICAgICAgICAgICB0cmFuc2Zvcm1SZXF1ZXN0OiBhbmd1bGFyLmlkZW50aXR5LFxyXG4gICAgICAgICAgICAgICAgICAgIGhlYWRlcnM6IHsnQ29udGVudC1UeXBlJzogdW5kZWZpbmVkfVxyXG4gICAgICAgICAgICAgICAgfSkudGhlbigocmVzcG9uc2UpPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiByZXNwb25zZTtcclxuICAgICAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIGdldExpc3Q6IChwYWdlID0gMSwgbGltaXQgPSA5KSA9PiB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gJGh0dHAuZ2V0KCdhcGkvcG9zdHM/bGltaXQ9JyArIGxpbWl0ICsgJyZwYWdlPScgKyBwYWdlKS50aGVuKChyZXNwb25zZSkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiByZXNwb25zZS5kYXRhO1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9KTtcclxuXHJcbiAgICBmdW5jdGlvbiBkYXRhUHJlcChkYXRhKSB7XHJcbiAgICAgICAgbGV0IGZkID0gbmV3IEZvcm1EYXRhKCk7XHJcblxyXG4gICAgICAgIGZvciAobGV0IGtleSBpbiBkYXRhKSB7XHJcbiAgICAgICAgICAgIGZkLmFwcGVuZChrZXksIGRhdGFba2V5XSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4gZmQ7XHJcbiAgICB9XHJcblxyXG59KSgpOyIsIihmdW5jdGlvbiAoKSB7XHJcbiAgICAndXNlIHN0cmljdCc7XHJcblxyXG4gICAgYW5ndWxhci5tb2R1bGUoJ2FwcC5jb21wb25lbnRzJykuY29tcG9uZW50KCdwb3N0c0xpc3QnLCB7XHJcbiAgICAgICAgdGVtcGxhdGVVcmw6ICdwb3N0cy1saXN0Lmh0bWwnLFxyXG4gICAgICAgIGJpbmRpbmdzOiB7XHJcbiAgICAgICAgICAgICRyb3V0ZXI6ICc8JyxcclxuICAgICAgICAgICAgY29uZmlybTogJzwnXHJcbiAgICAgICAgfSxcclxuICAgICAgICBjb250cm9sbGVyOiBDdHJsLFxyXG4gICAgICAgICRjYW5BY3RpdmF0ZTogY2FuQWN0aXZhdGVcclxuICAgIH0pO1xyXG5cclxuICAgIGZ1bmN0aW9uIEN0cmwocG9zdHNTZXJ2aWNlLCBzZXNzaW9uU2VydmljZSkge1xyXG4gICAgICAgIHRoaXMucGFnaW5hdGlvbkxpbWl0ID0gNTtcclxuICAgICAgICB0aGlzLnBhZ2luYXRpb24gPSBbXTtcclxuICAgICAgICB0aGlzLmxpbWl0ID0gOTtcclxuICAgICAgICB0aGlzLnBvc3RzID0gbnVsbDtcclxuICAgICAgICB0aGlzLmN1cnJlbnRQYWdlID0gbnVsbDtcclxuICAgICAgICB0aGlzLnBvc3RzU3VtID0gbnVsbDtcclxuICAgICAgICB0aGlzLnVzZXJSb2xlID0gc2Vzc2lvblNlcnZpY2UuZ2V0KCd1c2VyUm9sZScpIHx8IDI7XHJcbiAgICAgICAgdGhpcy5jb25maXJtID0gbnVsbDtcclxuXHJcbiAgICAgICAgLy8gcmV0dXJuIHBhZ2luYXRpb24gYXJyXHJcbiAgICAgICAgdGhpcy5tYWtlUGFnaW5hdGlvbiA9IChjdXJyZW50UGFnZSwgbWF4U2l6ZSwgcGFnZXNTdW0pID0+IHtcclxuICAgICAgICAgICAgbGV0IG1hZ2ljTnVtYmVyO1xyXG5cclxuICAgICAgICAgICAgaWYgKCFtYXhTaXplIHx8ICFjdXJyZW50UGFnZSkge1xyXG4gICAgICAgICAgICAgICAgdGhyb3cge1xyXG4gICAgICAgICAgICAgICAgICAgIG1lc3NhZ2U6ICdwYWdpbmF0aW9uIHdyb25nIGRhdGEnXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIG1hZ2ljTnVtYmVyID0gTWF0aC5jZWlsKG1heFNpemUgLyAyKTtcclxuICAgICAgICAgICAgbWF4U2l6ZSA9IHBhZ2VzU3VtIDwgbWF4U2l6ZSA/IHBhZ2VzU3VtIDogbWF4U2l6ZTtcclxuXHJcbiAgICAgICAgICAgIGlmIChjdXJyZW50UGFnZSA8IG1hZ2ljTnVtYmVyKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gY3JlYXRlQXJyKDEsIG1heFNpemUpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmIChjdXJyZW50UGFnZSA+IHBhZ2VzU3VtIC0gbWFnaWNOdW1iZXIpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiBjcmVhdGVBcnIocGFnZXNTdW0gLSBtYXhTaXplICsgMSwgbWF4U2l6ZSk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGlmIChjdXJyZW50UGFnZSA+PSBtYWdpY051bWJlciAmJiBjdXJyZW50UGFnZSA8PSBwYWdlc1N1bSAtIG1hZ2ljTnVtYmVyKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gY3JlYXRlQXJyKGN1cnJlbnRQYWdlIC0gTWF0aC5mbG9vcihtYXhTaXplIC8gMiksIG1heFNpemUpO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBmdW5jdGlvbiBjcmVhdGVBcnIobWluLCBtYXgpIHtcclxuICAgICAgICAgICAgICAgIGxldCBhcnIgPSBbXTtcclxuXHJcbiAgICAgICAgICAgICAgICBmb3IgKGxldCBpID0gbWluOyBpIDwgbWluICsgbWF4OyBpKyspIHtcclxuICAgICAgICAgICAgICAgICAgICBhcnIucHVzaChpKTtcclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICByZXR1cm4gYXJyO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgLy8gcmVtb3ZlIHBvc3RcclxuICAgICAgICB0aGlzLnJlbW92ZSA9IGZ1bmN0aW9uIChpZCwgaW5kZXgpIHtcclxuICAgICAgICAgICAgcmV0dXJuIGZ1bmN0aW9uICgpIHtcclxuXHJcbiAgICAgICAgICAgICAgICByZXR1cm4gcG9zdHNTZXJ2aWNlLnJlbW92ZShpZCkudGhlbigoZGF0YSk9PiB7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGlmIChkYXRhKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMucG9zdHMuc3BsaWNlKGluZGV4LCAxKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICh0aGlzLnBvc3RzLmxlbmd0aCA9PSAwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLiRyb3V0ZXIubmF2aWdhdGUoWydQb3N0c0xpc3QnLCB7cGFnZTogdGhpcy5jdXJyZW50UGFnZSAtIDF9XSk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIGVycm9yIGhhbmRsaW5nXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdyZW1vdmUgZXJyb3InKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9KVxyXG5cclxuICAgICAgICAgICAgfS5iaW5kKHRoaXMpO1xyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIHRoaXMuZ29Ub1BhZ2UgPSAoaWQpPT4ge1xyXG4gICAgICAgICAgICB0aGlzLiRyb3V0ZXIubmF2aWdhdGUoWydQb3N0c0xpc3QnLCB7cGFnZTogaWR9XSk7XHJcbiAgICAgICAgfTtcclxuXHJcblxyXG4gICAgICAgIHRoaXMuJHJvdXRlck9uQWN0aXZhdGUgPSAobmV4dCk9PiB7XHJcbiAgICAgICAgICAgIHdpbmRvdy5zY3JvbGxUbygwLCAwKTtcclxuXHJcbiAgICAgICAgICAgIHRoaXMuY3VycmVudFBhZ2UgPSBuZXh0LnBhcmFtcy5wYWdlIHx8IDE7XHJcbiAgICAgICAgICAgIHRoaXMucG9zdHMgPSBuZXh0LnJvdXRlRGF0YS5teURhdGEucG9zdHM7XHJcbiAgICAgICAgICAgIHRoaXMucG9zdHNTdW0gPSBNYXRoLmNlaWwobmV4dC5yb3V0ZURhdGEubXlEYXRhLnBvc3RzU3VtIC8gdGhpcy5saW1pdCk7XHJcbiAgICAgICAgICAgIHRoaXMucGFnaW5hdGlvbiA9IHRoaXMubWFrZVBhZ2luYXRpb24odGhpcy5jdXJyZW50UGFnZSwgdGhpcy5wYWdpbmF0aW9uTGltaXQsIHRoaXMucG9zdHNTdW0pO1xyXG5cclxuICAgICAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgICAgfTtcclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiBjYW5BY3RpdmF0ZSgkbmV4dEluc3RydWN0aW9uLCBwb3N0c1NlcnZpY2UsICRyb290Um91dGVyKSB7XHJcbiAgICAgICAgcmV0dXJuIHBvc3RzU2VydmljZS5nZXRMaXN0KCRuZXh0SW5zdHJ1Y3Rpb24ucGFyYW1zLnBhZ2UgLSAxKS50aGVuKFxyXG4gICAgICAgICAgICAocmVzKT0+IHtcclxuICAgICAgICAgICAgICAgICRuZXh0SW5zdHJ1Y3Rpb24ucm91dGVEYXRhLm15RGF0YSA9IHtcclxuICAgICAgICAgICAgICAgICAgICBwb3N0czogcmVzLnBvc3RzLFxyXG4gICAgICAgICAgICAgICAgICAgIHBvc3RzU3VtOiByZXMucG9zdHNTdW1cclxuICAgICAgICAgICAgICAgIH07XHJcblxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIChlcnIpPT4ge1xyXG4gICAgICAgICAgICAgICAgaWYgKGVyci5zdGF0dXMgPT0gNDA0KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgJHJvb3RSb3V0ZXIubmF2aWdhdGVCeVVybCgnNDA0JywgdHJ1ZSk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGlmIChlcnIuc3RhdHVzID09IDQwMSkge1xyXG4gICAgICAgICAgICAgICAgICAgICRyb290Um91dGVyLm5hdmlnYXRlKFsnTG9naW4nXSk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICk7XHJcblxyXG4gICAgfVxyXG59KSgpOyJdfQ==
