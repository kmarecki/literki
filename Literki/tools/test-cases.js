var config = require('config');
var db = require('../scripts/db');
var fs = require('fs');
var path = require('path');
var gamestates = require('../tests/gamestates');
var uri = config.MongoDb.uri;
var repo = new db.GameRepository();
repo.open(uri);
var gameId = parseInt(process.argv[2]);
var caseName = process.argv[3];
repo.loadState(gameId, function (err, state) {
    state.players[0].userId = gamestates.player1.id;
    state.players[1].userId = gamestates.player2.id;
    var stateJSON = JSON.stringify(state, function (key, value) {
        return ['__v', '_id'].indexOf(key) == -1 ? value : undefined;
    }, 4);
    console.log(stateJSON);
    var filePath = path.join("..", "tests", "states", caseName + ".json");
    fs.writeFileSync(filePath, stateJSON);
    process.exit(0);
});
//# sourceMappingURL=test-cases.js.map