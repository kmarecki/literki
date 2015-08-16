/// <reference path="../../Literki/typings/async/async.d.ts"/> 
var async = require('async');
var fs = require('fs');
var db = require('../../literki/scripts/db');
var util = require('../../literki/scripts/util');
var fileName = process.argv[2];
console.log("Importowanie pliku " + fileName);
var repo = new db.GameRepository();
repo.open();
repo.removeAllWords(function (err) {
    if (!err) {
        var liner = util.createLiner();
        var source = fs.createReadStream(fileName);
        source.pipe(liner);
        liner.once("readable", function () {
            var line;
            async.whilst(function () { return line = liner.read(); }, function (callback) {
                console.log(line);
                repo.addWord(line, callback);
            }, function (err) {
                if (err) {
                    console.log(err);
                }
                process.exit(err ? 1 : 0);
            });
        });
    }
});
//# sourceMappingURL=app.js.map