/// <reference path='../typings/mocha/mocha.d.ts' />
/// <reference path='../typings/request/request.d.ts' />

import assert = require('assert');
import async = require('async');
import http = require('http');
import requestModule = require('request');
var request = requestModule.defaults({
    jar: true
});

import literki = require('../public/scripts/literki');
import gamestates = require('./gamestates');
import helper = require('./helper');

describe('Player2 no remaining letter move Suite', () => {
    var initState = helper.loadState(gamestates.player2NoRemainingLettersMove);
    before((done) => helper.beforeTestSuite(done, initState));
    after((done) => helper.afterTestSuite(done));

    it('/game/move Player2 no remaining letter move', (done) => {
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
                }, ]
        };

        helper.callPOSTMethod(gamestates.player2.userName, gamestates.player2.id, '/game/move', data, (error, response, body) => {
            var game = helper.processPOSTbody(body);
            assert.equal(game.isCurrentPlayer(), true);
            assert.equal(game.getCurrentUser().freeLetters.length, literki.MAX_LETTERS - data.freeLetters.length);
            assert.equal(game.state.playState, literki.GamePlayState.MoveApproval);
            assert.equal(game.state.currentMove.freeLetters.length, data.freeLetters.length);
            done();
        });
    });

    it('/game/approve Player1 not', (done) => {
        var data = {
            gameId: initState.gameId,
            approve: false
        }

        helper.callPOSTMethod(gamestates.player1.userName, gamestates.player1.id, '/game/approve', data, (error, response, body) => {
            var game = helper.processPOSTbody(body);
            assert.equal(game.state.playState, literki.GamePlayState.PlayerMove);
            done();
        });
    });

    it('/player/alive Player2 after Player1 wrong check', (done) => {
        var data = helper.createAliveRequestData(initState);
        data.playState = literki.GamePlayState.MoveApproval;
        helper.callPOSTMethod(gamestates.player2.userName, gamestates.player2.id, '/player/alive', data, (error, response, body) => {
            var game = helper.processPOSTbody(body);
            assert.equal(game.isCurrentPlayer(), true);
            assert.equal(body.forceRefresh, true);
            done();
        });
    });
});