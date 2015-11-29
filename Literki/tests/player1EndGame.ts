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

import literki = require('../scripts/literki');
import gamestates = require('./gamestates');
import helper = require('./helper');

describe('Player1 endGame Suite', () => {
    var initState = helper.loadState(gamestates.player1EndGame);
    before((done) => helper.beforeTestSuite(done, initState));
    after((done) => helper.afterTestSuite(done));

    it('/player/alive Player1', (done) => {
        var data = helper.createAliveRequestData(initState);
        helper.callPOSTMethod(gamestates.player1.userName, gamestates.player1.id, '/player/alive', data, (error, response, body) => {
            var game = helper.processPOSTbody(body);
            assert.equal(game.isCurrentPlayer(), true);
            assert.equal(game.state.runState, literki.GameRunState.Finished);
            assert.equal(game.state.playState, literki.GamePlayState.None);
            assert.equal((<literki.GamePlayer>game.getCurrentUser()).isAlive(), true);
            assert.deepEqual(game.getCurrentUser().freeLetters, initState.players[0].freeLetters);
            done();
        });
    });

    it('/game/get Player1', (done) => {
        var data = helper.createRequestData(initState);
        helper.callGETMethod(gamestates.player1.userName, gamestates.player1.id, '/game/get', data, (error, response, body) => {
            var game = helper.processGETbody(body, true);
            assert.equal(game.isCurrentPlayer(), true);
            assert.equal(game.state.runState, literki.GameRunState.Finished);
            assert.equal(game.state.playState, literki.GamePlayState.None);
            assert.equal((<literki.GamePlayer>game.getCurrentUser()).isAlive(), true);
            assert.deepEqual(game.getCurrentUser().freeLetters, initState.players[0].freeLetters);
            done();
        });
    });

    it('/player/alive Player2', (done) => {
        var data = helper.createAliveRequestData(initState);
        helper.callPOSTMethod(gamestates.player2.userName, gamestates.player2.id, '/player/alive', data, (error, response, body) => {
            var game = helper.processPOSTbody(body);
            assert.equal(game.isNextPlayer(), true);
            assert.equal(game.state.runState, literki.GameRunState.Finished);
            assert.equal(game.state.playState, literki.GamePlayState.None);
            assert.equal((<literki.GamePlayer>game.getCurrentUser()).isAlive(), true);
            assert.deepEqual(game.getCurrentUser().freeLetters, initState.players[1].freeLetters);
            done();
        });
    });

    it('/game/get Player2', (done) => {
        var data = helper.createRequestData(initState);
        helper.callGETMethod(gamestates.player1.userName, gamestates.player2.id, '/game/get', data, (error, response, body) => {
            var game = helper.processGETbody(body, true);
            assert.equal(game.isNextPlayer(), true);
            assert.equal(game.state.runState, literki.GameRunState.Finished);
            assert.equal(game.state.playState, literki.GamePlayState.None);
            assert.equal((<literki.GamePlayer>game.getCurrentUser()).isAlive(), true);
            assert.deepEqual(game.getCurrentUser().freeLetters, initState.players[1].freeLetters);
            done();
        });
    });

});
