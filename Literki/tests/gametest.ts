/// <reference path='../typings/mocha/mocha.d.ts' />
/// <reference path='../typings/request/request.d.ts' />

process.env['NODE_ENV'] = 'test';
process.env['NODE_CONFIG_DIR'] = '../config';

import assert = require('assert');
import async = require('async');
import http = require('http');
import requestModule = require('request');
var request = requestModule.defaults({
    jar: true
});

import server = require('../server');
import literki = require('../scripts/literki');
import gamestates = require('./gamestates');

var repo = server.getGameRepository();

describe('Player2 move Suite', () => {
    var initState = gamestates.player2MoveState;
    before((done) => beforeTestSuite(done, initState));
    after((done) => afterTestSuite(done));

    it('/server/alive Player1', (done) => {
        callGETMethod(gamestates.player1.userName, gamestates.player1.id, '/server/alive', undefined, (error, response, body) => {
            var result = JSON.parse(body);
            assert.equal(result.errorMessage, undefined);
            done();
        });
    });

    it('/game/get Player1', (done) => {
        var data = createRequestData(initState);
        callGETMethod(gamestates.player1.userName, gamestates.player1.id, '/game/get', data, (error, response, body) => {
            var game = processGETbody(body);
            assert.equal(game.isNextPlayer(), true);
            assert.equal((<literki.GamePlayer>game.getCurrentUser()).isAlive(), true);
            done();
        });
    });

    it('/game/get Player2', (done) => {
        var data = createRequestData(initState);
        callGETMethod(gamestates.player2.userName, gamestates.player2.id, '/game/get', data, (error, response, body) => {
            var game = processGETbody(body);
            assert.equal(game.isCurrentPlayer(), true);
            assert.equal((<literki.GamePlayer>game.getCurrentUser()).isAlive(), true);
            assert.equal(game.state.playState, literki.GamePlayState.PlayerMove);
            done();
        });
    });

    it('/player/alive Player1', (done) => {
        var data = createAliveRequestData(initState);
        callPOSTMethod(gamestates.player1.userName, gamestates.player1.id, '/player/alive', data, (error, response, body) => {
            var game = processPOSTbody(body);
            assert.equal(body.forceRefresh, false);
            assert.equal(game.getCurrentUser().remainingTime == initState.players[0].remainingTime, true);
            done();
        });
    });

    it('/player/alive Player2', (done) => {
        var data = createAliveRequestData(gamestates.player2MoveState);
        callPOSTMethod(gamestates.player2.userName, gamestates.player2.id, '/player/alive', data, (error, response, body) => {
            var game = processPOSTbody(body);
            assert.equal(body.forceRefresh, false);
            assert.equal(game.getCurrentUser().remainingTime < initState.players[1].remainingTime, true);
            done();
        });
    });

    it('/game/move Player2', (done) => {
        var data = {
            "gameId": initState.gameId,
            "freeLetters" : [{
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

        callPOSTMethod(gamestates.player2.userName, gamestates.player2.id, '/game/move', data, (error, response, body) => {
            var game = processPOSTbody(body);
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

        callPOSTMethod(gamestates.player1.userName, gamestates.player1.id, '/game/approve', data, (error, response, body) => {    
            var game = processPOSTbody(body);
            assert.equal(game.state.playState, literki.GamePlayState.PlayerMove);
            done();
        });
    });

    it('/player/alive Player1 after Player2 move', (done) => {
        var data = createAliveRequestData(initState, 0);
        callPOSTMethod(gamestates.player1.userName, gamestates.player1.id, '/player/alive', data, (error, response, body) => {
            var game = processPOSTbody(body);
            assert.equal(body.forceRefresh, false);
            assert.equal(game.isCurrentPlayer(), true);
            assert.equal(game.getCurrentUser().remainingTime < initState.players[0].remainingTime, true);
            assert.equal(game.state.playState, literki.GamePlayState.PlayerMove);
            done();
        });
    });

    it('/player/alive Player2 after Player2 move', (done) => {
        var data = createAliveRequestData(initState);
        callPOSTMethod(gamestates.player2.userName, gamestates.player2.id, '/player/alive', data, (error, response, body) => {
            var game = processPOSTbody(body);
            assert.equal(body.forceRefresh, true);
            assert.equal(game.state.players[1].moves[1].moveType, literki.MoveType.Move);
            assert.equal(game.isNextPlayer(), true);
            assert.equal(game.getCurrentUser().freeLetters.length, literki.MAX_LETTERS);
            done();
        });
    });
});

describe('Player2 fold Suite', () => {
    var initState = gamestates.player2MoveState;
    before((done) => beforeTestSuite(done, initState));
    after((done) => afterTestSuite(done));

    it('/game/fold Player2', (done) => {
        var data = createRequestData(initState);
        callGETMethod(gamestates.player2.userName, gamestates.player2.id, '/game/fold', data, (error, response, body) => {
            var game = processGETbody(body);
            assert.equal(game.isNextPlayer(), true);
            assert.equal(game.state.players[1].moves[1].moveType, literki.MoveType.Fold);
            done();
        });
    });

    it('/player/alive Player1 after Player2 folds', (done) => {
        var data = createAliveRequestData(initState);
        callPOSTMethod(gamestates.player1.userName, gamestates.player1.id, '/player/alive', data, (error, response, body) => {
            var game = processPOSTbody(body);
            assert.equal(body.forceRefresh, true);
            assert.equal(game.isCurrentPlayer(), true);
            done();
        });
    });

});

describe('Player2 change letters Suite', () => {
    var initState = gamestates.player2MoveState;
    before((done) => beforeTestSuite(done, initState));
    after((done) => afterTestSuite(done));

    it('/game/exchange Player2', (done) => {
        var data = {
            gameId: initState.gameId,
            exchangeLetters: [
                initState.players[1].freeLetters[0],
                initState.players[1].freeLetters[1],
                initState.players[1].freeLetters[2]
            ]
        };
        callGETMethod(gamestates.player2.userName, gamestates.player2.id, '/game/exchange', data, (error, response, body) => {
            var game = processGETbody(body);
            assert.equal(game.isNextPlayer(), true);
            assert.equal(game.state.players[1].moves[1].moveType, literki.MoveType.Exchange);
            assert.equal(game.getCurrentUser().freeLetters.length, literki.MAX_LETTERS);
            assert.notEqual(initState.players[1].freeLetters[0], game.state.players[1].freeLetters[0]);
            assert.notEqual(initState.players[1].freeLetters[1], game.state.players[1].freeLetters[1]);
            assert.notEqual(initState.players[1].freeLetters[2], game.state.players[1].freeLetters[2]);
            done();
        });
    });

    it('/player/alive Player1 after Player2 exchanges letters', (done) => {
        var data = createAliveRequestData(initState);
        callPOSTMethod(gamestates.player1.userName, gamestates.player1.id, '/player/alive', data, (error, response, body) => {
            var game = processPOSTbody(body);
            assert.equal(body.forceRefresh, true);
            assert.equal(game.isCurrentPlayer(), true);
            done();
        });
    });
});

function beforeTestSuite(done: any, state: literki.IGameState): void {
    server.start();
    state.players.forEach(p => p.lastSeen = new Date());
    repo.saveState(state, err => done(err));
}

function afterTestSuite(done: any): void {
    server.stop();
    repo.removeAllStates(err => done(err));
}

function createRequestData(state: literki.IGameState): any {
    var data = {
        gameId: state.gameId
    };
    return data;
}

function createAliveRequestData(state: literki.IGameState, currentPlayerIndex: number = state.currentPlayerIndex): any {
    var data = {
        gameId: state.gameId,
        currentPlayerId: state.players[currentPlayerIndex].userId,
        playState: state.playState,
        playersCount: state.players.length
    };
    return data;
}

function callGETMethod(userName: string, id: string, path: string, data: any, call: (error, response: http.IncomingMessage, body) => void): void {
    var authPath = `http://${userName}:${id}@localhost:1337/auth/http`;
    request.get(authPath, (error, response, body) => {
        assert.equal(body, 'Authentifaction successfull');
        var methodPath = `http://localhost:1337${path}`;
        request.get(methodPath, { qs: data }, (error, response, body) => call(error, response, body));
    });
}

function callPOSTMethod(userName: string, id: string, path: string, data: any, call: (error, response: http.IncomingMessage, body) => void): void {
    var authPath = `http://${userName}:${id}@localhost:1337/auth/http`;
    request.get(authPath, (error, response, body) => {
        assert.equal(body, 'Authentifaction successfull');
        var methodPath = `http://localhost:1337${path}`;
        request.post(methodPath, { json: data }, (error, response, body) => call(error, response, body));
    });
}

function processGETbody(body: any): literki.GameRun {
    var result = JSON.parse(body);
    assert.equal(result.errorMessage, undefined);

    var state = literki.GameState.fromJSON(result.state);
    var game = new literki.GameRun(result.userId);
    game.runState(state);
    return game;
}

function processPOSTbody(body: any): literki.GameRun {
    //request automatic parses body as JSON
    var result = body;
    assert.equal(result.errorMessage, undefined);

    var state = literki.GameState.fromJSON(result.state);
    var game = new literki.GameRun(result.userId);
    game.runState(state);
    return game;
}

