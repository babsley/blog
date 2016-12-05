'use strict';

const config = require('../config');
const $ = require('gulp-load-plugins')(config.gulpLoadPlugins);
const gulp = require('gulp');

module.exports = (options) => {
    return () => {
        return $.combiner.obj(
            gulp.src(options.src),
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
