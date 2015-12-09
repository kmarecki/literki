/// <reference path='../typings/mocha/mocha.d.ts' />
/// <reference path='../typings/request/request.d.ts' />
var assert = require('assert');
var requestModule = require('request');
var request = requestModule.defaults({
    jar: true
});
var literki = require('../scripts/literki');
var gamestates = require('./gamestates');
var helper = require('./helper');
describe('Player2 left edge move Suite', function () {
    var initState = helper.loadState(gamestates.player2LeftEdgeMove);
    before(function (done) { return helper.beforeTestSuite(done, initState); });
    after(function (done) { return helper.afterTestSuite(done); });
    it('/game/move Player2 edge move', function (done) {
        var data = {
            "gameId": initState.gameId,
            "freeLetters": [{
                    "letter": "k",
                    "index": 2,
                    "x": 0,
                    "y": 12,
                    "positionType": 0
                }, {
                    "letter": "o",
                    "index": 4,
                    "x": 1,
                    "y": 12,
                    "positionType": 0
                }, {
                    "letter": "t",
                    "index": 5,
                    "x": 2,
                    "y": 12,
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
    it('/player/alive Player2 after Player1 wrong check', function (done) {
        var data = helper.createAliveRequestData(initState);
        data.playState = literki.GamePlayState.MoveApproval;
        helper.callPOSTMethod(gamestates.player2.userName, gamestates.player2.id, '/player/alive', data, function (error, response, body) {
            var game = helper.processPOSTbody(body);
            assert.equal(game.isCurrentPlayer(), true);
            assert.equal(body.forceRefresh, true);
            done();
        });
    });
});
describe('Player2 edge move Suite', function () {
    var initState = helper.loadState(gamestates.player2EdgeMove);
    before(function (done) { return helper.beforeTestSuite(done, initState); });
    after(function (done) { return helper.afterTestSuite(done); });
    it('/game/move Player2 left edge move', function (done) {
        var data = {
            "gameId": initState.gameId,
            "freeLetters": [{
                    "letter": "o",
                    "index": 0,
                    "x": 12,
                    "y": 6,
                    "positionType": 0
                }, {
                    "letter": "z",
                    "index": 2,
                    "x": 13,
                    "y": 6,
                    "positionType": 0
                }, {
                    "letter": "i",
                    "index": 3,
                    "x": 14,
                    "y": 6,
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
    it('/player/alive Player2 after Player1 wrong check', function (done) {
        var data = helper.createAliveRequestData(initState);
        data.playState = literki.GamePlayState.MoveApproval;
        helper.callPOSTMethod(gamestates.player2.userName, gamestates.player2.id, '/player/alive', data, function (error, response, body) {
            var game = helper.processPOSTbody(body);
            assert.equal(game.isCurrentPlayer(), true);
            assert.equal(body.forceRefresh, true);
            done();
        });
    });
});
//# sourceMappingURL=player2EdgeMove.js.map