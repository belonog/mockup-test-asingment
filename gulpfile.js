'use strict';
const
  browserSync = require('browser-sync'),
  cssmin = require('gulp-clean-css'),
  debug = require('gulp-debug'),
  eol = require('gulp-line-ending-corrector'),
  gulp = require('gulp'),
  htmlmin = require('gulp-htmlmin'),
  imagemin = require('gulp-imagemin'),
  newer = require('gulp-newer'),
  prefixer = require('gulp-autoprefixer'),
  reload = browserSync.reload,
  sass = require('gulp-sass'),
  sourcemaps = require('gulp-sourcemaps');

var path = {
  build: {
    html: 'build/',
    style: 'build/css/',
    img: 'build/img/',
    fonts: 'build/fonts/',
    maps: '../maps/'
  },
  src: {
    html: ['src/**/*.html'],
    js: ['src/js/*.js', '!src/js/*.min.js'],
    style: 'src/style/*.{scss,sass}',
    img: ['src/img/**/*.{jpg,jpeg,png,gif,svg}'],
    fonts: 'src/fonts/**/*.*',
  },
  watch: {
    html: 'src/**/*.html',
    style: 'src/style/**/*.*',
    img: 'src/img/**/*.{jpg,jpeg,png,gif,svg}',
    fonts: 'src/fonts/**/*.*',
  },
  clean: './build'
};

var config = {
  server: {
    baseDir: './build'
  },
  host: 'localhost',
  https: true,
};

var htmlminConfig = {
  collapseBooleanAttributes: true,
  collapseWhitespace: true,
  conservativeCollapse: true,
  minifyCSS: true,
  minifyJS: true,
  preserveLineBreaks: true,
  processConditionalComments: true,
  removeComments: true,
  removeEmptyAttributes: true,
  removeStyleLinkTypeAttributes: true,
  removeScriptTypeAttributes: true,
  ignoreCustomComments: [/^!|^[/]?noindex/]
};

gulp.task('html:build', function() {
  return gulp.src(path.src.html, {since: gulp.lastRun('html:build')})
    .pipe(newer(path.build.html))
    .pipe(htmlmin(htmlminConfig))
    .pipe(eol({eolc: 'CRLF',}))
    .pipe(gulp.dest(path.build.html))
    .pipe(reload({stream: true}));
});

gulp.task('style:build', function() {
  return gulp.src(path.src.style)
    .pipe(debug({title: 'src'}))
    .pipe(newer({
      dest: path.build.style,
      ext: '.min.css',
      extra: path.src.style.replace('/*.', '/**/*.')
    }))
    .pipe(sourcemaps.init())
    .pipe(sass({includePaths: ['../node_modules']}).on('error', sass.logError))
    .pipe(prefixer())
    .pipe(cssmin())
    .pipe(sourcemaps.write(path.build.maps))
    .pipe(debug({title: 'dest'}))
    .pipe(eol({eolc: 'CRLF'}))
    .pipe(gulp.dest(function(file) {
      if (file.extname !== '.map') {
        file.stem += '.min';
      }
      return path.build.style;
    }))
    .pipe(reload({stream: true}));
});

gulp.task('image:build', function() {
  return gulp.src(path.src.img, {since: gulp.lastRun('image:build')})

    .pipe(newer(path.build.img))
    .pipe(imagemin([
      imagemin.optipng({optimizationLevel: 5}),
      imagemin.jpegtran({progressive: true}),
      imagemin.svgo({plugins: [{removeViewBox: true}, {cleanupIDs: false}]})
    ],
    {verbose: true}))
    .pipe(debug({title: 'imgmin'}))
    .pipe(gulp.dest(path.build.img))
    .pipe(reload({stream: true}));
});

gulp.task('fonts:build', function() {
  return gulp.src(path.src.fonts)
    .pipe(newer(path.build.fonts))
    .pipe(debug())
    .pipe(gulp.dest(path.build.fonts));
});

gulp.task('build', gulp.series([
  'html:build',
  'style:build',
  'fonts:build',
  'image:build',
]));

gulp.task('watch', function(done) {
  gulp.watch([path.watch.html], gulp.series('html:build'));
  gulp.watch([path.watch.style], gulp.series('style:build'));
  gulp.watch([path.watch.img], gulp.series('image:build'));
  gulp.watch([path.watch.fonts], gulp.series('fonts:build'));
  return done();
});

gulp.task('webserver', function webserver(done) {
  browserSync(config);
  return done();
});

gulp.task('default', gulp.series(['build', 'watch', 'webserver']));
