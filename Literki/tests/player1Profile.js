/// <reference path='../typings/mocha/mocha.d.ts' />
/// <reference path='../typings/request/request.d.ts' />
var assert = require('assert');
var requestModule = require('request');
var request = requestModule.defaults({
    jar: true
});
var gamestates = require('./gamestates');
var helper = require('./helper');
describe('Player1 profile Suite', function () {
    //cloning to not mess with test data
    var player = JSON.parse(JSON.stringify(gamestates.player1));
    before(function (done) { return helper.beforeProfileTestSuite(function (err, id) {
        player.id = id;
        done(err);
    }, player); });
    after(function (done) { return helper.afterTestSuite(done); });
    it('/player/get Player1', function (done) {
        helper.callGETMethod(player.userName, player.id, '/player/get', undefined, function (error, response, body) {
            var profile = processGETBody(body);
            assert.equal(profile.authId, player.authId);
            assert.equal(profile.userName, player.userName);
            done();
        });
    });
    it('/player/update Player1', function (done) {
        var data = player;
        helper.callPOSTMethod(player.userName, player.id, '/player/update', data, function (error, response, body) {
            var profile = processPOSTBody(body);
            assert.equal(profile.authId, player.authId);
            assert.equal(profile.defaultLanguage, player.defaultLanguage);
            assert.equal(profile.email, player.email);
            assert.equal(profile.userName, player.userName);
            done();
        });
    });
    it('/player/get Player1 after updating', function (done) {
        helper.callGETMethod(player.userName, player.id, '/player/get', undefined, function (error, response, body) {
            var profile = processGETBody(body);
            assert.equal(profile.authId, player.authId);
            assert.equal(profile.defaultLanguage, player.defaultLanguage);
            assert.equal(profile.email, player.email);
            assert.equal(profile.userName, player.userName);
            done();
        });
    });
    it('/player/update Player1', function (done) {
        player.defaultLanguage = "de";
        player.email = "new@literki.org";
        var data = player;
        helper.callPOSTMethod(player.userName, player.id, '/player/update', data, function (error, response, body) {
            var profile = processPOSTBody(body);
            assert.equal(profile.authId, player.authId);
            assert.equal(profile.defaultLanguage, player.defaultLanguage);
            assert.equal(profile.email, player.email);
            assert.equal(profile.userName, player.userName);
            done();
        });
    });
    it('/player/get Player1 after updating', function (done) {
        helper.callGETMethod(player.userName, player.id, '/player/get', undefined, function (error, response, body) {
            var profile = processGETBody(body);
            assert.equal(profile.authId, player.authId);
            assert.equal(profile.defaultLanguage, player.defaultLanguage);
            assert.equal(profile.email, player.email);
            assert.equal(profile.userName, player.userName);
            done();
        });
    });
});
function processGETBody(body, skipErrorChecking) {
    if (skipErrorChecking === void 0) { skipErrorChecking = false; }
    var result = JSON.parse(body);
    if (!skipErrorChecking) {
        assert.equal(result.errorMessage, undefined);
    }
    var profile = result.userProfile;
    return profile;
}
exports.processGETBody = processGETBody;
function processPOSTBody(body, skipErrorChecking) {
    if (skipErrorChecking === void 0) { skipErrorChecking = false; }
    var result = body;
    if (!skipErrorChecking) {
        assert.equal(result.errorMessage, undefined);
    }
    var profile = result.userProfile;
    return profile;
}
exports.processPOSTBody = processPOSTBody;
//# sourceMappingURL=player1Profile.js.map