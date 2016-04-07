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

describe('Player1 start game Suite', () => {
    var initState = helper.loadState(gamestates.player1StartGame);
    before((done) => helper.beforeTestSuite(done, initState));
    after((done) => helper.afterTestSuite(done));

    it('/game/move Player1 wrong move', (done) => {
        var data = {
            "gameId": initState.gameId,
            "freeLetters": [{
                "letter": "c",
                "index": 0,
                "x": 7,
                "y": 5,
                "positionType": 0
            }, {
                    "letter": "e",
                    "index": 1,
                    "x": 7,
                    "y": 6,
                    "positionType": 0
                }]
        };

        helper.callPOSTMethod(gamestates.player1.userName, gamestates.player1.id, '/game/move', data, (error, response, body) => {
            var game = helper.processPOSTbody(body, true);
            assert.equal(game.isCurrentPlayer(), true);
            assert.equal(game.getCurrentUser().freeLetters.length, literki.MAX_LETTERS);
            assert.equal(game.state.playState, literki.GamePlayState.PlayerMove);
            done();
        });
    });

    it('/game/move Player1 wrong move 1 letter', (done) => {
        var data = {
            "gameId": initState.gameId,
            "freeLetters": [{
                "letter": "c",
                "index": 0,
                "x": 7,
                "y": 5,
                "positionType": 0
            }]
        };

        helper.callPOSTMethod(gamestates.player1.userName, gamestates.player1.id, '/game/move', data, (error, response, body) => {
            var game = helper.processPOSTbody(body, true);
            assert.equal(game.isCurrentPlayer(), true);
            assert.equal(game.getCurrentUser().freeLetters.length, literki.MAX_LETTERS);
            assert.equal(game.state.playState, literki.GamePlayState.PlayerMove);
            done();
        });
    });

    it('/game/move Player1 move', (done) => {
        var data = {
            "gameId": initState.gameId,
            "freeLetters": [{
                "letter": "c",
                "index": 0,
                "x": 7,
                "y": 5,
                "positionType": 0
            }, {
                    "letter": "e",
                    "index": 1,
                    "x": 7,
                    "y": 6,
                    "positionType": 0
                }, {
                    "letter": "n",
                    "index": 2,
                    "x": 7,
                    "y": 7,
                    "positionType": 0
                }, {
                    "letter": "y",
                    "index": 5,
                    "x": 7,
                    "y": 8,
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

        it('/game/move Player1 move 1 letter', (done) => {
            var data = {
                "gameId": initState.gameId,
                "freeLetters": [{
                    "letter": "i",
                    "index": 0,
                    "x": 7,
                    "y": 7,
                    "positionType": 0
                }]
            };

            helper.callPOSTMethod(gamestates.player1.userName, gamestates.player1.id, '/game/move', data, (error, response, body) => {
                var game = helper.processPOSTbody(body, true);
                assert.equal(game.isCurrentPlayer(), true);
                assert.equal(game.getCurrentUser().freeLetters.length, literki.MAX_LETTERS - data.freeLetters.length);
                assert.equal(game.state.playState, literki.GamePlayState.MoveApproval);
                assert.equal(game.state.currentMove.freeLetters.length, data.freeLetters.length);
                done();
            });
        });
    });
});