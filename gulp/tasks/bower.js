'use strict';

const config = require('../config');
const $ = require('gulp-load-plugins')(config.gulpLoadPlugins);
const gulp = require('gulp');

module.exports = function (options) {
    return () => {
        return $.combiner.obj(
            gulp.src($.mainBowerFiles()),
            $.if('*.js', $.combiner.obj(
                $.flatten(),
                gulp.dest(options.dest.js))
            ),
            $.if('*.css', $.combiner.obj(
                $.flatten(),
                gulp.dest(options.dest.css))
            )
        )
    }
};