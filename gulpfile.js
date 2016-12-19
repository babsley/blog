'use strict';

const config = require('./gulp/config');
const paths = require('./gulp/paths');
const gulp = require('gulp');
const $ = require('gulp-load-plugins')(config.gulpLoadPlugins);

console.log($);

// require task
function lazyRequireTask(taskName, options) {
    options = options || {};
    options.taskName = taskName;

    if (!options.path) {
        options.path = config.tasksPath + taskName;
    }

    gulp.task(taskName, function (callback) {
        let task = require(options.path).call(this, options);

        return task(callback);
    });
}

// clean task
lazyRequireTask('clean', {src: paths.dest});

// jade task
lazyRequireTask('jade', {src: paths.jade.src, dest: paths.jade.dest});

// scss task
lazyRequireTask('scss', {src: paths.scss.src, dest: paths.scss.dest});

// fonts task
lazyRequireTask('fonts', {src: paths.fonts.src, dest: paths.fonts.dest});

// images task
lazyRequireTask('images', {src: paths.images.src, dest: paths.images.dest});

// scripts task
lazyRequireTask('scripts', {src: paths.scripts.src, dest: paths.scripts.dest});

// angular task
lazyRequireTask('angular', {src: paths.angular.src, dest: paths.angular.dest});

// bower task
lazyRequireTask('bower', {dest: {js: paths.bowerFiles.js, css: paths.bowerFiles.css}});

// serve task
lazyRequireTask('serve', {server: config.browserSync, dest: paths.dest});

// sprites task
lazyRequireTask('sprites', {src: paths.sprites.src, dest: paths.sprites.dest});


// watch
gulp.task('watch', function () {
    // jade watch
    gulp.watch(paths.jade.src, gulp.series('jade'));

    // scss watch
    gulp.watch(paths.scss.all, gulp.series('scss')).on('unlink', function (filepath) {
        $.remember.forget('scss', $.path.resolve(filepath));
        delete $.cached.caches.scss[$.path.resolve(filepath)];
    });

    gulp.watch(paths.fonts.src, gulp.series('fonts'));

    // scripts watch
    gulp.watch(paths.scripts.all, gulp.series('scripts')).on('unlink', function (filepath) {
        $.remember.forget('scripts', $.path.resolve(filepath));
        delete $.cached.caches.scripts[$.path.resolve(filepath)];
    });

    // images watch
    gulp.watch(paths.images.src, gulp.series('images'));

    // angular watch
    gulp.watch(paths.angular.src, gulp.series('angular')).on('unlink', function (filepath) {
        $.remember.forget('angular', $.path.resolve(filepath));
        delete $.cached.caches.angular[$.path.resolve(filepath)];
    });

    // bower watch
    gulp.watch(paths.bowerFiles.all, gulp.series('bower'));

    // sprites watch
    gulp.watch(paths.sprites.src, gulp.series('sprites'));
});

gulp.task('build', gulp.series('clean', 'bower', gulp.parallel('jade', 'scss', 'sprites', 'images', 'scripts', 'angular', 'fonts')));

gulp.task('dev', gulp.series('clean', 'bower', 'build', gulp.parallel('serve', 'watch')));

gulp.task('develop', gulp.series(gulp.parallel('serve', 'watch')));

gulp.task('default', gulp.series('dev'));
