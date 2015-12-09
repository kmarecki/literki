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
describe('Player2 no remaining letter move Suite', function () {
    var initState = helper.loadState(gamestates.player2NoRemainingLettersMove);
    before(function (done) { return helper.beforeTestSuite(done, initState); });
    after(function (done) { return helper.afterTestSuite(done); });
    it('/game/move Player2 no remaining letter move', function (done) {
        var data = {
            "gameId": initState.gameId,
            "freeLetters": [{
                    "letter": "p",
                    "index": 0,
                    "x": 3,
                    "y": 5,
                    "positionType": 0
                }, {
                    "letter": "i",
                    "index": 2,
                    "x": 5,
                    "y": 5,
                    "positionType": 0
                },]
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
//# sourceMappingURL=player2NoRemainingLettersMove.js.map