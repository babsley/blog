(function () {
    'use strict';

    angular.module('app.shared').directive('backImg', ()=> {
        return {
            restrict: 'A',
            link: function ($scope, element, $attrs) {
                $attrs.$observe('backImg', function(url){
                    element.css({
                        'background-image': 'url(' + url + ')'
                    });
                });
            }
        }
    })
})();