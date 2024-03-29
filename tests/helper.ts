﻿process.env['NODE_ENV'] = 'test';
process.env['NODE_CONFIG_DIR'] = '../config';

import assert = require('assert');
import fs = require('fs');
import http = require('http');
import path = require('path');
import server = require('../server');
import literki = require('../scripts/shared/literki');
import entities = require('../scripts/shared/entities');
import gamestates = require('./gamestates');

var config = require('config');

import requestModule = require('request');
var request = requestModule.defaults({
    jar: true
});


var repo = server.getGameRepository();

export function serverStart(): void {
    server.start();
}

export function serverStop(): void {
    server.stop();
}

export function beforeTestSuite(done: any, state: literki.IGameState): void {
    serverStart();
    state.players.forEach(p => p.lastSeen = new Date());
    repo.saveState(state, err => done(err));
}

export function afterTestSuite(done: any): void {
    serverStop();
    repo.removeAllStates(err => {
        repo.removeAllUsers(err => {
            done(err);
        });
    });
}

export function beforeProfileTestSuite(done: (Error, string) => any, profile: entities.UserProfile): void {
    serverStart();
    repo.loadOrCreateUser(profile.authId, profile.userName, (err, result) => done(err, result.id));
}

export function loadState(file: string): literki.IGameState {
    var filePath = path.join('states', file + '.json');
    var stateJSON = fs.readFileSync(filePath, 'utf8');
    var initState = JSON.parse(stateJSON.replace(/^\uFEFF/, ''));
    return literki.GameState.fromJSON(initState);
}

export function createRequestData(state: literki.IGameState): any {
    var data = {
        gameId: state.gameId
    };
    return data;
}

export function createAliveRequestData(state: literki.IGameState, currentPlayerIndex: number = state.currentPlayerIndex): any {
    var data = {
        gameId: state.gameId,
        currentPlayerId: state.players[currentPlayerIndex].userId,
        playState: state.playState,
        playersCount: state.players.length,
    };
    return data;
}

export function callGETMethod(userName: string, id: string, path: string, data: any, call: (error, response: http.IncomingMessage, body) => void): void {
    var authPath = `http://${userName}:${id}@localhost:${config.Server.port}/auth/http`;
    request.get(authPath, (error, response, body) => {
        assert.equal(body, 'Authentifaction successfull');
        var methodPath = `http://localhost:${config.Server.port + path}`;
        request.get(methodPath, { qs: data }, (error, response, body) => call(error, response, body));
    });
}

export function callPOSTMethod(userName: string, id: string, path: string, data: any, call: (error, response: http.IncomingMessage, body) => void): void {
    var authPath = `http://${userName}:${id}@localhost:${config.Server.port}/auth/http`;
    request.get(authPath, (error, response, body) => {
        assert.equal(body, 'Authentifaction successfull');
        var methodPath = `http://localhost:${config.Server.port + path}`;
        request.post(methodPath, { json: data }, (error, response, body) => call(error, response, body));
    });
}

export function processGETbody(body: any, skipErrorChecking: boolean = false): literki.GameRun {
    var result = JSON.parse(body);
    if (!skipErrorChecking) {
        assert.equal(result.errorMessage, undefined);
    } else {
        assert.notEqual(result.errorMessage, undefined);
    }

    var state = literki.GameState.fromJSON(result.state);
    var game = new literki.GameRun(result.userId);
    game.runState(state);
    return game;
}

export function processPOSTbody(body: any, skipErrorChecking: boolean = false): literki.GameRun {
    //request automatic parses body as JSON
    var result = body;
    if (!skipErrorChecking) {
        assert.equal(result.errorMessage, undefined);
    } else {
        assert.notEqual(result.errorMessage, undefined);
    }

    var state = literki.GameState.fromJSON(result.state);
    var game = new literki.GameRun(result.userId);
    game.runState(state);
    return game;
}