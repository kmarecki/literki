/// <reference path="../../Literki/typings/async/async.d.ts"/> 
process.env['NODE_CONFIG_DIR'] = '../config';

var config = require('config');

import async = require('async');
import fs = require('fs');
import stream = require('stream');
import db = require('../scripts/db');
import util = require('../scripts/util');

var fileName = process.argv[2];
var lang = process.argv[3];
console.log(`Importowanie pliku ${fileName}`);

var uri = config.MongoDb.uri;
var repo = new db.GameRepository();
repo.open(uri);
repo.removeAllWords(lang, (err) => {
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
                    repo.addWord(line, lang, callback);
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
