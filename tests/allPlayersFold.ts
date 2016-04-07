/// <reference path='../typings/main.d.ts' />

import assert = require('assert');
import async = require('async');
import http = require('http');
import requestModule = require('request');
var request = requestModule.defaults({
    jar: true
});

import literki = require('../scripts/shared/literki');
import gamestates = require('./gamestates');
import helper = require('./helper');

describe('All players fold Suite', () => {
    var initState = helper.loadState(gamestates.player1EndGame);
    initState.players.forEach(player => player.remainingTime = 10);
    before((done) => helper.beforeTestSuite(done, initState));
    after((done) => helper.afterTestSuite(done));

    it('/game/fold Player1', (done) => {
        var data = helper.createRequestData(initState);
        helper.callGETMethod(gamestates.player1.userName, gamestates.player1.id, '/game/fold', data, (error, response, body) => {
            var game = helper.processGETbody(body);
            assert.equal(game.isNextPlayer(), true);
            done();
        });
    });

    it('/player/alive Player2 after Player1 folds', (done) => {
        var data = helper.createAliveRequestData(initState);
        helper.callPOSTMethod(gamestates.player2.userName, gamestates.player2.id, '/player/alive', data, (error, response, body) => {
            var game = helper.processPOSTbody(body);
            assert.equal(body.forceRefresh, true);
            assert.equal(game.isCurrentPlayer(), true);
            done();
        });
    });

    it('/game/fold Player2', (done) => {
        var data = helper.createRequestData(initState);
        helper.callGETMethod(gamestates.player2.userName, gamestates.player2.id, '/game/fold', data, (error, response, body) => {
            var game = helper.processGETbody(body);
            assert.equal(game.isNextPlayer(), false);
            done();
        });
    });

    it('/player/alive Player2 after Player2 folds', (done) => {
        var data = helper.createAliveRequestData(initState);
        helper.callPOSTMethod(gamestates.player2.userName, gamestates.player2.id, '/player/alive', data, (error, response, body) => {
            var game = helper.processPOSTbody(body);
            assert.equal(body.forceRefresh, true);
            assert.equal(game.isCurrentPlayer(), true);
            done();
        });
    });

    it('/game/get Player1', (done) => {
        var data = helper.createRequestData(initState);
        helper.callGETMethod(gamestates.player1.userName, gamestates.player1.id, '/game/get', data, (error, response, body) => {
            var game = helper.processGETbody(body);
            assert.equal(game.isCurrentPlayer(), false);
            assert.equal(game.state.runState, literki.GameRunState.Finished);
            assert.equal(game.state.playState, literki.GamePlayState.None);
            assert.equal((<literki.GamePlayer>game.getCurrentUser()).isAlive(), true);
            assert.deepEqual(game.getCurrentUser().freeLetters, initState.players[0].freeLetters);
            done();
        });
    });

    it('/game/get Player2', (done) => {
        var data = helper.createRequestData(initState);
        helper.callGETMethod(gamestates.player1.userName, gamestates.player2.id, '/game/get', data, (error, response, body) => {
            var game = helper.processGETbody(body);
            assert.equal(game.isNextPlayer(), false);
            assert.equal(game.state.runState, literki.GameRunState.Finished);
            assert.equal(game.state.playState, literki.GamePlayState.None);
            assert.equal((<literki.GamePlayer>game.getCurrentUser()).isAlive(), true);
            assert.deepEqual(game.getCurrentUser().freeLetters, initState.players[1].freeLetters);
            done();
        });
    });

});
