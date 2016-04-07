///<reference path="typings/main.d.ts"/>

import gulp = require('gulp');
var bower = require('gulp-bower');
import tsc = require('gulp-typescript');
var typings = require('gulp-typings');

gulp.task('typings', () => {
    gulp.src('./typings.json')
        .pipe(typings());    
});

gulp.task('tsc-server', () => {
    gulp.src('./scripts/**/*.ts')
        .pipe(tsc({
            module: "commonjs",
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

gulp.task('bower', () => {
    bower();
});

gulp.task('default', [
    'typings',
    'tsc-server', 
    'tsc-browser-shared',
    'tsc-browser', 
    'bower'
]);