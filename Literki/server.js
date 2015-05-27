/// <reference path="typings\body-parser\body-parser.d.ts"/>
var express = require('express');
var bodyParser = require('body-parser');
var literki = require('./scripts/literki');
var literki_server = require('./scripts/literki_server');
var db = require('./scripts/db');
var port = process.env.port || 1337;
var app = express();
app.use(express.static(__dirname + '/../public'));
app.use(bodyParser.json());
app.listen(port);
app.get('/games/new', function (req, res) {
    var repo = new db.GameRepository();
    var player1 = new literki.GamePlayer();
    player1.playerName = "Mama";
    player1.remainingTime = 1345;
    var word1 = new literki.GameWord("literko", 5, 7, 1 /* Horizontal */, 10);
    var move1 = new literki.GameMoveHistory();
    move1.words.push(word1);
    player1.moves.push(move1);
    var player2 = new literki.GamePlayer();
    player2.playerName = "Irenka";
    player2.remainingTime = 1560;
    var word2 = new literki.GameWord("piliśmy", 6, 6, 0 /* Vertical */, 12);
    var move2 = new literki.GameMoveHistory();
    move2.words.push(word2);
    player2.moves.push(move2);
    var player3 = new literki.GamePlayer();
    player3.playerName = "Krzyś";
    player3.remainingTime = 1800;
    var players = new Array();
    players.push(player1);
    players.push(player2);
    players.push(player3);
    var game = new literki_server.GameRun_Server();
    game.newGame(players);
    var state = game.getState();
    var gameId = repo.newState(state);
    state = repo.loadState(gameId);
    return res.json(state);
});
app.get('/games/list', function (req, res) {
});
app.get('/game/get', function (req, res) {
    var repo = new db.GameRepository();
    var gameId = req.query.gameId;
    var state = repo.loadState(gameId);
    return res.json(state);
});
app.post('/game/move', function (req, res) {
    var repo = new db.GameRepository();
    var move = req.body;
    var state = repo.loadState(move.gameId);
    var game = new literki_server.GameRun_Server();
    game.runState(state);
    game.makeMove(move);
    state = game.getState();
    repo.saveState(state);
});
//# sourceMappingURL=server.js.map