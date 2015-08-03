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
var GameRun_Server = (function (_super) {
    __extends(GameRun_Server, _super);
    function GameRun_Server() {
        _super.apply(this, arguments);
        this.UNATHORIZED_ACCESS = "Gracz jest nieuprawniony do wykonania operacji";
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
        if (this.isCurrentPlayer()) {
            move.freeLetters.forEach(function (fl) {
                _this.putLetterOnBoard(fl.letter, fl.index, fl.x, fl.y);
                var playersFreeLetters = _this.getCurrentPlayer().freeLetters;
                var index = playersFreeLetters.indexOf(fl.letter);
                playersFreeLetters.splice(index, 1);
            });
            this.updateStateAfterPlayerAction(move, PlayerActionType.Move);
            return null;
        }
        return this.UNATHORIZED_ACCESS;
    };
    GameRun_Server.prototype.approveMove = function (approve) {
        if (this.isNextPlayer()) {
            if (approve) {
                this.updateStateAfterPlayerAction(this.getActualMove(), PlayerActionType.MoveApproval);
            }
            else {
                this.updateStateAfterPlayerAction(this.getActualMove(), PlayerActionType.MoveCheck);
            }
            return null;
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
        return null;
    };
    GameRun_Server.prototype.start = function () {
        if (this.isGameOwner()) {
            if (this.state.players.length < 2) {
                return "Za mało graczy do rozpoczęcia gry";
            }
            if (this.state.runState == literki.GameRunState.Created || literki.GameRunState.Paused) {
                this.state.runState = literki.GameRunState.Running;
                this.state.playState = literki.GamePlayState.PlayerMove;
            }
            else {
                return "Nie można rozpocząć gry";
            }
            return null;
        }
        return this.UNATHORIZED_ACCESS;
    };
    GameRun_Server.prototype.pause = function () {
        if (this.isGameOwner()) {
            if (this.state.runState == literki.GameRunState.Running) {
                this.state.runState = literki.GameRunState.Paused;
            }
            else {
                return "Nie można zatrzymać gry";
            }
            return null;
        }
        return this.UNATHORIZED_ACCESS;
    };
    GameRun_Server.prototype.fold = function () {
        if (this.isCurrentPlayer()) {
            this.updateStateAfterMove(literki.MoveType.Fold);
            return null;
        }
        return this.UNATHORIZED_ACCESS;
    };
    GameRun_Server.prototype.exchange = function (exchangeLetters) {
        if (this.isCurrentPlayer()) {
            if (exchangeLetters == null || exchangeLetters.length == 0) {
                return "Nie ma żadnych literek do wymiany";
            }
            var freeLetters = this.getCurrentPlayer().freeLetters;
            exchangeLetters.forEach(function (letter) { return freeLetters = _.filter(freeLetters, function (l) { return l == letter; }); });
            this.getCurrentPlayer().freeLetters = freeLetters;
            this.updateStateAfterMove(literki.MoveType.Exchange);
            return null;
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
    GameRun_Server.prototype.updateStateAfterPlayerAction = function (move, actionType) {
        var _this = this;
        switch (actionType) {
            case PlayerActionType.Move: {
                this.state.currentMove = move;
                this.state.playState = literki.GamePlayState.MoveApproval;
                break;
            }
            case PlayerActionType.MoveApproval: {
                this.state.currentMove = null;
                this.state.playState = literki.GamePlayState.PlayerMove;
                this.updateStateAfterMove(literki.MoveType.Move);
                break;
            }
            case PlayerActionType.MoveCheck: {
                this.state.currentMove = null;
                this.state.playState = literki.GamePlayState.PlayerMove;
                if (_.any(this.getNewWords(), function (w) { return !_this.isValidWord(w.word); })) {
                    //False Move
                    move.freeLetters.forEach(function (l) { return _this.getCurrentPlayer().freeLetters.push(l.letter); });
                    this.updateStateAfterMove(literki.MoveType.WrongMove);
                }
                else {
                    //Good Move
                    this.updateStateAfterMove(literki.MoveType.Move);
                    //Player must be skipped because the validation was correct
                    this.nextPlayer();
                }
                break;
            }
        }
        return this.state;
    };
    GameRun_Server.prototype.updateStateAfterMove = function (moveType) {
        var moveHistory = new literki.GameMoveHistory();
        moveHistory.moveType = moveType;
        this.getNewWords().forEach(function (p) { return moveHistory.words.push(new literki.GameWord(p.word, p.x, p.y, p.direction, p.points)); });
        this.getCurrentPlayer().moves.push(moveHistory);
        this.nextPlayer();
    };
    GameRun_Server.prototype.isValidWord = function (word) {
        //Dummy validation for tests
        return true;
    };
    GameRun_Server.prototype.nextPlayer = function () {
        this.pickLetters(this.state.currentPlayerIndex);
        this.state.currentPlayerIndex = this.getNextPlayerIndex();
    };
    return GameRun_Server;
})(literki.GameRun);
exports.GameRun_Server = GameRun_Server;
//# sourceMappingURL=literki_server.js.map