/// <reference path='../typings/mocha/mocha.d.ts' />
/// <reference path='../typings/request/request.d.ts' />
process.env['NODE_ENV'] = 'test';
process.env['NODE_CONFIG_DIR'] = '../config';
var assert = require('assert');
var request = require('request');
var server = require('../server');
var literki = require('../scripts/literki');
describe('Game Test Suite', function () {
    before(function () {
        console.log('Before method');
        server.start();
    });
    after(function () {
        console.log('After method');
        server.stop();
    });
    it('/game/get Test', function (done) {
        var options = getGETOptions('/game/get');
        var request2 = request.defaults({
            jar: true
        });
        request2.get('http://test:test@localhost:1337/auth/http', function (error, response, body) {
            request2.get('http://localhost:1337/game/get', function (error, response, body) {
                console.log(body);
                assert.notEqual(body.toString().length, 0);
                done();
            });
        });
    });
});
function createState() {
    var state = new literki.GameState();
    return state;
}
function getGETOptions(path) {
}
//# sourceMappingURL=gametest.js.map