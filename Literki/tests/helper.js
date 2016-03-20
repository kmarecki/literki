"use strict";
process.env['NODE_ENV'] = 'test';
process.env['NODE_CONFIG_DIR'] = '../config';
var assert = require('assert');
var fs = require('fs');
var path = require('path');
var server = require('../server');
var literki = require('../public/scripts/literki');
var requestModule = require('request');
var request = requestModule.defaults({
    jar: true
});
var repo = server.getGameRepository();
function serverStart() {
    server.start();
}
exports.serverStart = serverStart;
function serverStop() {
    server.stop();
}
exports.serverStop = serverStop;
function beforeTestSuite(done, state) {
    serverStart();
    state.players.forEach(function (p) { return p.lastSeen = new Date(); });
    repo.saveState(state, function (err) { return done(err); });
}
exports.beforeTestSuite = beforeTestSuite;
function afterTestSuite(done) {
    serverStop();
    repo.removeAllStates(function (err) {
        repo.removeAllUsers(function (err) {
            done(err);
        });
    });
}
exports.afterTestSuite = afterTestSuite;
function beforeProfileTestSuite(done, profile) {
    serverStart();
    repo.loadOrCreateUser(profile.authId, profile.userName, function (err, result) { return done(err, result.id); });
}
exports.beforeProfileTestSuite = beforeProfileTestSuite;
function loadState(file) {
    var filePath = path.join('states', file + '.json');
    var stateJSON = fs.readFileSync(filePath, 'utf8');
    var initState = JSON.parse(stateJSON.replace(/^\uFEFF/, ''));
    return literki.GameState.fromJSON(initState);
}
exports.loadState = loadState;
function createRequestData(state) {
    var data = {
        gameId: state.gameId
    };
    return data;
}
exports.createRequestData = createRequestData;
function createAliveRequestData(state, currentPlayerIndex) {
    if (currentPlayerIndex === void 0) { currentPlayerIndex = state.currentPlayerIndex; }
    var data = {
        gameId: state.gameId,
        currentPlayerId: state.players[currentPlayerIndex].userId,
        playState: state.playState,
        playersCount: state.players.length,
    };
    return data;
}
exports.createAliveRequestData = createAliveRequestData;
function callGETMethod(userName, id, path, data, call) {
    var authPath = "http://" + userName + ":" + id + "@localhost:1337/auth/http";
    request.get(authPath, function (error, response, body) {
        assert.equal(body, 'Authentifaction successfull');
        var methodPath = "http://localhost:1337" + path;
        request.get(methodPath, { qs: data }, function (error, response, body) { return call(error, response, body); });
    });
}
exports.callGETMethod = callGETMethod;
function callPOSTMethod(userName, id, path, data, call) {
    var authPath = "http://" + userName + ":" + id + "@localhost:1337/auth/http";
    request.get(authPath, function (error, response, body) {
        assert.equal(body, 'Authentifaction successfull');
        var methodPath = "http://localhost:1337" + path;
        request.post(methodPath, { json: data }, function (error, response, body) { return call(error, response, body); });
    });
}
exports.callPOSTMethod = callPOSTMethod;
function processGETbody(body, skipErrorChecking) {
    if (skipErrorChecking === void 0) { skipErrorChecking = false; }
    var result = JSON.parse(body);
    if (!skipErrorChecking) {
        assert.equal(result.errorMessage, undefined);
    }
    else {
        assert.notEqual(result.errorMessage, undefined);
    }
    var state = literki.GameState.fromJSON(result.state);
    var game = new literki.GameRun(result.userId);
    game.runState(state);
    return game;
}
exports.processGETbody = processGETbody;
function processPOSTbody(body, skipErrorChecking) {
    if (skipErrorChecking === void 0) { skipErrorChecking = false; }
    //request automatic parses body as JSON
    var result = body;
    if (!skipErrorChecking) {
        assert.equal(result.errorMessage, undefined);
    }
    else {
        assert.notEqual(result.errorMessage, undefined);
    }
    var state = literki.GameState.fromJSON(result.state);
    var game = new literki.GameRun(result.userId);
    game.runState(state);
    return game;
}
exports.processPOSTbody = processPOSTbody;
//# sourceMappingURL=helper.js.map