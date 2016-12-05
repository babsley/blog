'use strict';

const config = require('../config');
const $ = require('gulp-load-plugins')(config.gulpLoadPlugins);
const gulp = require('gulp');

module.exports = (options) => {
    return () => {
        return $.combiner.obj(
            gulp.src(options.src),
            $.autoprefixer(config.autoprefixer),
            $.cached(options.taskName),
            $.remember(options.taskName),
            $.sass(config.sass),
            $.mergeMediaQueries(),
            $.cssUrlAdjuster(config.cssUrlAdjuster),
            $.if($.yargs.argv.production, $.cleanCss()),
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