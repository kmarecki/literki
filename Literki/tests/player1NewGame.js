/// <reference path='../typings/mocha/mocha.d.ts' />
/// <reference path='../typings/request/request.d.ts' />
"use strict";
var assert = require('assert');
var async = require('async');
var requestModule = require('request');
var request = requestModule.defaults({
    jar: true
});
var literki = require('../scripts/shared/literki');
var gamestates = require('./gamestates');
var helper = require('./helper');
describe('Player1 new game Suite', function () {
    //cloning to not mess with test data
    var player1 = JSON.parse(JSON.stringify(gamestates.player1));
    var player2 = JSON.parse(JSON.stringify(gamestates.player2));
    var initState;
    before(function (done) { return async.parallel([
        function (callback) { return helper.beforeProfileTestSuite(function (err, id) {
            player1.id = id;
            callback(err);
        }, player1); },
        function (callback) { return helper.beforeProfileTestSuite(function (err, id) {
            player2.id = id;
            callback(err);
        }, player2); },
    ], done); });
    after(function (done) { return helper.afterTestSuite(done); });
    var timeLimit = 20;
    it('/game/new Player1 new game', function (done) {
        var data = {
            playerCount: 2,
            timeLimit: timeLimit
        };
        helper.callPOSTMethod(player1.userName, player1.id, '/game/new', data, function (error, response, body) {
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
    it('/game/start Player1', function (done) {
        var data = helper.createRequestData(initState);
        helper.callGETMethod(player1.userName, player1.id, '/game/start', data, function (error, response, body) {
            var game = helper.processGETbody(body, true);
            assert.equal(game.isCurrentPlayer(), true);
            assert.equal(game.state.runState, literki.GameRunState.Created);
            assert.equal(game.state.playState, literki.GamePlayState.None);
            done();
        });
    });
    it('/game/join Player2', function (done) {
        var data = helper.createRequestData(initState);
        helper.callGETMethod(player2.userName, player2.id, '/game/join', data, function (error, response, body) {
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
    it('/game/start Player1', function (done) {
        var data = helper.createRequestData(initState);
        helper.callGETMethod(player1.userName, player1.id, '/game/start', data, function (error, response, body) {
            var game = helper.processGETbody(body);
            assert.equal(game.isCurrentPlayer(), true);
            assert.equal(game.state.runState, literki.GameRunState.Running);
            assert.equal(game.state.playState, literki.GamePlayState.PlayerMove);
            done();
        });
    });
    it('/player/alive Player1', function (done) {
        var data = helper.createAliveRequestData(initState);
        helper.callPOSTMethod(player1.userName, player1.id, '/player/alive', data, function (error, response, body) {
            var game = helper.processPOSTbody(body);
            //Mocha runner is sometimes too fast
            //assert.equal(game.getCurrentUser().remainingTime < initState.players[0].remainingTime, true);
            assert.equal(game.isCurrentPlayer(), true);
            assert.equal(body.forceRefresh, true);
            done();
        });
    });
    it('/player/alive Player2', function (done) {
        var data = helper.createAliveRequestData(initState);
        helper.callPOSTMethod(player2.userName, player2.id, '/player/alive', data, function (error, response, body) {
            var game = helper.processPOSTbody(body);
            assert.equal(game.getCurrentUser().remainingTime, initState.players[0].remainingTime);
            assert.equal(game.isNextPlayer(), true);
            assert.equal(body.forceRefresh, true);
            done();
        });
    });
});
