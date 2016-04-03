///<reference path="typings/gulp/gulp.d.ts"/>
///<reference path="typings/browserify/browserify.d.ts"/>

import gulp = require('gulp');
import childProcess = require('child_process')

const libs = ['jquery', 'konva', 'knockout', 'moment', 'underscore'];
const pages = ['board', 'main', 'newgame', 'profile'];

function exec(command: string, done: any): void {
    console.log('exec ' + command);
    childProcess.exec(command, (err, stdout, stderr) => {
        console.log(stdout);
        console.log(stderr);
        done(err);
    });
}

gulp.task('browserify-libs', (done) => {
  var command = 'browserify';
  libs.forEach(lib => command += (' -r ' + lib));
  command += ' -o ./public/scripts/libs-bundle.js';
  exec(command, done);
});

gulp.task('browserify-pages', (done) => {
  var command = 'browserify --no-bundle-external';
  pages.forEach(lib => command += (' ./public/' + lib + '.js'));
  command += ' -o ./public/scripts/pages-bundle.js';
  exec(command, done);
});

gulp.task('default', ['browserify-libs', 'browserify-pages'])