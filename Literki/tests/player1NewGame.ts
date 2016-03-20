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
import entites = require('../public/scripts/entities');
import gamestates = require('./gamestates');
import helper = require('./helper');

describe('Player1 new game Suite', () => {
    //cloning to not mess with test data
    var player1 = JSON.parse(JSON.stringify(gamestates.player1));
    var player2 = JSON.parse(JSON.stringify(gamestates.player2));
    var initState;

    before((done) => async.parallel([
        (callback: any) => helper.beforeProfileTestSuite((err, id) => {
            player1.id = id;
            callback(err);
        }, player1), 
        (callback: any) => helper.beforeProfileTestSuite((err, id) => {
            player2.id = id;
            callback(err);
        }, player2), 
    ], done));

    after((done) => helper.afterTestSuite(done));

    var timeLimit = 20;

    it('/game/new Player1 new game', (done) => {
        var data: entites.NewGameRequest = {
            playerCount: 2,
            timeLimit: timeLimit
        };

        helper.callPOSTMethod(player1.userName, player1.id, '/game/new', data, (error, response, body) => {
            var game = helper.processPOSTbody(body);
            assert.equal(game.isCurrentPlayer(), true);
            assert.equal(game.getCurrentUser().playerName, player1.userName);
            assert.equal(game.getCurrentUser().freeLetters.length, literki.MAX_LETTERS);
            assert.equal(game.getCurrentUser().remainingTime, timeLimit * 60);
            assert.equal(game.state.runState, literki.GameRunState.Created);
            assert.equal(game.state.playState, literki.GamePlayState.None);
            assert.equal(game.state.players.length, 2);
            initState = game.state;
            done();
        });
    });

    it('/game/start Player1', (done) => {
        var data = helper.createRequestData(initState);
        helper.callGETMethod(player1.userName, player1.id, '/game/start', data, (error, response, body) => {
            var game = helper.processGETbody(body, true);
            assert.equal(game.isCurrentPlayer(), true);
            assert.equal(game.state.runState, literki.GameRunState.Created);
            assert.equal(game.state.playState, literki.GamePlayState.None);
            done();
        });
    });

    it('/game/join Player2', (done) => {
        var data = helper.createRequestData(initState);
        helper.callGETMethod(player2.userName, player2.id, '/game/join', data, (error, response, body) => {
            var game = helper.processGETbody(body);
            assert.equal(game.isNextPlayer(), true);
            assert.equal(game.getCurrentUser().playerName, player2.userName);
            assert.equal(game.getCurrentUser().freeLetters.length, literki.MAX_LETTERS);
            assert.equal(game.getCurrentUser().remainingTime, timeLimit * 60);
            assert.equal(game.state.runState, literki.GameRunState.Created);
            assert.equal(game.state.playState, literki.GamePlayState.None);
            done();
        });
    });

    it('/game/start Player1', (done) => {
        var data = helper.createRequestData(initState);
        helper.callGETMethod(player1.userName, player1.id, '/game/start', data, (error, response, body) => {
            var game = helper.processGETbody(body);
            assert.equal(game.isCurrentPlayer(), true);
            assert.equal(game.state.runState, literki.GameRunState.Running);
            assert.equal(game.state.playState, literki.GamePlayState.PlayerMove);
            done();
        });
    });

    it('/player/alive Player1', (done) => {
        var data = helper.createAliveRequestData(initState);
        helper.callPOSTMethod(player1.userName, player1.id, '/player/alive', data, (error, response, body) => {
            var game = helper.processPOSTbody(body);
            //Mocha runner is sometimes too fast
            //assert.equal(game.getCurrentUser().remainingTime < initState.players[0].remainingTime, true);
            assert.equal(game.isCurrentPlayer(), true);
            assert.equal(body.forceRefresh, true);
            done();
        });
    });

    it('/player/alive Player2', (done) => {
        var data = helper.createAliveRequestData(initState);
        helper.callPOSTMethod(player2.userName, player2.id, '/player/alive', data, (error, response, body) => {
            var game = helper.processPOSTbody(body);
            assert.equal(game.getCurrentUser().remainingTime, initState.players[0].remainingTime);
            assert.equal(game.isNextPlayer(), true);
            assert.equal(body.forceRefresh, true);
            done();
        });
    });
});