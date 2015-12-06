﻿/// <reference path='../typings/mocha/mocha.d.ts' />
/// <reference path='../typings/request/request.d.ts' />

import assert = require('assert');
import async = require('async');
import http = require('http');
import requestModule = require('request');
var request = requestModule.defaults({
    jar: true
});

import literki = require('../scripts/literki');
import entities = require('../scripts/entities');
import gamestates = require('./gamestates');
import helper = require('./helper');

describe('Player1 profile Suite', () => {
    var player = gamestates.player1;

    before((done) => helper.beforeProfileTestSuite((err, id) => {
        player.id = id;
        done(err);
    }, player));

    after((done) => helper.afterProfileTestSuite(done));
    
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
            console.log(JSON.stringify(body));
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

