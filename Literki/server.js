/// <reference path="typings\body-parser\body-parser.d.ts"/>
var express = require('express');
var bodyParser = require('body-parser');
var literki = require('./scripts/literki');
var literki_server = require('./scripts/literki_server');
var db = require('./scripts/db');
var util = require('./scripts/util');
var port = process.env.port || 1337;
var app = express();
app.use(express.static(__dirname + '/../public'));
app.use(bodyParser.json());
app.listen(port);
var repo = new db.GameRepository();
repo.open();
app.get('/games/new', function (req, res) {
    var player1 = new literki.GamePlayer();
    player1.playerName = "Mama";
    player1.remainingTime = 18 * 60 + 35;
    var player2 = new literki.GamePlayer();
    player2.playerName = "Irenka";
    player2.remainingTime = 20 * 60;
    var player3 = new literki.GamePlayer();
    player3.playerName = "Krzyś";
    player3.remainingTime = 20 * 60;
    var players = new Array();
    players.push(player1);
    players.push(player2);
    players.push(player3);
    var game = new literki_server.GameRun_Server();
    game.newGame(players);
    var state = game.getState();
    repo.newState(state, function (err, gameId) {
        var errorMessages = '';
        if (err != null) {
            errorMessages = util.formatError(err);
        }
        repo.loadState(gameId, function (err, state) {
            if (err != null) {
                errorMessages = errorMessages.concat(util.formatError(err));
            }
            res.json({ state: state, errorMessage: errorMessages });
        });
    });
});
app.get('/games/list', function (req, res) {
    repo.allGames(function (err, games) {
        var errorMessages = '';
        if (err != null) {
            errorMessages = util.formatError(err);
        }
        res.json({ games: games, errorMessage: errorMessages });
    });
});
app.get('/game/get', function (req, res) {
    var gameId = req.query.gameId;
    repo.loadState(gameId, function (err, state) {
        var errorMessages = '';
        if (err != null) {
            errorMessages = util.formatError(err);
        }
        res.json({ state: state, errorMessage: errorMessages });
    });
});
app.post('/game/move', function (req, res) {
    var move = req.body;
    var game = new literki_server.GameRun_Server();
    repo.loadState(move.gameId, function (err, state) {
        var errorMessages = '';
        if (err != null) {
            errorMessages = util.formatError(err);
            res.json({ state: state, errorMessage: errorMessages });
        }
        else {
            game.runState(state);
            game.makeMove(move);
            state = game.getState();
            repo.saveState(state, function (err) {
                if (err != null) {
                    errorMessages = errorMessages.concat(util.formatError(err));
                }
                res.json({ state: state, errorMessage: errorMessages });
            });
        }
    });
});
//# sourceMappingURL=server.js.map