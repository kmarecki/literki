/// <reference path='../typings/mocha/mocha.d.ts' />
/// <reference path='../typings/request/request.d.ts' />

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

describe('Player2 no time left Suite', () => {
    var initState = helper.loadState(gamestates.player2NoTimeLeft);
    before((done) => helper.beforeTestSuite(done, initState));
    after((done) => helper.afterTestSuite(done));
    
    it('/player/alive Player2', (done) => {
        var data = helper.createAliveRequestData(initState);
        helper.callPOSTMethod(gamestates.player2.userName, gamestates.player2.id, '/player/alive', data, (error, response, body) => {
            var game = helper.processPOSTbody(body);
            assert.equal(game.getCurrentUser().remainingTime, 0);
            assert.equal(body.forceRefresh, true);
            done();
        });
    });

    it('/game/get Player2', (done) => {
        var data = helper.createRequestData(initState);
        helper.callGETMethod(gamestates.player2.userName, gamestates.player2.id, '/game/get', data, (error, response, body) => {
            var game = helper.processGETbody(body);
            assert.equal(game.isNextPlayer(), true);
            assert.equal((<literki.GamePlayer>game.getCurrentUser()).isAlive(), true);
            assert.equal(game.state.playState, literki.GamePlayState.PlayerMove);
            assert.deepEqual(game.getCurrentUser().freeLetters, initState.players[1].freeLetters);
            done();
        });
    });

    it('/player/alive Player1', (done) => {
        var data = helper.createAliveRequestData(initState);
        helper.callPOSTMethod(gamestates.player1.userName, gamestates.player1.id, '/player/alive', data, (error, response, body) => {
            var game = helper.processPOSTbody(body);
            assert.equal(game.getCurrentUser().remainingTime < initState.players[0].remainingTime, true);
            assert.equal(body.forceRefresh, true);
            done();
        });
    });

    it('/game/get Player1', (done) => {
        var data = helper.createRequestData(initState);
        helper.callGETMethod(gamestates.player1.userName, gamestates.player1.id, '/game/get', data, (error, response, body) => {
            var game = helper.processGETbody(body);
            assert.equal(game.isCurrentPlayer(), true);
            assert.equal((<literki.GamePlayer>game.getCurrentUser()).isAlive(), true);
            assert.deepEqual(game.getCurrentUser().freeLetters, initState.players[0].freeLetters);
            done();
        });
    });

    it('/game/move Player1', (done) => {
        var data = {
            "gameId": initState.gameId,
            "freeLetters": [
                {
                    "letter": "e",
                    "index": 0,
                    "x": 6,
                    "y": 8,
                    "positionType": 0
                },
                {
                    "letter": "r",
                    "index": 6,
                    "x": 6,
                    "y": 9,
                    "positionType": 0
                },
                {
                    "letter": "y",
                    "index": 5,
                    "x": 6,
                    "y": 10,
                    "positionType": 0
                }
            ]
        };

        helper.callPOSTMethod(gamestates.player1.userName, gamestates.player1.id, '/game/move', data, (error, response, body) => {
            var game = helper.processPOSTbody(body);
            assert.equal(game.isCurrentPlayer(), true);
            assert.equal(game.getCurrentUser().freeLetters.length, literki.MAX_LETTERS - data.freeLetters.length);
            assert.equal(game.state.playState, literki.GamePlayState.MoveApproval);
            assert.equal(game.state.currentMove.freeLetters.length, data.freeLetters.length);
            done();
        });
    });

    it('/game/approve Player2', (done) => {
        var data = {
            gameId: initState.gameId,
            approve: true
        }

        helper.callPOSTMethod(gamestates.player2.userName, gamestates.player2.id, '/game/approve', data, (error, response, body) => {
            var game = helper.processPOSTbody(body);
            assert.equal(game.state.playState, literki.GamePlayState.PlayerMove);
            done();
        });
    });

    it('/player/alive Player1 after Player1 move', (done) => {
        var data = helper.createAliveRequestData(initState, 0);
        helper.callPOSTMethod(gamestates.player1.userName, gamestates.player1.id, '/player/alive', data, (error, response, body) => {
            var game = helper.processPOSTbody(body);
            assert.equal(game.isCurrentPlayer(), true);
            assert.equal(game.getCurrentUser().remainingTime < initState.players[0].remainingTime, true);
            assert.equal(game.state.playState, literki.GamePlayState.PlayerMove);
            assert.equal(body.forceRefresh, false);
            done();
        });
    });

    it('/player/alive Player2 after Player1 move', (done) => {
        var data = helper.createAliveRequestData(initState, 0);
        helper.callPOSTMethod(gamestates.player2.userName, gamestates.player2.id, '/player/alive', data, (error, response, body) => {
            var game = helper.processPOSTbody(body);
            assert.equal(game.state.players[1].moves[0].moveType, literki.MoveType.SkipNoTimeLeft);
            assert.equal(game.state.players[1].moves[1].moveType, literki.MoveType.SkipNoTimeLeft);
            assert.equal(game.isNextPlayer(), true);
            assert.equal(game.getCurrentUser().remainingTime, 0);
            assert.equal(game.getCurrentUser().freeLetters.length, literki.MAX_LETTERS);
            assert.equal(game.state.playState, literki.GamePlayState.PlayerMove);
            assert.equal(body.forceRefresh, false);
            done();
        });
    });
});