///<reference path="typings/tsd.d.ts"/>

import gulp = require('gulp');
import tsc = require('gulp-typescript');

gulp.task('tsc-server', () => {
    gulp.src('./scripts/**/*.ts')
        .pipe(tsc({
            module: "commonjs"
        }))
        .pipe(gulp.dest('./scripts/'));
});

gulp.task('tsc-browser-shared', () => {
    gulp.src('./scripts/shared/**/*.ts')
        .pipe(tsc({
            module: "amd"
        }))
        .pipe(gulp.dest('./public/scripts/shared/'));
});

gulp.task('tsc-browser', () => {
    gulp.src('./public/scripts/**/*.ts')
        .pipe(tsc({
            module: "amd"
        }))
        .pipe(gulp.dest('./public/scripts/'));
});

gulp.task('default', ['tsc-server', 'tsc-browser-shared','tsc-browser']);