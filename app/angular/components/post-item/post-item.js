(function () {
    'use strict';

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
            }

            else {
                this.prewFile = null;
            }
        }.bind(this);

        this.goToBack = ()=> {
            this.$router.navigate(['PostsList', {page: this.currentPage}]);
        };

        this.postCreate = ()=> {
            let data = {
                heading: this.post.heading,
                text: this.post.text,
                file: this.file
            };

            postsService.create(data).then((data)=> {
                    this.$router.navigate(['PostsList', {page: 1}]);
                }, (err)=> {
                    console.log(err);
                }
            )
        };

        this.postUpdate = ()=> {
            let data = {
                heading: this.post.heading,
                text: this.post.text,
                file: this.file
            };

            postsService.put(this.id, data).then((data)=> {
                this.$router.navigate(['PostsList', {page: this.currentPage}]);
            })
        };

        this.$routerOnActivate = (next, prev) => {
            window.scrollTo(0, 0);

            if (next.params.page) {
                this.currentPage = next.params.page;
            } else {
                this.currentPage = prev ? prev.params.page : 1;
            }

            this.post = next.routeData.postItem;
            this.id = next.params.id;
            this.behavior = next.routeData.data.behavior ? next.routeData.data.behavior : null;
        };

    }

    function canActivate($rootRouter, $nextInstruction, sessionService, postsService) {
        let userRole = sessionService.get('userRole'),
            behavior = $nextInstruction.routeData.data.behavior,
            id = $nextInstruction.params.id;

        if (behavior && userRole > 1) {
            $rootRouter.navigateByUrl('404', true);
            return false;
        }

        if (behavior == 'create') {
            return true;
        }

        return postsService.get(id)
            .then(
                (res)=> {
                    $nextInstruction.routeData.postItem = res;
                },
                (err)=> {
                    if (err.status == 401) {
                        $rootRouter.navigate(['Login']);
                        return false;
                    }
                    if (err.status == 404) {
                        $rootRouter.navigateByUrl('404', true);
                        return false;
                    }
                }
            );
    }
})();