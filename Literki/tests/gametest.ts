/// <reference path='../typings/mocha/mocha.d.ts' />
/// <reference path='../typings/request/request.d.ts' />

process.env['NODE_ENV'] = 'test';
process.env['NODE_CONFIG_DIR'] = '../config';

import assert = require('assert');
import request = require('request');

import http = require('http');
import server = require('../server');
import literki = require('../scripts/literki');

describe('Game Test Suite', () => {
    before(() => {
        console.log('Before method');
        server.start();

    });

    after(() => {
        console.log('After method');
        server.stop();
    });

    it('/game/get Test', (done) => {
        var options = getGETOptions('/game/get');
        var request2 = request.defaults({
            jar: true
        });
        request2.get('http://test:test@localhost:1337/auth/http', (error, response, body) => {
            
            request2.get('http://localhost:1337/game/get', (error, response, body) => {
                console.log(body);
                assert.notEqual(body.toString().length, 0);
                done();
            });
        });
    });

});

function createState(): literki.GameState {
    var state = new literki.GameState();
    return state;
}

function getGETOptions(path: string): void {
    
}
