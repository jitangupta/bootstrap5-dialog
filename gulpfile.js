const { src, dest, watch, series, parallel } = require("gulp");
// Importing all the Gulp-related packages we want to use
const sass = require("gulp-sass")(require("sass"));
const concat = require("gulp-concat");
const terser = require("gulp-terser");
const postcss = require("gulp-postcss");
const autoprefixer = require("autoprefixer");
const cssnano = require("cssnano");
const replace = require("gulp-replace");
const browsersync = require("browser-sync").create();

// File paths
const files = {
  scssPath: "src/scss/**/*.scss",
  jsPath: "src/js/**/*.js",
};

function scssTask() {
  return src(files.scssPath, { sourcemaps: false })
    .pipe(sass())
    .pipe(dest("dist/css", { sourcemaps: "." }));
}

function scssMinTask() {
  return src(files.scssPath, { sourcemaps: false })
    .pipe(sass())
    .pipe(postcss([autoprefixer(), cssnano()]))
    .pipe(concat("bootstrap-dialog.min.css"))
    .pipe(dest("dist/css", { sourcemaps: "." }));
}

function jsTask() {
  return src([files.jsPath]).pipe(dest("dist/js"));
}

function jsMinTask() {
  return src([files.jsPath], { sourcemaps: false })
    .pipe(concat("bootstrap-dialog.min.js"))
    .pipe(terser())
    .pipe(dest("dist/js", { sourcemaps: "." }));
}

// Browsersync to spin up a local server
function browserSyncServe(cb) {
  browsersync.init({
    server: {
      baseDir: ".",
    },
    notify: {
      styles: {
        top: "auto",
        bottom: "0",
      },
    },
  });
  cb();
}
function browserSyncReload(cb) {
  browsersync.reload();
  cb();
}

function watchTask() {
  watch(
    [files.scssPath, files.jsPath],
    { interval: 1000, usePolling: true }, 
    series(scssTask, scssMinTask, jsTask, jsMinTask)
  );
}
function bsWatchTask() {
  watch("index.html", browserSyncReload);
  watch(
    [files.scssPath, files.jsPath],
    { interval: 1000, usePolling: true },
    series(
      parallel(scssTask, scssMinTask, jsTask, jsMinTask),
      browserSyncReload
    )
  );
}

exports.default = series(
  parallel(scssTask, scssMinTask, jsTask, jsMinTask),
  watchTask
);

exports.bs = series(
  parallel(scssTask, scssMinTask, jsTask, jsMinTask),
  browserSyncServe,
  bsWatchTask
);
