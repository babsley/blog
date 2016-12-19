'use strict';

const config = require('../config');
const $ = require('gulp-load-plugins')(config.gulpLoadPlugins);
const gulp = require('gulp');


module.exports = function (options) {
    return () => {
        return $.del(options.src);
    }
};
