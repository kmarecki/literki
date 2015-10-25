process.env['NODE_CONFIG_DIR'] = '../config';

var config = require('config');

import db = require('../scripts/db');
import fs = require('fs');
import path = require('path');
import literki = require('../scripts/literki');
import literki_server = require('../scripts/literki_server');
import gamestates = require('../tests/gamestates');

var uri = config.MongoDb.uri;
var repo = new db.GameRepository();
repo.open(uri);

var gameId = parseInt(process.argv[2]);
var caseName = process.argv[3];

repo.loadState(gameId, (err, state) => {
    state.players[0].userId = gamestates.player1.id;
    state.players[1].userId = gamestates.player2.id;
    var stateJSON = JSON.stringify(state, (key, value) => {
        return ['__v', '_id'].indexOf(key) == -1 ? value : undefined;
    }, 4);
    console.log(stateJSON);

    var filePath = path.join("..","tests", "states", caseName + ".json");
    fs.writeFileSync(filePath, stateJSON);
    process.exit(0);
});

