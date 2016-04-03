/// <reference path='../typings/mocha/mocha.d.ts' />
/// <reference path='../typings/request/request.d.ts' />
"use strict";
var assert = require('assert');
var requestModule = require('request');
var request = requestModule.defaults({
    jar: true
});
var literki = require('../scripts/shared/literki');
var gamestates = require('./gamestates');
var helper = require('./helper');
describe('Player2 move Suite', function () {
    var initState = helper.loadState(gamestates.player2Move);
    before(function (done) { return helper.beforeTestSuite(done, initState); });
    after(function (done) { return helper.afterTestSuite(done); });
    it('/server/alive Player1', function (done) {
        helper.callGETMethod(gamestates.player1.userName, gamestates.player1.id, '/server/alive', undefined, function (error, response, body) {
            var result = JSON.parse(body);
            assert.equal(result.errorMessage, undefined);
            done();
        });
    });
    it('/game/get Player1', function (done) {
        var data = helper.createRequestData(initState);
        helper.callGETMethod(gamestates.player1.userName, gamestates.player1.id, '/game/get', data, function (error, response, body) {
            var game = helper.processGETbody(body);
            assert.equal(game.isNextPlayer(), true);
            assert.equal(game.getCurrentUser().isAlive(), true);
            assert.deepEqual(game.getCurrentUser().freeLetters, initState.players[0].freeLetters);
            done();
        });
    });
    it('/game/get Player2', function (done) {
        var data = helper.createRequestData(initState);
        helper.callGETMethod(gamestates.player2.userName, gamestates.player2.id, '/game/get', data, function (error, response, body) {
            var game = helper.processGETbody(body);
            assert.equal(game.isCurrentPlayer(), true);
            assert.equal(game.getCurrentUser().isAlive(), true);
            assert.equal(game.state.playState, literki.GamePlayState.PlayerMove);
            assert.deepEqual(game.getCurrentUser().freeLetters, initState.players[1].freeLetters);
            done();
        });
    });
    it('/player/alive Player1', function (done) {
        var data = helper.createAliveRequestData(initState);
        helper.callPOSTMethod(gamestates.player1.userName, gamestates.player1.id, '/player/alive', data, function (error, response, body) {
            var game = helper.processPOSTbody(body);
            assert.equal(game.getCurrentUser().remainingTime == initState.players[0].remainingTime, true);
            assert.equal(body.forceRefresh, false);
            done();
        });
    });
    it('/player/alive Player2', function (done) {
        var data = helper.createAliveRequestData(helper.loadState(gamestates.player2Move));
        helper.callPOSTMethod(gamestates.player2.userName, gamestates.player2.id, '/player/alive', data, function (error, response, body) {
            var game = helper.processPOSTbody(body);
            assert.equal(game.getCurrentUser().remainingTime < initState.players[1].remainingTime, true);
            assert.equal(body.forceRefresh, false);
            done();
        });
    });
    it('/game/move Player2', function (done) {
        var data = {
            "gameId": initState.gameId,
            "freeLetters": [{
                    "letter": "o",
                    "index": 0,
                    "x": 5,
                    "y": 9,
                    "positionType": 0
                }, {
                    "letter": "a",
                    "index": 2,
                    "x": 7,
                    "y": 9,
                    "positionType": 0
                }]
        };
        helper.callPOSTMethod(gamestates.player2.userName, gamestates.player2.id, '/game/move', data, function (error, response, body) {
            var game = helper.processPOSTbody(body);
            assert.equal(game.isCurrentPlayer(), true);
            assert.equal(game.getCurrentUser().freeLetters.length, literki.MAX_LETTERS - data.freeLetters.length);
            assert.equal(game.state.playState, literki.GamePlayState.MoveApproval);
            assert.equal(game.state.currentMove.freeLetters.length, data.freeLetters.length);
            done();
        });
    });
    it('/game/approve Player1', function (done) {
        var data = {
            gameId: initState.gameId,
            approve: true
        };
        helper.callPOSTMethod(gamestates.player1.userName, gamestates.player1.id, '/game/approve', data, function (error, response, body) {
            var game = helper.processPOSTbody(body);
            assert.equal(game.state.playState, literki.GamePlayState.PlayerMove);
            done();
        });
    });
    it('/player/alive Player1 after Player2 move', function (done) {
        var data = helper.createAliveRequestData(initState, 0);
        helper.callPOSTMethod(gamestates.player1.userName, gamestates.player1.id, '/player/alive', data, function (error, response, body) {
            var game = helper.processPOSTbody(body);
            assert.equal(game.isCurrentPlayer(), true);
            assert.equal(game.getCurrentUser().remainingTime < initState.players[0].remainingTime, true);
            assert.equal(game.state.playState, literki.GamePlayState.PlayerMove);
            assert.equal(body.forceRefresh, false);
            done();
        });
    });
    it('/player/alive Player2 after Player2 move', function (done) {
        var data = helper.createAliveRequestData(initState);
        helper.callPOSTMethod(gamestates.player2.userName, gamestates.player2.id, '/player/alive', data, function (error, response, body) {
            var game = helper.processPOSTbody(body);
            assert.equal(game.state.players[1].moves[1].moveType, literki.MoveType.Move);
            assert.equal(game.isNextPlayer(), true);
            assert.equal(game.getCurrentUser().freeLetters.length, literki.MAX_LETTERS);
            assert.equal(body.forceRefresh, true);
            done();
        });
    });
});
describe('Player2 good move check Suite', function () {
    var initState = helper.loadState(gamestates.player2Move);
    before(function (done) { return helper.beforeTestSuite(done, initState); });
    after(function (done) { return helper.afterTestSuite(done); });
    it('/game/move Player2', function (done) {
        var data = {
            "gameId": initState.gameId,
            "freeLetters": [{
                    "letter": "o",
                    "index": 0,
                    "x": 5,
                    "y": 9,
                    "positionType": 0
                }, {
                    "letter": "a",
                    "index": 2,
                    "x": 7,
                    "y": 9,
                    "positionType": 0
                }]
        };
        helper.callPOSTMethod(gamestates.player2.userName, gamestates.player2.id, '/game/move', data, function (error, response, body) {
            var game = helper.processPOSTbody(body);
            assert.equal(game.isCurrentPlayer(), true);
            assert.equal(game.getCurrentUser().freeLetters.length, literki.MAX_LETTERS - data.freeLetters.length);
            assert.equal(game.state.playState, literki.GamePlayState.MoveApproval);
            assert.equal(game.state.currentMove.freeLetters.length, data.freeLetters.length);
            done();
        });
    });
    it('/game/approve Player1 not', function (done) {
        var data = {
            gameId: initState.gameId,
            approve: false
        };
        helper.callPOSTMethod(gamestates.player1.userName, gamestates.player1.id, '/game/approve', data, function (error, response, body) {
            var game = helper.processPOSTbody(body);
            assert.equal(game.state.playState, literki.GamePlayState.PlayerMove);
            done();
        });
    });
    it('/player/alive Player1 after Player2 good move', function (done) {
        var data = helper.createAliveRequestData(initState);
        data.playState = literki.GamePlayState.MoveApproval;
        helper.callPOSTMethod(gamestates.player1.userName, gamestates.player1.id, '/player/alive', data, function (error, response, body) {
            var game = helper.processPOSTbody(body);
            assert.equal(game.state.players[0].moves[2].moveType, literki.MoveType.CheckMoveFailed);
            assert.equal(game.isNextPlayer(), true);
            assert.equal(body.forceRefresh, true);
            done();
        });
    });
    it('/player/alive Player2 after Player2 good move', function (done) {
        var data = helper.createAliveRequestData(initState);
        data.playState = literki.GamePlayState.MoveApproval;
        helper.callPOSTMethod(gamestates.player2.userName, gamestates.player2.id, '/player/alive', data, function (error, response, body) {
            var game = helper.processPOSTbody(body);
            assert.equal(game.state.players[1].moves[1].moveType, literki.MoveType.Move);
            assert.equal(game.isCurrentPlayer(), true);
            assert.equal(game.getCurrentUser().freeLetters.length, literki.MAX_LETTERS);
            assert.equal(body.forceRefresh, true);
            done();
        });
    });
});
describe('Player2 wrong move check Suite', function () {
    var initState = helper.loadState(gamestates.player2Move);
    before(function (done) { return helper.beforeTestSuite(done, initState); });
    after(function (done) { return helper.afterTestSuite(done); });
    it('/game/move Player2', function (done) {
        var data = {
            "gameId": initState.gameId,
            "freeLetters": [{
                    "letter": "o",
                    "index": 0,
                    "x": 5,
                    "y": 9,
                    "positionType": 0
                }, {
                    "letter": "i",
                    "index": 1,
                    "x": 7,
                    "y": 9,
                    "positionType": 0
                }]
        };
        helper.callPOSTMethod(gamestates.player2.userName, gamestates.player2.id, '/game/move', data, function (error, response, body) {
            var game = helper.processPOSTbody(body);
            assert.equal(game.isCurrentPlayer(), true);
            assert.equal(game.getCurrentUser().freeLetters.length, literki.MAX_LETTERS - data.freeLetters.length);
            assert.equal(game.state.playState, literki.GamePlayState.MoveApproval);
            assert.equal(game.state.currentMove.freeLetters.length, data.freeLetters.length);
            done();
        });
    });
    it('/game/approve Player1 not', function (done) {
        var data = {
            gameId: initState.gameId,
            approve: false
        };
        helper.callPOSTMethod(gamestates.player1.userName, gamestates.player1.id, '/game/approve', data, function (error, response, body) {
            var game = helper.processPOSTbody(body);
            assert.equal(game.state.playState, literki.GamePlayState.PlayerMove);
            done();
        });
    });
    it('/player/alive Player1 after Player2 wrong move', function (done) {
        var data = helper.createAliveRequestData(initState);
        data.playState = literki.GamePlayState.MoveApproval;
        helper.callPOSTMethod(gamestates.player1.userName, gamestates.player1.id, '/player/alive', data, function (error, response, body) {
            var game = helper.processPOSTbody(body);
            assert.equal(game.isCurrentPlayer(), true);
            assert.equal(body.forceRefresh, true);
            done();
        });
    });
    it('/player/alive Player2 after Player2 wrong move', function (done) {
        var data = helper.createAliveRequestData(initState);
        data.playState = literki.GamePlayState.MoveApproval;
        helper.callPOSTMethod(gamestates.player2.userName, gamestates.player2.id, '/player/alive', data, function (error, response, body) {
            var game = helper.processPOSTbody(body);
            assert.equal(game.state.players[1].moves[1].moveType, literki.MoveType.WrongMove);
            assert.equal(game.isNextPlayer(), true);
            assert.equal(game.getCurrentUser().freeLetters.length, literki.MAX_LETTERS);
            assert.equal(body.forceRefresh, true);
            done();
        });
    });
});
describe('Player2 not allowed move check Suite', function () {
    var initState = helper.loadState(gamestates.player2Move);
    before(function (done) { return helper.beforeTestSuite(done, initState); });
    after(function (done) { return helper.afterTestSuite(done); });
    it('/game/move Player2', function (done) {
        var data = {
            "gameId": initState.gameId,
            "freeLetters": [{
                    "letter": "o",
                    "index": 0,
                    "x": 5,
                    "y": 9,
                    "positionType": 0
                }, {
                    "letter": "i",
                    "index": 1,
                    "x": 13,
                    "y": 9,
                    "positionType": 0
                }]
        };
        helper.callPOSTMethod(gamestates.player2.userName, gamestates.player2.id, '/game/move', data, function (error, response, body) {
            assert.notEqual(body.errorMessage, undefined);
            done();
        });
    });
    it('/player/alive Player2', function (done) {
        var data = helper.createAliveRequestData(helper.loadState(gamestates.player2Move));
        helper.callPOSTMethod(gamestates.player2.userName, gamestates.player2.id, '/player/alive', data, function (error, response, body) {
            var game = helper.processPOSTbody(body);
            assert.equal(game.getCurrentUser().remainingTime < initState.players[1].remainingTime, true);
            assert.equal(game.getCurrentUser().freeLetters.length, literki.MAX_LETTERS);
            assert.equal(game.state.playState, literki.GamePlayState.PlayerMove);
            assert.equal(body.forceRefresh, false);
            done();
        });
    });
});
describe('Player2 fold Suite', function () {
    var initState = helper.loadState(gamestates.player2Move);
    before(function (done) { return helper.beforeTestSuite(done, initState); });
    after(function (done) { return helper.afterTestSuite(done); });
    it('/game/fold Player2', function (done) {
        var data = helper.createRequestData(initState);
        helper.callGETMethod(gamestates.player2.userName, gamestates.player2.id, '/game/fold', data, function (error, response, body) {
            var game = helper.processGETbody(body);
            assert.equal(game.isNextPlayer(), true);
            assert.equal(game.state.players[1].moves[1].moveType, literki.MoveType.Fold);
            done();
        });
    });
    it('/player/alive Player1 after Player2 folds', function (done) {
        var data = helper.createAliveRequestData(initState);
        helper.callPOSTMethod(gamestates.player1.userName, gamestates.player1.id, '/player/alive', data, function (error, response, body) {
            var game = helper.processPOSTbody(body);
            assert.equal(body.forceRefresh, true);
            assert.equal(game.isCurrentPlayer(), true);
            done();
        });
    });
});
describe('Player2 change letters Suite', function () {
    var initState = helper.loadState(gamestates.player2Move);
    before(function (done) { return helper.beforeTestSuite(done, initState); });
    after(function (done) { return helper.afterTestSuite(done); });
    it('/game/exchange Player2', function (done) {
        var data = {
            gameId: initState.gameId,
            exchangeLetters: [
                initState.players[1].freeLetters[0],
                initState.players[1].freeLetters[1],
                initState.players[1].freeLetters[2]
            ]
        };
        helper.callGETMethod(gamestates.player2.userName, gamestates.player2.id, '/game/exchange', data, function (error, response, body) {
            var game = helper.processGETbody(body);
            assert.equal(game.isNextPlayer(), true);
            assert.equal(game.state.players[1].moves[1].moveType, literki.MoveType.Exchange);
            assert.equal(game.getCurrentUser().freeLetters.length, literki.MAX_LETTERS);
            assert.notDeepEqual(initState.players[1].freeLetters, game.state.players[1].freeLetters);
            done();
        });
    });
    it('/player/alive Player1 after Player2 exchanges letters', function (done) {
        var data = helper.createAliveRequestData(initState);
        helper.callPOSTMethod(gamestates.player1.userName, gamestates.player1.id, '/player/alive', data, function (error, response, body) {
            var game = helper.processPOSTbody(body);
            assert.equal(body.forceRefresh, true);
            assert.equal(game.isCurrentPlayer(), true);
            done();
        });
    });
});
