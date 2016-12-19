(function () {
    'use strict';

    angular.module('app.shared').component('confirm', {
        template: `<div ng-class="$ctrl.show ? 'open':''" class="popup">
                        <div class="popup-content">
                            <p class="popup-title">Are you sure?</p>
                            <button ng-click="$ctrl.confirm()" class="btn btn--success">Yes</button>
                            <button ng-click="$ctrl.cancel()" class="btn btn--warning">No</button>
                        </div>
                   </div>`,
        bindings: {
            callback: '='
        },
        controller: Ctrl
    });

    function Ctrl() {
        this.fn = null;
        this.show = false;
        this.open = (fn)=> {
            this.fn = fn;
            this.show = true;
        };

        this.confirm = ()=> {
            if (!this.fn) {
                throw {
                    name: 'confirm component',
                    message: 'fn() not found'
                }
            }

            if (typeof this.fn != 'function') {
                throw {
                    name: 'confirm component',
                    message: 'fn() not function'
                }
            }

            this.fn();
            this.show = false;
        };

        this.cancel = ()=> {
            this.fn = null;
            this.show = false;
        };

        this.callback = this.open;
    }
})();

