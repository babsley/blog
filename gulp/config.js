module.exports = {
    isDevelopment: true,
    tasksPath: './gulp/tasks/',
    gulpLoadPlugins: {
        pattern: ['*'],
        rename: {
            'gulp-concat-util': 'concat',
            'stream-combiner2': 'combiner',
            'gulp-filter': 'gulpFilter'
        }
    },
    sass: {
        outputStyle: 'nested'
    },
    sprites: {
        img: 'sprites.png',
        styles: 'sprites.css',
        imgPath: '../img/design/sprites.png'
    },
    cssUrlAdjuster: {
        replace: ['../images/', '../img/']
    },
    angularConcat: 'app.js',
    autoprefixer: 'last 3 versions',
    browserSync: {
        proxy: {
            target: 'localhost:3000'
        }
    },
    imagemin: {progressive: true}
};