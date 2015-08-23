/// <reference path="../../Literki/typings/async/async.d.ts"/> 
var config = require('config');

import async = require('async');
import fs = require('fs');
import stream = require('stream');
import db = require('../../Literki/scripts/db');
import util = require('../../Literki/scripts/util');

var fileName = process.argv[2];
console.log(`Importowanie pliku ${fileName}`);

var uri = config.MongoDb.uri;
var repo = new db.GameRepository();
repo.open(uri);
repo.removeAllWords((err) => {
    if (!err) {
       
        var liner = util.createLiner();
        var source = fs.createReadStream(fileName);
        source.pipe(liner);
        liner.once('readable', () => {

            var line: string;
            async.whilst(
                () => line = liner.read(),
                (callback) => {
                    console.log(line);
                    repo.addWord(line, callback);
                },
                (err) => {
                    if (err) {
                        console.log(err);
                    }
                    process.exit(err ? 1 : 0);
                }
            );
        });
    }
});
