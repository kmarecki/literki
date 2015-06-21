/// <reference path="typings\body-parser\body-parser.d.ts"/>

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

app.get('/games/new',(req, res) => {
    var player1 = new literki.GamePlayer();
    player1.playerName = "Mama";
    player1.remainingTime = 1345;

    var word1 = new literki.GameWord("literko", 5, 7, literki.GameMoveDirection.Horizontal, 10);
    var move1 = new literki.GameMoveHistory();
    move1.words.push(word1);
    player1.moves.push(move1);

    var player2 = new literki.GamePlayer();
    player2.playerName = "Irenka";
    player2.remainingTime = 1560;

    var word2 = new literki.GameWord("piliśmy", 6, 6, literki.GameMoveDirection.Vertical, 12);
    var move2 = new literki.GameMoveHistory();
    move2.words.push(word2);
    player2.moves.push(move2);

    var player3 = new literki.GamePlayer();
    player3.playerName = "Krzyś";
    player3.remainingTime = 1800;

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

app.get('/games/list',(req, res) => {
    repo.allGames((err, games) => {
        var errorMessages = '';
        if (err != null) {
            errorMessages = util.formatError(err);
        }
        res.json({ games: games, errorMessage: errorMessages });
    });
});


app.get('/game/get',(req, res) => {
    var gameId: number = req.query.gameId;
   
    repo.loadState(gameId,(err, state) => {
        var errorMessages = '';
        if (err != null) {
            errorMessages = util.formatError(err);
        }
        res.json({ state: state, errorMessage: errorMessages });
    });
});

app.post('/game/move',(req, res) => {
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





