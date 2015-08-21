/// <reference path='../typings/mocha/mocha.d.ts' />
/// <reference path='../typings/request/request.d.ts' />

process.env['NODE_ENV'] = 'test';
process.env['NODE_CONFIG_DIR'] = '../config';

import assert = require('assert');
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
    before((done) => {
        server.start();
        var state = gamestates.player2Move;
        repo.saveState(state, err => done(err));
    });

    after((done) => {
        server.stop();
        repo.removeAllStates(err => done(err));
    });

    it('/server/alive', (done) => {
        callGETMethod('User1', '/server/alive', (error, response, body) => {
            var result = JSON.parse(body);
            assert.equal(result.errorMessage, undefined);
            done();
        });
    });
});

function callGETMethod(userName: string, path: string, call: (error, response: http.IncomingMessage, body) => void) {
    var authPath = `http://${userName}:test@localhost:1337/auth/http`;
    request.get(authPath, (error, response, body) => {
        assert.equal(body, 'Authentifaction successfull');
        var methodPath = `http://localhost:1337${path}`;
        request.get(methodPath, (error, response, body) => call(error, response, body));
    });
}

