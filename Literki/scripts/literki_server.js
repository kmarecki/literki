///<reference path="..\typings\underscore\underscore.d.ts"/>
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var _ = require('underscore');
var literki = require('./literki');
var GameRun_Server = (function (_super) {
    __extends(GameRun_Server, _super);
    function GameRun_Server() {
        _super.apply(this, arguments);
    }
    GameRun_Server.prototype.newGame = function (players) {
        var _this = this;
        this.state = new literki.GameState();
        this.state.gameId = 1;
        this.state.players = players.slice();
        this.state.remainingLetters = this.allLetters();
        this.state.players.forEach(function (p) { return _this.pickLetters(_this.state.players.indexOf(p)); });
    };
    GameRun_Server.prototype.makeMove = function (move) {
        var _this = this;
        move.freeLetters.forEach(function (fl) {
            _this.putFreeLetter(fl.letter, fl.index, fl.x, fl.y);
            var playersFreeLetters = _this.getCurrentPlayer().freeLetters;
            var index = playersFreeLetters.indexOf(fl.letter);
            playersFreeLetters.splice(index, 1);
        });
        this.updateState();
    };
    GameRun_Server.prototype.addPlayer = function (player) {
        if (this.state.runState == 0 /* Created */) {
            var res = _.find(this.state.players, function (p) { return p.userId == player.userId; });
            if (res == null) {
                this.state.players.push(player);
                this.pickLetters(this.state.players.length - 1);
                return true;
            }
        }
        return false;
    };
    GameRun_Server.prototype.allLetters = function () {
        var letters = new Array();
        for (var key in literki.LETTERS) {
            var letter = literki.LETTERS[key];
            for (var n = 0; n < letter.count; n++) {
                letters.push(key);
            }
        }
        return letters;
    };
    GameRun_Server.prototype.pickLetters = function (playerIndex) {
        var player = this.state.players[playerIndex];
        var lettersToPick = literki.MAX_LETTERS - player.freeLetters.length;
        for (var n = 0; n < lettersToPick; n++) {
            var range = this.state.remainingLetters.length;
            var pickIndex = Math.floor((Math.random() * range));
            player.freeLetters.push(this.state.remainingLetters[pickIndex]);
            this.state.remainingLetters.splice(pickIndex, 1);
        }
    };
    GameRun_Server.prototype.updateState = function () {
        var move = new literki.GameMoveHistory();
        this.getNewWords().forEach(function (p) { return move.words.push(new literki.GameWord(p.word, p.x, p.y, p.direction, p.points)); });
        this.getCurrentPlayer().moves.push(move);
        this.state.currentPlayerIndex = (this.state.currentPlayerIndex + 1) % this.state.players.length;
        return this.state;
    };
    return GameRun_Server;
})(literki.GameRun);
exports.GameRun_Server = GameRun_Server;
//# sourceMappingURL=literki_server.js.map