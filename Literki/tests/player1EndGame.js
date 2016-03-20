/// <reference path='../typings/mocha/mocha.d.ts' />
/// <reference path='../typings/request/request.d.ts' />
"use strict";
var assert = require('assert');
var requestModule = require('request');
var request = requestModule.defaults({
    jar: true
});
var literki = require('../public/scripts/literki');
var gamestates = require('./gamestates');
var helper = require('./helper');
describe('Player1 endGame Suite', function () {
    var initState = helper.loadState(gamestates.player1EndGame);
    before(function (done) { return helper.beforeTestSuite(done, initState); });
    after(function (done) { return helper.afterTestSuite(done); });
    it('/player/alive Player1', function (done) {
        var data = helper.createAliveRequestData(initState);
        helper.callPOSTMethod(gamestates.player1.userName, gamestates.player1.id, '/player/alive', data, function (error, response, body) {
            var game = helper.processPOSTbody(body);
            assert.equal(game.isCurrentPlayer(), true);
            assert.equal(game.state.runState, literki.GameRunState.Finished);
            assert.equal(game.state.playState, literki.GamePlayState.None);
            assert.equal(game.getCurrentUser().isAlive(), true);
            assert.deepEqual(game.getCurrentUser().freeLetters, initState.players[0].freeLetters);
            done();
        });
    });
    it('/game/get Player1', function (done) {
        var data = helper.createRequestData(initState);
        helper.callGETMethod(gamestates.player1.userName, gamestates.player1.id, '/game/get', data, function (error, response, body) {
            var game = helper.processGETbody(body);
            assert.equal(game.isCurrentPlayer(), true);
            assert.equal(game.state.runState, literki.GameRunState.Finished);
            assert.equal(game.state.playState, literki.GamePlayState.None);
            assert.equal(game.getCurrentUser().isAlive(), true);
            assert.deepEqual(game.getCurrentUser().freeLetters, initState.players[0].freeLetters);
            done();
        });
    });
    it('/player/alive Player2', function (done) {
        var data = helper.createAliveRequestData(initState);
        helper.callPOSTMethod(gamestates.player2.userName, gamestates.player2.id, '/player/alive', data, function (error, response, body) {
            var game = helper.processPOSTbody(body);
            assert.equal(game.isNextPlayer(), true);
            assert.equal(game.state.runState, literki.GameRunState.Finished);
            assert.equal(game.state.playState, literki.GamePlayState.None);
            assert.equal(game.getCurrentUser().isAlive(), true);
            assert.deepEqual(game.getCurrentUser().freeLetters, initState.players[1].freeLetters);
            done();
        });
    });
    it('/game/get Player2', function (done) {
        var data = helper.createRequestData(initState);
        helper.callGETMethod(gamestates.player1.userName, gamestates.player2.id, '/game/get', data, function (error, response, body) {
            var game = helper.processGETbody(body);
            assert.equal(game.isNextPlayer(), true);
            assert.equal(game.state.runState, literki.GameRunState.Finished);
            assert.equal(game.state.playState, literki.GamePlayState.None);
            assert.equal(game.getCurrentUser().isAlive(), true);
            assert.deepEqual(game.getCurrentUser().freeLetters, initState.players[1].freeLetters);
            done();
        });
    });
});
//# sourceMappingURL=player1EndGame.js.map