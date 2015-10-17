///<reference path="..\typings\underscore\underscore.d.ts"/>
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var _ = require('underscore');
var literki = require('./literki');
var PlayerActionType;
(function (PlayerActionType) {
    PlayerActionType[PlayerActionType["Move"] = 0] = "Move";
    PlayerActionType[PlayerActionType["MoveApproval"] = 1] = "MoveApproval";
    PlayerActionType[PlayerActionType["MoveCheck"] = 2] = "MoveCheck";
})(PlayerActionType || (PlayerActionType = {}));
var GameMethodResult = (function () {
    function GameMethodResult(errorMessage) {
        this.errorMessage = errorMessage;
    }
    GameMethodResult.Undefined = new GameMethodResult();
    return GameMethodResult;
})();
exports.GameMethodResult = GameMethodResult;
var GameRun_Server = (function (_super) {
    __extends(GameRun_Server, _super);
    function GameRun_Server() {
        _super.apply(this, arguments);
        this.UNATHORIZED_ACCESS = new GameMethodResult("Gracz jest nieuprawniony do wykonania operacji");
    }
    GameRun_Server.prototype.newGame = function (players) {
        var _this = this;
        this.state = new literki.GameState();
        this.state.gameId = 1;
        this.state.players = players.slice();
        this.state.remainingLetters = this.allLetters();
        this.state.players.forEach(function (p) { return _this.pickLetters(_this.state.players.indexOf(p)); });
    };
    GameRun_Server.prototype.alive = function () {
        if (this.getCurrentUser()) {
            var now = new Date();
            if (this.isCurrentPlayer() &&
                this.state.runState == literki.GameRunState.Running &&
                this.state.playState == literki.GamePlayState.PlayerMove &&
                _.every(this.state.players, function (player) { return player.isAlive(); })) {
                var remainingTime = this.getCurrentPlayer().remainingTime;
                if (remainingTime > 0) {
                    var span = (now.getTime() - this.getCurrentPlayer().lastSeen.getTime());
                    //Otherwise remainingTime can be zeroed after reconect after game is paused
                    if (span < literki.CLIENT_TIMEOUT) {
                        remainingTime -= (span / 1000);
                        this.state.players[this.state.currentPlayerIndex].remainingTime = remainingTime;
                    }
                }
            }
            this.getCurrentUser().lastSeen = now;
        }
        return GameMethodResult.Undefined;
    };
    GameRun_Server.prototype.makeMove = function (move) {
        var _this = this;
        if (this.isCurrentPlayer()) {
            var result = GameMethodResult.Undefined;
            move.freeLetters.forEach(function (field) {
                if (!_this.isFieldValid(field.x, field.y)) {
                    result = new GameMethodResult("Niedozwolony ruch");
                }
                _this.putLetterOnBoard(field.letter, field.index, field.x, field.y);
                var playersFreeLetters = _this.getCurrentPlayer().freeLetters;
                var index = playersFreeLetters.indexOf(field.letter);
                playersFreeLetters.splice(index, 1);
            });
            if (!this.isBoardValid()) {
                result = new GameMethodResult("Niedozwolony ruch");
            }
            else {
                this.updateStateAfterPlayerAction(move, PlayerActionType.Move);
            }
            return result;
        }
        return this.UNATHORIZED_ACCESS;
    };
    GameRun_Server.prototype.approveMove = function (approve, existsWords) {
        var move = this.getActualMove();
        if (this.isNextPlayer()) {
            if (approve) {
                this.updateStateAfterPlayerAction(move, PlayerActionType.MoveApproval);
            }
            else {
                this.updateStateAfterPlayerAction(move, PlayerActionType.MoveCheck, { existsWords: existsWords });
            }
            return GameMethodResult.Undefined;
        }
        return this.UNATHORIZED_ACCESS;
    };
    GameRun_Server.prototype.addPlayer = function (player) {
        if (this.state.runState == literki.GameRunState.Created) {
            var res = _.find(this.state.players, function (p) { return p.userId == player.userId; });
            if (res == null) {
                this.state.players.push(player);
                this.pickLetters(this.state.players.length - 1);
                return true;
            }
        }
        return false;
    };
    GameRun_Server.prototype.join = function () {
        var _this = this;
        if (this.state.runState == literki.GameRunState.Created) {
            var res = _.find(this.state.players, function (p) { return p.userId == _this.currentUserId; });
            if (res == null) {
                var newPlayer = new literki.GamePlayer();
                newPlayer.userId = this.currentUserId;
                newPlayer.playerName = "Krzyś";
                newPlayer.remainingTime = 15 * 60;
                this.addPlayer(newPlayer);
            }
        }
        return GameMethodResult.Undefined;
    };
    GameRun_Server.prototype.start = function () {
        if (this.isGameOwner()) {
            if (this.state.players.length < 2) {
                return new GameMethodResult("Za mało graczy do rozpoczęcia gry");
            }
            if (this.state.runState == literki.GameRunState.Created || literki.GameRunState.Paused) {
                this.state.runState = literki.GameRunState.Running;
                this.state.playState = literki.GamePlayState.PlayerMove;
            }
            else {
                return new GameMethodResult("Nie można rozpocząć gry");
            }
            return GameMethodResult.Undefined;
        }
        return this.UNATHORIZED_ACCESS;
    };
    GameRun_Server.prototype.pause = function () {
        if (this.isGameOwner()) {
            if (this.state.runState == literki.GameRunState.Running) {
                this.state.runState = literki.GameRunState.Paused;
            }
            else {
                return new GameMethodResult("Nie można zatrzymać gry");
            }
            return GameMethodResult.Undefined;
        }
        return this.UNATHORIZED_ACCESS;
    };
    GameRun_Server.prototype.fold = function () {
        if (this.isCurrentPlayer()) {
            this.updateStateAfterMove(literki.MoveType.Fold);
            return GameMethodResult.Undefined;
        }
        return this.UNATHORIZED_ACCESS;
    };
    GameRun_Server.prototype.exchange = function (exchangeLetters) {
        if (this.isCurrentPlayer()) {
            if (exchangeLetters == null || exchangeLetters.length == 0) {
                return new GameMethodResult("Nie ma żadnych literek do wymiany");
            }
            var freeLetters = this.getCurrentPlayer().freeLetters;
            exchangeLetters.forEach(function (letter) { return freeLetters = _.filter(freeLetters, function (l) { return l == letter; }); });
            this.getCurrentPlayer().freeLetters = freeLetters;
            this.updateStateAfterMove(literki.MoveType.Exchange);
            return GameMethodResult.Undefined;
        }
        return this.UNATHORIZED_ACCESS;
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
    GameRun_Server.prototype.updateStateAfterPlayerAction = function (move, actionType, options) {
        var _this = this;
        switch (actionType) {
            case PlayerActionType.Move: {
                this.state.currentMove = move;
                this.state.playState = literki.GamePlayState.MoveApproval;
                break;
            }
            case PlayerActionType.MoveApproval: {
                this.state.playState = literki.GamePlayState.PlayerMove;
                this.updateStateAfterMove(literki.MoveType.Move);
                this.clearMove();
                break;
            }
            case PlayerActionType.MoveCheck: {
                this.state.playState = literki.GamePlayState.PlayerMove;
                if (!options.existsWords) {
                    //False Move
                    move.freeLetters.forEach(function (l) { return _this.getCurrentPlayer().freeLetters.push(l.letter); });
                    this.clearMove();
                    this.updateStateAfterMove(literki.MoveType.WrongMove);
                }
                else {
                    //Good Move
                    this.updateStateAfterMove(literki.MoveType.Move);
                    this.clearMove();
                    //Player must be skipped because the word exists in the dictionary
                    this.updateStateAfterMove(literki.MoveType.CheckMoveFailed);
                }
                break;
            }
        }
        return this.state;
    };
    GameRun_Server.prototype.clearMove = function () {
        this.state.currentMove = null;
        this.freeLetters.clear();
    };
    GameRun_Server.prototype.updateStateAfterMove = function (moveType) {
        var moveHistory = new literki.GameMoveHistory();
        moveHistory.moveType = moveType;
        this.getNewWords().forEach(function (p) { return moveHistory.words.push(new literki.GameWord(p.word, p.x, p.y, p.direction, p.points)); });
        this.getCurrentPlayer().moves.push(moveHistory);
        this.nextPlayer();
    };
    GameRun_Server.prototype.nextPlayer = function () {
        this.pickLetters(this.state.currentPlayerIndex);
        this.state.currentPlayerIndex = this.getNextPlayerIndex();
    };
    return GameRun_Server;
})(literki.GameRun);
exports.GameRun_Server = GameRun_Server;
//# sourceMappingURL=literki_server.js.map