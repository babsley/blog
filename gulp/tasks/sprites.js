'use strict';

const config = require('../config');
const $ = require('gulp-load-plugins')(config.gulpLoadPlugins);
const gulp = require('gulp');

module.exports = function (options) {
    return () => {
        var spriteData =
            gulp.src(options.src)
                .pipe($.spritesmith({
                    imgPath: config.sprites.imgPath,
                    imgName: config.sprites.img,
                    cssName: config.sprites.styles
                }));

        spriteData.img.pipe(gulp.dest(options.dest.img));
        spriteData.css.pipe(gulp.dest(options.dest.scss));

        return spriteData;
    }
};
