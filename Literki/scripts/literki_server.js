var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
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
        for (var freeLetter in move.freeLetters) {
            this.putFreeLetter(freeLetter.letter, freeLetter.index, freeLetter.x, freeLetter.y);
        }
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
    return GameRun_Server;
})(literki.GameRun);
exports.GameRun_Server = GameRun_Server;
//# sourceMappingURL=literki_server.js.map