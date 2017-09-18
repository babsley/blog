const src = './client';
const dest = './public/';
module.exports = {
    src: src,
    dest: dest,
    jade: {
        src: src + '/angular/**/*.jade',
        dest: dest
    },
    scss: {
        src: src + '/assets/styles/*.scss',
        all: src + '/assets/styles/**/*.{css,scss}',
        dest: dest + '/css'
    },
    angular: {
        src: [src + '/angular/app.js', src + '/angular/app.routes.js', src + '/angular/**/*.js'],
        dest: dest + '/js'
    },
    scripts: {
        src: src + '/assets/scripts/*.js',
        all: src + '/assets/scripts/*.js',
        dest: dest + '/js'
    },
    images: {
        src: [src + '/assets/images/**/*.*', '!' + src + '/assets/images/sprites/**'],
        dest: dest + '/img'
    },
    bowerFiles: {
        all: 'bower_components/**/*.*',
        css: src + '/assets/styles/vendors',
        js: src + '/assets/scripts/vendors'
    },
    fonts: {
        src: src + '/assets/fonts/**/*.*',
        dest: dest + '/fonts'
    },
    sprites: {
        src: src + '/assets/images/sprites/**/*.*',
        dest: {
            img: dest + '/img/design',
            scss: src + '/assets/styles/main'
        }
    }
};