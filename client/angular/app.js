'use strict';

angular.module('app', ['app.routes', 'app.components', 'app.services', 'app.auth','app.shared']);

angular.module('app.routes', ['ngComponentRouter']);
angular.module('app.components', ['ngMessages']);
angular.module('app.services', []);
angular.module('app.shared', ['ngSessionStorage']);