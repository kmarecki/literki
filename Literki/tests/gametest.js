/// <reference path='../typings/mocha/mocha.d.ts' />
/// <reference path='../typings/request/request.d.ts' />
process.env['NODE_ENV'] = 'test';
process.env['NODE_CONFIG_DIR'] = '../config';
var assert = require('assert');
var requestModule = require('request');
var request = requestModule.defaults({
    jar: true
});
var server = require('../server');
var gamestates = require('./gamestates');
var repo = server.getGameRepository();
describe('Player2 move Suite', function () {
    before(function (done) {
        server.start();
        var state = gamestates.player2Move;
        repo.saveState(state, function (err) { return done(err); });
    });
    after(function (done) {
        server.stop();
        repo.removeAllStates(function (err) { return done(err); });
    });
    it('/server/alive', function (done) {
        callGETMethod('User1', '/server/alive', function (error, response, body) {
            var result = JSON.parse(body);
            assert.equal(result.errorMessage, undefined);
            done();
        });
    });
});
function callGETMethod(userName, path, call) {
    var authPath = "http://" + userName + ":test@localhost:1337/auth/http";
    request.get(authPath, function (error, response, body) {
        assert.equal(body, 'Authentifaction successfull');
        var methodPath = "http://localhost:1337" + path;
        request.get(methodPath, function (error, response, body) { return call(error, response, body); });
    });
}
//# sourceMappingURL=gametest.js.map