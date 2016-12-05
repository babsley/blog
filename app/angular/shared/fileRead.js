(function () {
    'use strict';

    angular.module('app.shared').component('fileRead', {
        template: `<p>
                        <span>File : </span> 
                        <a class="file-read_remove" ng-if="$ctrl.fileName" ng-click="$ctrl.remove()" ng-href="#"><i class="icon fa fa-times"></i> </a> 
                        {{$ctrl.fileName}}
                   </p>
                   <input type="file">
                   <div class="ng-transclude"></div>`,
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
        let elem = angular.element($element[0].querySelector('[type="file"]'));

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

        elem.on('change', (event)=> {
            this.ngModel.$setDirty();
            this.ngModel.$setTouched();

            let isValidMimeType = null;
            let file = event.target.files[0];

            if (file) {
                isValidMimeType = this.mimeTypes.some(function (type) {
                    return type === file.type;
                });

                if (!isValidMimeType) {
                    file = null;
                    this.ngModel.$setValidity('mimeTypes', false);
                } else {
                    this.ngModel.$setValidity('mimeTypes', true);
                }

            } else {
                this.ngModel.$setValidity('mimeTypes', true);
            }

            this.fileName = file ? file.name : null;

            this.ngModel.$setViewValue(file);

            this.fileReadCb();
        });
    }
})();
