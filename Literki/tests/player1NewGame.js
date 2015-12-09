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
describe('Player1 new game Suite', function () {
    //cloning to not mess with test data
    var player = JSON.parse(JSON.stringify(gamestates.player1));
    before(function (done) { return helper.beforeProfileTestSuite(function (err, id) {
        player.id = id;
        done(err);
    }, player); });
    after(function (done) { return helper.afterTestSuite(done); });
    it('/game/new Player1 new game', function (done) {
        var data = {
            playerCount: 2,
            timeLimit: 20
        };
        helper.callPOSTMethod(player.userName, player.id, '/game/new', data, function (error, response, body) {
            var game = helper.processPOSTbody(body, true);
            assert.equal(game.isCurrentPlayer(), true);
            assert.equal(game.getCurrentUser().freeLetters.length, literki.MAX_LETTERS);
            assert.equal(game.getCurrentUser().remainingTime, data.timeLimit * 60);
            assert.equal(game.state.runState, literki.GameRunState.Created);
            assert.equal(game.state.playState, literki.GamePlayState.None);
            assert.equal(game.state.players.length, 2);
            done();
        });
    });
});
//# sourceMappingURL=player1NewGame.js.map