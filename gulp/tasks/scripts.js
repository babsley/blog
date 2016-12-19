'use strict';

const config = require('../config');
const $ = require('gulp-load-plugins')(config.gulpLoadPlugins);
const gulp = require('gulp');

module.exports = function (options) {
    return () => {
        return $.combiner.obj(
            gulp.src(options.src),
            $.cached(options.taskName),
            $.remember(options.taskName),
            $.include(),
            $.if($.yargs.argv.production, $.uglify()),
            gulp.dest(options.dest)
        ).on('error', $.notify.onError(function (err) {
                return {
                    title: options.taskName,
                    message: err.message
                }
            })
        );
    }
};
