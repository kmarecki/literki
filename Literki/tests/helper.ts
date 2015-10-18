import fs = require('fs');
import path = require('path');
import server = require('../server');
import literki = require('../scripts/literki');
import gamestates = require('./gamestates');

var repo = server.getGameRepository();

export function beforeTestSuite(done: any, state: literki.IGameState): void {
    server.start();
    state.players.forEach(p => p.lastSeen = new Date());
    repo.saveState(state, err => done(err));
}

export function afterTestSuite(done: any): void {
    server.stop();
    repo.removeAllStates(err => done(err));
}

export function loadState(file: string): literki.IGameState {
    var filePath = path.join('states', file + '.json');
    var stateJSON = fs.readFileSync(filePath, 'utf8');
    var initState = JSON.parse(stateJSON.replace(/^\uFEFF/, ''));
    return literki.GameState.fromJSON(initState);
}