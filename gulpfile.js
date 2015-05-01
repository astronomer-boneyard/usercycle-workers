var gulp = require('gulp'),
    babel = require('gulp-babel'),
    nodemon = require('gulp-nodemon'),
    del = require('del'),
    runSequence = require('run-sequence');

var copy = [
  'lua/**'
];

var settings = {
  dist: 'dist'
};

gulp.task('clean', function() {
  return del.sync(settings.dist + '/*');
});

gulp.task('copy', function() {
  return gulp.src(copy, {base: '.'})
    .pipe(gulp.dest(settings.dist));
});

gulp.task('babel', function () {
  return gulp.src('src/**/*.js')
    .pipe(babel())
    .pipe(gulp.dest(settings.dist));
});

gulp.task('build', function(cb) {
  runSequence('clean', ['copy', 'babel'], cb);
})

gulp.task('watch', ['build'], function() {
  nodemon({
    script: settings.dist + '/app.js',
    ext: 'js',
    ignore: [settings.dist + '/*'],
    tasks: ['build'],
    env: {
      'NODE_ENV': 'development'
    }
  }).on('restart', function () {
    console.log('Retarted server...');
  });
});
