'use strict';

const config = require('../config');
const $ = require('gulp-load-plugins')(config.gulpLoadPlugins);
const gulp = require('gulp');

module.exports = (options) => {
    return () => {
        return $.combiner.obj(
            gulp.src(options.src),
            $.cached(options.taskName),
            $.remember(options.taskName),
            $.if(!$.yargs.argv.production, $.sourcemaps.init()),
            $.babel({
                presets: ['es2015']
            }),
            $.ngAnnotate(),
            $.concat(config.angularConcat),
            $.if($.yargs.argv.production, $.uglify({mangle: false}), $.sourcemaps.write()),
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
