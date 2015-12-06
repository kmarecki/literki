/// <reference path='../typings/mocha/mocha.d.ts' />
/// <reference path='../typings/request/request.d.ts' />

import assert = require('assert');
import async = require('async');
import http = require('http');
import requestModule = require('request');
var request = requestModule.defaults({
    jar: true
});

import literki = require('../scripts/literki');
import entites = require('../scripts/entities');
import gamestates = require('./gamestates');
import helper = require('./helper');

describe('Player1 new game Suite', () => {
    //cloning to not mess with test data
    var player = JSON.parse(JSON.stringify(gamestates.player1));

    before((done) => helper.beforeProfileTestSuite((err, id) => {
        player.id = id;
        done(err);
    }, player));

    after((done) => helper.afterTestSuite(done));

    it('/game/new Player1 new game', (done) => {
        var data: entites.NewGameRequest = {
            playerCount: 2,
            timeLimit: 20
        };

        helper.callPOSTMethod(player.userName, player.id, '/game/new', data, (error, response, body) => {
            var game = helper.processPOSTbody(body, true);
            assert.equal(game.isCurrentPlayer(), true);
            assert.equal(game.getCurrentUser().freeLetters.length, literki.MAX_LETTERS);
            assert.equal(game.getCurrentUser().remainingTime, data.timeLimit * 60);
            assert.equal(game.state.runState, literki.GameRunState.Created);
            assert.equal(game.state.playState, literki.GamePlayState.None);
            done();
        });
    });
});