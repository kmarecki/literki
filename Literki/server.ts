﻿/// <reference path="typings\express\express.d.ts"/>
/// <reference path="public\scripts\literki.ts"/>

import express = require('express');

var port = process.env.port || 1337;

var app = express();
app.use(express.static(__dirname + '/public'));
app.listen(port);

app.get('/games/new', (req, res) => {
    var player1 = new Literki.GamePlayer();
    player1.playerName = "Krzyś";
    player1.freeLetters = ["h", "a", "j", "k", "b", "e", "ź"];

    var word1 = new Literki.GameWord("literki", 5, 7, Literki.GameMoveDirection.Horizontal, 10);
    var move1 = new Literki.GameMove();
    move1.words.push(word1);
    player1.moves.push(move1);

    var player2 = new Literki.GamePlayer();
    player2.playerName = "Irenka";

    var word2 = new Literki.GameWord("piliśmy", 6, 6, Literki.GameMoveDirection.Vertical, 6);
    var move2 = new Literki.GameMove();
    move2.words.push(word2);
    player2.moves.push(move2);

    var players = new Array<Literki.GamePlayer>();
    players.push(player1);
    players.push(player2);

    var state = Literki.GameRun.newGame(players);
    return res.json(state);
});

