var gulp = require('gulp'),
    babel = require('gulp-babel'),
    nodemon = require('gulp-nodemon');

gulp.task('babel', function () {
  return gulp.src('src/**/*.js')
    .pipe(babel())
    .pipe(gulp.dest('build'));
});

gulp.task('nodemon', function () {
  nodemon({
    script: 'build/app.js',
    ext: 'js',
    ignore: ['build/*'],
    tasks: ['babel'],
    env: {
      'NODE_ENV': 'development'
    }
  }).on('restart', function () {
    console.log('Retarted server...')
  });
});

gulp.task('default', ['babel', 'nodemon']);
