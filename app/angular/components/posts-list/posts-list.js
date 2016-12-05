(function () {
    'use strict';

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
        this.paginationLimit = 5;
        this.pagination = [];
        this.limit = 9;
        this.posts = null;
        this.currentPage = null;
        this.postsSum = null;
        this.userRole = sessionService.get('userRole') || 2;
        this.confirm = null;

        // return pagination arr
        this.makePagination = (currentPage, maxSize, pagesSum) => {
            let magicNumber;

            if (!maxSize || !currentPage) {
                throw {
                    message: 'pagination wrong data'
                }
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
                let arr = [];

                for (let i = min; i < min + max; i++) {
                    arr.push(i);
                }

                return arr;
            }
        };

        // remove post
        this.remove = function (id, index) {
            return function () {

                return postsService.remove(id).then((data)=> {

                    if (data) {
                        this.posts.splice(index, 1);

                        if (this.posts.length == 0) {
                            this.$router.navigate(['PostsList', {page: this.currentPage - 1}]);

                        }

                    } else {
                        // error handling
                        console.log('remove error');
                    }
                })

            }.bind(this);
        };

        this.goToPage = (id)=> {
            this.$router.navigate(['PostsList', {page: id}]);
        };


        this.$routerOnActivate = (next)=> {
            window.scrollTo(0, 0);

            this.currentPage = next.params.page || 1;
            this.posts = next.routeData.myData.posts;
            this.postsSum = Math.ceil(next.routeData.myData.postsSum / this.limit);
            this.pagination = this.makePagination(this.currentPage, this.paginationLimit, this.postsSum);

            return true;
        };
    }

    function canActivate($nextInstruction, postsService, $rootRouter) {
        return postsService.getList($nextInstruction.params.page - 1).then(
            (res)=> {
                $nextInstruction.routeData.myData = {
                    posts: res.posts,
                    postsSum: res.postsSum
                };

                return true;
            },
            (err)=> {
                if (err.status == 404) {
                    $rootRouter.navigateByUrl('404', true);

                    return false;
                }
                if (err.status == 401) {
                    $rootRouter.navigate(['Login']);

                    return false;
                }
            }
        );

    }
})();