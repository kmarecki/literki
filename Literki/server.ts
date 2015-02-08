/// <reference path="typings\express\express.d.ts"/>

import express = require('express');
import literki = require('./scripts/literki');
import db = require('./scripts/db');

var port = process.env.port || 1337;

var app = express();
app.use(express.static(__dirname + '/../public'));
app.listen(port);

app.get('/game/new',(req, res) => {
    var repo = new db.GameRepository();
    var player1 = new literki.GamePlayer();
    player1.playerName = "Mama";
    player1.remainingTime = 1345;
    player1.freeLetters = ["h", "a", "j", "k", "b", "e", "ź"];

    var word1 = new literki.GameWord("literko", 5, 7, literki.GameMoveDirection.Horizontal, 10);
    var move1 = new literki.GameMove();
    move1.words.push(word1);
    player1.moves.push(move1);

    var player2 = new literki.GamePlayer();
    player2.playerName = "Irenka";
    player2.remainingTime = 1560;

    var word2 = new literki.GameWord("piliśmy", 6, 6, literki.GameMoveDirection.Vertical, 12);
    var move2 = new literki.GameMove();
    move2.words.push(word2);
    player2.moves.push(move2);

    var player3 = new literki.GamePlayer();
    player3.playerName = "Krzyś";
    player3.remainingTime = 1800;

    var players = new Array<literki.GamePlayer>();
    players.push(player1);
    players.push(player2);
    players.push(player3);

    var state = literki.GameRun.newGame(players);
    var gameId = repo.newState(state);
    state = repo.loadState(gameId);
    return res.json(state);
});

app.get('/game/get',(req, res) => {
    var repo = new db.GameRepository();
    var gameId: number = req.query.gameId;
    var state = repo.loadState(gameId);
    return res.json(state);
});

app.get('/game/move',(req, res) => {
});




