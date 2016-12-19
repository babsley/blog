'use strict';

var config = require('../config'),
    $ = require('gulp-load-plugins')(config.gulpLoadPlugins),
    gulp = require('gulp');

module.exports = function (options) {
    return function () {
        $.browserSync.init(options.server);
        $.browserSync.watch(options.dest + '/**/*.*').on('change', $.browserSync.reload);
    };
};
