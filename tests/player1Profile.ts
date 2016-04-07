/// <reference path='../typings/main.d.ts' />

import assert = require('assert');
import async = require('async');
import http = require('http');
import requestModule = require('request');
var request = requestModule.defaults({
    jar: true
});

import literki = require('../scripts/shared/literki');
import entities = require('../scripts/shared/entities');
import gamestates = require('./gamestates');
import helper = require('./helper');

describe('Player1 profile Suite', () => {
    //cloning to not mess with test data
    var player = JSON.parse(JSON.stringify(gamestates.player1));

    before((done) => helper.beforeProfileTestSuite((err, id) => {
        player.id = id;
        done(err);
    }, player));

    after((done) => helper.afterTestSuite(done));
    
    it('/player/get Player1', (done) => {
        helper.callGETMethod(player.userName, player.id, '/player/get', undefined, (error, response, body) => {
            var profile = processGETBody(body);
            assert.equal(profile.authId, player.authId);
            assert.equal(profile.userName, player.userName);
            done();
        });
    });

    it('/player/update Player1', (done) => {
        var data = player;
        helper.callPOSTMethod(player.userName, player.id, '/player/update', data, (error, response, body) => {
            var profile = processPOSTBody(body);
            assert.equal(profile.authId, player.authId);
            assert.equal(profile.defaultLanguage, player.defaultLanguage);
            assert.equal(profile.email, player.email);
            assert.equal(profile.userName, player.userName);
            done();
        });
    });

    it('/player/get Player1 after updating', (done) => {
        helper.callGETMethod(player.userName, player.id, '/player/get', undefined, (error, response, body) => {
            var profile = processGETBody(body);
            assert.equal(profile.authId, player.authId);
            assert.equal(profile.defaultLanguage, player.defaultLanguage);
            assert.equal(profile.email, player.email);
            assert.equal(profile.userName, player.userName);
            done();
        });
    });

    it('/player/update Player1', (done) => {
        player.defaultLanguage = "de";
        player.email = "new@literki.org";
        var data = player;
        helper.callPOSTMethod(player.userName, player.id, '/player/update', data, (error, response, body) => {
            var profile = processPOSTBody(body);
            assert.equal(profile.authId, player.authId);
            assert.equal(profile.defaultLanguage, player.defaultLanguage);
            assert.equal(profile.email, player.email);
            assert.equal(profile.userName, player.userName);
            done();
        });
    });

    it('/player/get Player1 after updating', (done) => {
        helper.callGETMethod(player.userName, player.id, '/player/get', undefined, (error, response, body) => {
            var profile = processGETBody(body);
            assert.equal(profile.authId, player.authId);
            assert.equal(profile.defaultLanguage, player.defaultLanguage);
            assert.equal(profile.email, player.email);
            assert.equal(profile.userName, player.userName);
            done();
        });
    });
});

export function processGETBody(body: any, skipErrorChecking: boolean = false): entities.UserProfile {
    var result = JSON.parse(body);
    if (!skipErrorChecking) {
        assert.equal(result.errorMessage, undefined);
    }

    var profile = result.userProfile;
    return profile;
}

export function processPOSTBody(body: any, skipErrorChecking: boolean = false): entities.UserProfile {
    var result = body;
    if (!skipErrorChecking) {
        assert.equal(result.errorMessage, undefined);
    }

    var profile = result.userProfile;
    return profile;
}

