﻿/// <reference path="typings\body-parser\body-parser.d.ts"/>

import express = require('express');
import bodyParser = require('body-parser');
import literki = require('./scripts/literki');
import literki_server = require('./scripts/literki_server');
import db = require('./scripts/db');
import util = require('./scripts/util');

var port = process.env.port || 1337;

var app = express();
app.use(express.static(__dirname + '/../public'));
app.use(bodyParser.json());
app.listen(port);

var repo = new db.GameRepository();
repo.open();

app.get('/games/new', (req, res) => {
    var player1 = new literki.GamePlayer();
    player1.playerName = "Mama";
    player1.remainingTime = 18 * 60 + 35;

    var player2 = new literki.GamePlayer();
    player2.playerName = "Irenka";
    player2.remainingTime = 20 * 60;

    var player3 = new literki.GamePlayer();
    player3.playerName = "Krzyś";
    player3.remainingTime = 20 * 60;

    var players = new Array<literki.GamePlayer>();
    players.push(player1);
    players.push(player2);
    players.push(player3);

    var game = new literki_server.GameRun_Server();
    game.newGame(players);
    var state: literki.IGameState = game.getState();

    repo.newState(state,(err, gameId) => {
        var errorMessages = '';
        if (err != null) {
            errorMessages = util.formatError(err);
        }
        repo.loadState(gameId,(err, state) => {
            if (err != null) {
                errorMessages = errorMessages.concat(util.formatError(err));
            }
            res.json({ state: state, errorMessage: errorMessages });
        });
    });

});

app.get('/games/list', (req, res) => {
    repo.allGames((err, games) => {
        var errorMessages = '';
        if (err != null) {
            errorMessages = util.formatError(err);
        }
        res.json({ games: games, errorMessage: errorMessages });
    });
});


app.get('/game/get', (req, res) => {
    var gameId: number = req.query.gameId;
   
    repo.loadState(gameId,(err, state) => {
        var errorMessages = '';
        if (err != null) {
            errorMessages = util.formatError(err);
        }
        res.json({ state: state, errorMessage: errorMessages });
    });
});

app.post('/game/move', (req, res) => {
    var move: literki.GameMove = req.body;
    var game = new literki_server.GameRun_Server();

    repo.loadState(move.gameId,(err, state) => {
        var errorMessages = '';
        if (err != null) {
            errorMessages = util.formatError(err);
            res.json({ state: state, errorMessage: errorMessages });
        } else {
            game.runState(state);
            game.makeMove(move);
            state = game.getState();
            repo.saveState(state,(err) => {
                if (err != null) {
                    errorMessages = errorMessages.concat(util.formatError(err));
                }
                res.json({ state: state, errorMessage: errorMessages });
            });
        }
    });
});

app.post('/game/alive',(req, res) => {
    var gameId: number = req.body.gameId;
    var playerName: string = req.body.playerName;
    var game = new literki_server.GameRun_Server();

    repo.loadState(gameId,(err, state) => {
        var errorMessages = '';
        if (err != null) {
            errorMessages = util.formatError(err);
            res.json({ state: state, errorMessage: errorMessages });
        } else {
            var remainingTime = state.players[state.currentPlayerIndex].remainingTime;
            if (remainingTime > 0) {
                remainingTime--;
                state.players[state.currentPlayerIndex].remainingTime = remainingTime;
            }
            repo.saveState(state,(err) => {
                if (err != null) {
                    errorMessages = errorMessages.concat(util.formatError(err));
                }
                res.json({ remainingTime: remainingTime, errorMessage: errorMessages });
            });
        }
    });
});





