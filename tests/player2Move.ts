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

describe('Player2 move Suite', () => {
    var initState = helper.loadState(gamestates.player2Move);
    before((done) => helper.beforeTestSuite(done, initState));
    after((done) => helper.afterTestSuite(done));

    it('/server/alive Player1', (done) => {
        helper.callGETMethod(gamestates.player1.userName, gamestates.player1.id, '/server/alive', undefined, (error, response, body) => {
            var result = JSON.parse(body);
            assert.equal(result.errorMessage, undefined);
            done();
        });
    });

    it('/game/get Player1', (done) => {
        var data = helper.createRequestData(initState);
        helper.callGETMethod(gamestates.player1.userName, gamestates.player1.id, '/game/get', data, (error, response, body) => {
            var game = helper.processGETbody(body);
            assert.equal(game.isNextPlayer(), true);
            assert.equal((<literki.GamePlayer>game.getCurrentUser()).isAlive(), true);
            assert.deepEqual(game.getCurrentUser().freeLetters, initState.players[0].freeLetters);
            done();
        });
    });

    it('/game/get Player2', (done) => {
        var data = helper.createRequestData(initState);
        helper.callGETMethod(gamestates.player2.userName, gamestates.player2.id, '/game/get', data, (error, response, body) => {
            var game = helper.processGETbody(body);
            assert.equal(game.isCurrentPlayer(), true);
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
            assert.equal(game.getCurrentUser().remainingTime == initState.players[0].remainingTime, true);
            assert.equal(body.forceRefresh, false);
            done();
        });
    });

    it('/player/alive Player2', (done) => {
        var data = helper.createAliveRequestData(helper.loadState(gamestates.player2Move));
        helper.callPOSTMethod(gamestates.player2.userName, gamestates.player2.id, '/player/alive', data, (error, response, body) => {
            var game = helper.processPOSTbody(body);
            assert.equal(game.getCurrentUser().remainingTime < initState.players[1].remainingTime, true);
            assert.equal(body.forceRefresh, false);
            done();
        });
    });

    it('/game/move Player2', (done) => {
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

        helper.callPOSTMethod(gamestates.player2.userName, gamestates.player2.id, '/game/move', data, (error, response, body) => {
            var game = helper.processPOSTbody(body);
            assert.equal(game.isCurrentPlayer(), true);
            assert.equal(game.getCurrentUser().freeLetters.length, literki.MAX_LETTERS - data.freeLetters.length);
            assert.equal(game.state.playState, literki.GamePlayState.MoveApproval);
            assert.equal(game.state.currentMove.freeLetters.length, data.freeLetters.length);
            done();
        });
    });

    it('/game/approve Player1', (done) => {
        var data = {
            gameId: initState.gameId,
            approve: true
        }

        helper.callPOSTMethod(gamestates.player1.userName, gamestates.player1.id, '/game/approve', data, (error, response, body) => {
            var game = helper.processPOSTbody(body);
            assert.equal(game.state.playState, literki.GamePlayState.PlayerMove);
            done();
        });
    });

    it('/player/alive Player1 after Player2 move', (done) => {
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

    it('/player/alive Player2 after Player2 move', (done) => {
        var data = helper.createAliveRequestData(initState);
        helper.callPOSTMethod(gamestates.player2.userName, gamestates.player2.id, '/player/alive', data, (error, response, body) => {
            var game = helper.processPOSTbody(body);
            assert.equal(game.state.players[1].moves[1].moveType, literki.MoveType.Move);
            assert.equal(game.isNextPlayer(), true);
            assert.equal(game.getCurrentUser().freeLetters.length, literki.MAX_LETTERS);
            assert.equal(body.forceRefresh, true);
            done();
        });
    });
});

describe('Player2 good move check Suite', () => {
    var initState = helper.loadState(gamestates.player2Move);
    before((done) => helper.beforeTestSuite(done, initState));
    after((done) => helper.afterTestSuite(done));

    it('/game/move Player2', (done) => {
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

    it('/player/alive Player1 after Player2 good move', (done) => {
        var data = helper.createAliveRequestData(initState);
        data.playState = literki.GamePlayState.MoveApproval;
        helper.callPOSTMethod(gamestates.player1.userName, gamestates.player1.id, '/player/alive', data, (error, response, body) => {
            var game = helper.processPOSTbody(body);
            assert.equal(game.state.players[0].moves[2].moveType, literki.MoveType.CheckMoveFailed);
            assert.equal(game.isNextPlayer(), true);
            assert.equal(body.forceRefresh, true);
            done();
        });
    });

    it('/player/alive Player2 after Player2 good move', (done) => {
        var data = helper.createAliveRequestData(initState);
        data.playState = literki.GamePlayState.MoveApproval;
        helper.callPOSTMethod(gamestates.player2.userName, gamestates.player2.id, '/player/alive', data, (error, response, body) => {
            var game = helper.processPOSTbody(body);
            assert.equal(game.state.players[1].moves[1].moveType, literki.MoveType.Move);
            assert.equal(game.isCurrentPlayer(), true);
            assert.equal(game.getCurrentUser().freeLetters.length, literki.MAX_LETTERS);
            assert.equal(body.forceRefresh, true);
            done();
        });
    });
});

describe('Player2 wrong move check Suite', () => {
    var initState = helper.loadState(gamestates.player2Move);
    before((done) => helper.beforeTestSuite(done, initState));
    after((done) => helper.afterTestSuite(done));

    it('/game/move Player2', (done) => {
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

    it('/player/alive Player1 after Player2 wrong move', (done) => {
        var data = helper.createAliveRequestData(initState);
        data.playState = literki.GamePlayState.MoveApproval;
        helper.callPOSTMethod(gamestates.player1.userName, gamestates.player1.id, '/player/alive', data, (error, response, body) => {
            var game = helper.processPOSTbody(body);
            assert.equal(game.isCurrentPlayer(), true);
            assert.equal(body.forceRefresh, true);
            done();
        });
    });

    it('/player/alive Player2 after Player2 wrong move', (done) => {
        var data = helper.createAliveRequestData(initState);
        data.playState = literki.GamePlayState.MoveApproval;
        helper.callPOSTMethod(gamestates.player2.userName, gamestates.player2.id, '/player/alive', data, (error, response, body) => {
            var game = helper.processPOSTbody(body);
            assert.equal(game.state.players[1].moves[1].moveType, literki.MoveType.WrongMove);
            assert.equal(game.isNextPlayer(), true);
            assert.equal(game.getCurrentUser().freeLetters.length, literki.MAX_LETTERS);
            assert.equal(body.forceRefresh, true);
            done();
        });
    });
});

describe('Player2 not allowed move check Suite', () => {
    var initState = helper.loadState(gamestates.player2Move);
    before((done) => helper.beforeTestSuite(done, initState));
    after((done) => helper.afterTestSuite(done));

    it('/game/move Player2', (done) => {
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

        helper.callPOSTMethod(gamestates.player2.userName, gamestates.player2.id, '/game/move', data, (error, response, body) => {
            assert.notEqual(body.errorMessage, undefined);
            done();
        });
    });

    it('/player/alive Player2', (done) => {
        var data = helper.createAliveRequestData(helper.loadState(gamestates.player2Move));
        helper.callPOSTMethod(gamestates.player2.userName, gamestates.player2.id, '/player/alive', data, (error, response, body) => {
            var game = helper.processPOSTbody(body);
            assert.equal(game.getCurrentUser().remainingTime < initState.players[1].remainingTime, true);
            assert.equal(game.getCurrentUser().freeLetters.length, literki.MAX_LETTERS);
            assert.equal(game.state.playState, literki.GamePlayState.PlayerMove);
            assert.equal(body.forceRefresh, false);
            done();
        });
    });

});

describe('Player2 fold Suite', () => {
    var initState = helper.loadState(gamestates.player2Move);
    before((done) => helper.beforeTestSuite(done, initState));
    after((done) => helper.afterTestSuite(done));

    it('/game/fold Player2', (done) => {
        var data = helper.createRequestData(initState);
        helper.callGETMethod(gamestates.player2.userName, gamestates.player2.id, '/game/fold', data, (error, response, body) => {
            var game = helper.processGETbody(body);
            assert.equal(game.isNextPlayer(), true);
            assert.equal(game.state.players[1].moves[1].moveType, literki.MoveType.Fold);
            done();
        });
    });

    it('/player/alive Player1 after Player2 folds', (done) => {
        var data = helper.createAliveRequestData(initState);
        helper.callPOSTMethod(gamestates.player1.userName, gamestates.player1.id, '/player/alive', data, (error, response, body) => {
            var game = helper.processPOSTbody(body);
            assert.equal(body.forceRefresh, true);
            assert.equal(game.isCurrentPlayer(), true);
            done();
        });
    });

});

describe('Player2 change letters Suite', () => {
    var initState = helper.loadState(gamestates.player2Move);
    before((done) => helper.beforeTestSuite(done, initState));
    after((done) => helper.afterTestSuite(done));

    it('/game/exchange Player2', (done) => {
        var data = {
            gameId: initState.gameId,
            exchangeLetters: [
                initState.players[1].freeLetters[0],
                initState.players[1].freeLetters[1],
                initState.players[1].freeLetters[2]
            ]
        };
        helper.callGETMethod(gamestates.player2.userName, gamestates.player2.id, '/game/exchange', data, (error, response, body) => {
            var game = helper.processGETbody(body);
            assert.equal(game.isNextPlayer(), true);
            assert.equal(game.state.players[1].moves[1].moveType, literki.MoveType.Exchange);
            assert.equal(game.getCurrentUser().freeLetters.length, literki.MAX_LETTERS);
            assert.notDeepEqual(initState.players[1].freeLetters, game.state.players[1].freeLetters);
            done();
        });
    });

    it('/player/alive Player1 after Player2 exchanges letters', (done) => {
        var data = helper.createAliveRequestData(initState);
        helper.callPOSTMethod(gamestates.player1.userName, gamestates.player1.id, '/player/alive', data, (error, response, body) => {
            var game = helper.processPOSTbody(body);
            assert.equal(body.forceRefresh, true);
            assert.equal(game.isCurrentPlayer(), true);
            done();
        });
    });
});