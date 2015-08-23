/// <reference path='../typings/mocha/mocha.d.ts' />
/// <reference path='../typings/request/request.d.ts' />

process.env['NODE_ENV'] = 'test';
process.env['NODE_CONFIG_DIR'] = '../config';

import assert = require('assert');
import async = require('async');
import http = require('http');
import requestModule = require('request');
var request = requestModule.defaults({
    jar: true
});

import server = require('../server');
import literki = require('../scripts/literki');
import gamestates = require('./gamestates');

var repo = server.getGameRepository();

describe('Player2 move Suite', () => {
    before((done) => {
        server.start();
        var state = gamestates.player2MoveState;
        state.players.forEach(p => p.lastSeen = new Date());
        repo.saveState(state, err => done(err));
    });

    after((done) => {
        server.stop();
        repo.removeAllStates(err => done(err));
    });

    it('/server/alive Player1', (done) => {
        callGETMethod(gamestates.player1.userName, gamestates.player1.id, '/server/alive', (error, response, body) => {
            var result = JSON.parse(body);
            assert.equal(result.errorMessage, undefined);
            done();
        });
    });

    it('/game/get Player1', (done) => {
        callGETMethod(gamestates.player1.userName, gamestates.player1.id, '/game/get', (error, response, body) => {
            var result = JSON.parse(body);
            assert.equal(result.errorMessage, undefined);

            var state = literki.GameState.fromJSON(result.state);
            var game = new literki.GameRun(result.userId);
            game.runState(state);
            assert.equal(game.isNextPlayer(), true);
            assert.equal((<literki.GamePlayer>game.getCurrentUser()).isAlive(), true);
            done();
        });
    });

    it('/game/get Player2', (done) => {
        callGETMethod(gamestates.player2.userName, gamestates.player2.id, '/game/get', (error, response, body) => {
            var result = JSON.parse(body);
            assert.equal(result.errorMessage, undefined);

            var state = literki.GameState.fromJSON(result.state);
            var game = new literki.GameRun(result.userId);
            game.runState(state);
            assert.equal(game.isCurrentPlayer(), true);
            assert.equal((<literki.GamePlayer>game.getCurrentUser()).isAlive(), true);
            done();
        });
    });

    it('/player/alive Player2', (done) => {
        var data = {
            gameId: gamestates.player2MoveState.gameId,
            currentPlayerId: gamestates.player2MoveState.players[1].userId,
            playState: gamestates.player2MoveState.playState,
            playersCount: gamestates.player2MoveState.players.length
        };

        callPOSTMethod(gamestates.player2.userName, gamestates.player2.id, '/player/alive', data, (error, response, body) => {
            //request automatic parses body as JSON
            var result = body;
            assert.equal(result.errorMessage, undefined);

            var state = literki.GameState.fromJSON(result.state);
            var game = new literki.GameRun(result.userId);
            game.runState(state);
            assert.equal(game.isCurrentPlayer(), true);
            assert.equal((<literki.GamePlayer>game.getCurrentUser()).isAlive(), true);
            assert.equal(game.getCurrentUser().remainingTime < gamestates.player2MoveState.players[1].remainingTime, true);
            assert.equal(result.forceRefresh, false);
            done();
        });
    });

});

function callGETMethod(userName: string, id: string, path: string, call: (error, response: http.IncomingMessage, body) => void) {
    var authPath = `http://${userName}:${id}@localhost:1337/auth/http`;
    request.get(authPath, (error, response, body) => {
        assert.equal(body, 'Authentifaction successfull');
        var methodPath = `http://localhost:1337${path}`;
        request.get(methodPath, (error, response, body) => call(error, response, body));
    });
}

function callPOSTMethod(userName: string, id: string, path: string, data: any, call: (error, response: http.IncomingMessage, body) => void) {
    var authPath = `http://${userName}:${id}@localhost:1337/auth/http`;
    request.get(authPath, (error, response, body) => {
        assert.equal(body, 'Authentifaction successfull');
        var methodPath = `http://localhost:1337${path}`;
        request.post(methodPath, { json: data }, (error, response, body) => call(error, response, body));
    });
}

