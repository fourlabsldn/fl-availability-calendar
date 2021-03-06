/* eslint-env node */

const gulp = require('gulp');
const sourcemaps = require('gulp-sourcemaps');
const babel = require('rollup-plugin-babel');
const nodeResolve = require('rollup-plugin-node-resolve');
const commonjs = require('rollup-plugin-commonjs');
const rollup = require('gulp-rollup');
const sass = require('gulp-sass');
const DepLinker = require('dep-linker');
const rename = require('gulp-rename');
const autoprefixer = require('autoprefixer');
const postcss = require('gulp-postcss');
const demoServer = require('./examples/default/demoServer/main.js');
const browserSync = require('browser-sync').create();

const moduleName = 'fl-availability-calendar';
const paths = {
  js: {
    src: './src/**/*',
    main: './src/js/main.js',
    dest: './dist/',
  },
  sass: {
    src: './src/sass/**/*',
    main: './src/sass/main.scss',
    dest: './dist/',
  },
  demo: {
    main: './examples/default/index.html',
    src: './examples/default',
    dep: './examples/default/dependencies',
  },
};

gulp.task('copy-dependencies', () => {
  return DepLinker.copyDependenciesTo(paths.demo.dep);
});

gulp.task('build:src', () => {
  gulp.src(paths.js.main)
  .pipe(sourcemaps.init())
  .pipe(rollup({
    // Function names leak to the global namespace. To avoid that,
    // let's just put everything within an immediate function, this way variables
    // are all beautifully namespaced.
    banner: '(function () {',
    footer: '}());',
    plugins: [
      nodeResolve({ jsnext: false, main: true }),
      commonjs(),
      babel({
        exclude: 'node_modules/**',
        babelrc: false,
        plugins: ['transform-async-to-generator', 'external-helpers-2'],
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
  return gulp.src(paths.sass.main)
  .pipe(sourcemaps.init())
  .pipe(sass().on('error', sass.logError))
  .pipe(postcss([autoprefixer({ browsers: ['last 15 versions'] })]))
  .pipe(rename({ basename: moduleName }))
  .pipe(sourcemaps.write('.'))
  .pipe(gulp.dest(paths.sass.dest))
  .pipe(browserSync.stream());
});

gulp.task('watch:build:sass', () => {
  gulp.watch(paths.sass.src, ['build:sass']);
});

gulp.task('demo', () => {

  demoServer();

  browserSync.init({
    startPath: '/index.html',
    server: {
      baseDir: './examples/default'
    },
  });
});



gulp.task('build', [
  'build:src',
  'build:sass',
]);

gulp.task('watch', [
  'watch:build:sass',
  'watch:build:src',
]);

gulp.task('demo', ['copy-dependencies', 'build', 'watch'], () => {
  browserSync.init({
    startPath: paths.demo.main,
    server: {
      baseDir: './',
      directory: true,
    },
  });

  demoServer();
  gulp.watch(paths.demo.src).on('change', browserSync.reload);
  gulp.watch(paths.js.dist).on('change', browserSync.reload);
});
