/// <reference path="typings\express\express.d.ts"/>

import express = require('express');
import Literki = require('./scripts/literki');
import db = require('./scripts/db');

var port = process.env.port || 1337;

var app = express();
app.use(express.static(__dirname + '/../public'));
app.listen(port);

app.get('/games/new', (req, res) => {
    var player1 = new Literki.GamePlayer();
    player1.playerName = "Mama";
    player1.remainingTime = 1345;
    player1.freeLetters = ["h", "a", "j", "k", "b", "e", "ź"];

    var word1 = new Literki.GameWord("literki", 5, 7, Literki.GameMoveDirection.Horizontal, 10);
    var move1 = new Literki.GameMove();
    move1.words.push(word1);
    player1.moves.push(move1);

    var player2 = new Literki.GamePlayer();
    player2.playerName = "Irenka";
    player2.remainingTime = 1560;

    var word2 = new Literki.GameWord("piliśmy", 6, 6, Literki.GameMoveDirection.Vertical, 12);
    var move2 = new Literki.GameMove();
    move2.words.push(word2);
    player2.moves.push(move2);

    var player3 = new Literki.GamePlayer();
    player3.playerName = "Krzyś";
    player3.remainingTime = 1800;

    var players = new Array<Literki.GamePlayer>();
    players.push(player1);
    players.push(player2);
    players.push(player3);

    var state = Literki.GameRun.newGame(players);
    return res.json(state);
});



