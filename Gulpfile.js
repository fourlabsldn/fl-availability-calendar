/* eslint-env node */

const gulp = require('gulp');
const sourcemaps = require('gulp-sourcemaps');
const babel = require('rollup-plugin-babel');
const rollup = require('gulp-rollup');
const sass = require('gulp-sass');
const DepLinker = require('dep-linker');
const rename = require('gulp-rename');

const moduleName = 'fl-multi-subject-calendar';
const paths = {
  js: {
    src: './src/main.js',
    dest: './dist/',
  },
  sass: {
    src: './src/sass/main.scss',
    dest: `./dist/`,
  },
  demo: {
    src: './demo',
    dep: './demo/dependencies',
  },
};

gulp.task('copy-dependencies', () => {
  return DepLinker.copyDependenciesTo(paths.demo.dep);
});

gulp.task('build:src', () => {
  gulp.src(paths.js.src)
  .pipe(sourcemaps.init())
  .pipe(rollup({
    plugins: [
      babel({
        exclude: 'node_modules/**',
        presets: ['es2015-rollup'],
      }),
    ],
  }))
  .pipe(rename({ basename: moduleName }))
  .pipe(sourcemaps.write('.'))
  .pipe(gulp.dest(paths.js.dest));
});

gulp.task('watch:build:src', () => {
  gulp.watch(paths.js.src, ['build:src']);
});


gulp.task('build:sass', () => {
  return gulp.src(paths.sass.src)
  .pipe(sourcemaps.init())
  .pipe(sass().on('error', sass.logError))
  .pipe(rename({ basename: moduleName }))
  .pipe(sourcemaps.write('.'))
  .pipe(gulp.dest(paths.sass.dest));
});

gulp.task('watch:build:sass', () => {
  gulp.watch(paths.sass.dest, ['build:sass']);
});

gulp.task('build', [
  'build:src',
  'build:sass',
]);

gulp.task('watch', [
  'watch:build:sass',
  'watch:build:src',
]);

gulp.task('build-watch', ['build', 'watch']);
gulp.task('demo', ['copy-dependencies', 'build-watch']);
