///<reference path="..\typings\underscore\underscore.d.ts"/>

import _ = require('underscore');
import literki = require('./literki');

enum PlayerActionType {
    Move,
    MoveApproval,
    MoveCheck,
}

export class GameMethodResult {
    errorMessage: string;
    forceRefresh: boolean;

    constructor(errorMessage: string = null) {
        this.errorMessage = errorMessage;
    }

    static Undefined = new GameMethodResult();
}

export class GameRun_Server extends literki.GameRun {

    private UNATHORIZED_ACCESS = new GameMethodResult("Gracz jest nieuprawniony do wykonania operacji");

    newGame(players: Array<literki.GamePlayer>): void {
        this.state = new literki.GameState();
        this.state.gameId = 1;
        this.state.players = players.slice();
        this.state.remainingLetters = this.allLetters();
        this.state.players.forEach(p => this.pickLetters(this.state.players.indexOf(p)));
    }

    alive(): GameMethodResult {
        var now = new Date();
        if (this.isCurrentPlayer() && this.state.runState == literki.GameRunState.Running && this.state.playState == literki.GamePlayState.PlayerMove) {
            var remainingTime = this.getCurrentPlayer().remainingTime;
            if (remainingTime > 0) {
                var span = (now.getTime() - this.getCurrentPlayer().lastSeen.getTime());
                //Otherwise remaingTime can be zeroed after reconect after game is paused
                if (span < literki.CLIENT_TIMEOUT) {
                    remainingTime -= (span / 1000);
                    this.state.players[this.state.currentPlayerIndex].remainingTime = remainingTime;
                }
            }
        }
        this.getCurrentUser().lastSeen = now;
        return GameMethodResult.Undefined;
    }

    makeMove(move: literki.GameMove): GameMethodResult {
        if (this.isCurrentPlayer()) {
            move.freeLetters.forEach(fl => {
                this.putLetterOnBoard(fl.letter, fl.index, fl.x, fl.y);
                var playersFreeLetters = this.getCurrentPlayer().freeLetters;
                var index = playersFreeLetters.indexOf(fl.letter);
                playersFreeLetters.splice(index, 1);
            });
            this.updateStateAfterPlayerAction(move, PlayerActionType.Move);
            return GameMethodResult.Undefined;
        }
        return this.UNATHORIZED_ACCESS;
    }

    approveMove(approve: Boolean): GameMethodResult {
        var move = this.getActualMove();

        if (this.isNextPlayer()) {
            move.freeLetters.forEach(fl => {
                this.putLetterOnBoard(fl.letter, fl.index, fl.x, fl.y);
            });

            if (approve) {
                this.updateStateAfterPlayerAction(move, PlayerActionType.MoveApproval);
            } else {
                this.updateStateAfterPlayerAction(move, PlayerActionType.MoveCheck);
            }
            return GameMethodResult.Undefined;
        }
        return this.UNATHORIZED_ACCESS;
    }

    addPlayer(player: literki.IGamePlayer): boolean {
        if (this.state.runState == literki.GameRunState.Created) {
            var res = _.find(this.state.players, p => p.userId == player.userId);
            if (res == null) {
                this.state.players.push(player);
                this.pickLetters(this.state.players.length - 1);
                return true;
            }
        }
        return false;
    }

    join(): GameMethodResult {
        if (this.state.runState == literki.GameRunState.Created) {
            var res = _.find(this.state.players, p => p.userId == this.currentUserId);
            if (res == null) {
                var newPlayer = new literki.GamePlayer();
                newPlayer.userId = this.currentUserId;
                newPlayer.playerName = "Krzyś";
                newPlayer.remainingTime = 15 * 60;
                this.addPlayer(newPlayer);
            }
        }
        return GameMethodResult.Undefined;
    }

    start(): GameMethodResult {
        if (this.isGameOwner()) {

            if (this.state.players.length < 2) {
                return new GameMethodResult("Za mało graczy do rozpoczęcia gry");
            }
            if (this.state.runState == literki.GameRunState.Created || literki.GameRunState.Paused) {
                this.state.runState = literki.GameRunState.Running;
                this.state.playState = literki.GamePlayState.PlayerMove;
            } else {
                return new GameMethodResult("Nie można rozpocząć gry");
            }
            return GameMethodResult.Undefined;
        }
        return this.UNATHORIZED_ACCESS;
    }

    pause(): GameMethodResult {
        if (this.isGameOwner()) {
            if (this.state.runState == literki.GameRunState.Running) {
                this.state.runState = literki.GameRunState.Paused;
            } else {
                return new GameMethodResult("Nie można zatrzymać gry");
            }
            return GameMethodResult.Undefined;
        }
        return this.UNATHORIZED_ACCESS;
    }

    fold(): GameMethodResult {
        if (this.isCurrentPlayer()) {
            this.updateStateAfterMove(literki.MoveType.Fold);
            return GameMethodResult.Undefined;
        }
        return this.UNATHORIZED_ACCESS;
    }

    exchange(exchangeLetters: string[]): GameMethodResult {
        if (this.isCurrentPlayer()) {
            
            if (exchangeLetters == null || exchangeLetters.length == 0) {
                return new GameMethodResult("Nie ma żadnych literek do wymiany");
            }
            var freeLetters = this.getCurrentPlayer().freeLetters;
            exchangeLetters.forEach(letter => freeLetters = _.filter(freeLetters, l => l == letter));
            this.getCurrentPlayer().freeLetters = freeLetters;
            this.updateStateAfterMove(literki.MoveType.Exchange);
            return GameMethodResult.Undefined;
        }
        return this.UNATHORIZED_ACCESS;
    }

    private allLetters(): Array<string> {
        var letters = new Array<string>();
        for (var key in literki.LETTERS) {
            var letter = literki.LETTERS[key];
            for (var n = 0; n < letter.count; n++) {
                letters.push(key);
            }
        }   
        return letters;
    }

    private pickLetters(playerIndex: number): void {
        var player = this.state.players[playerIndex];
        var lettersToPick = literki.MAX_LETTERS - player.freeLetters.length;
        for (var n = 0; n < lettersToPick; n++) {
            var range = this.state.remainingLetters.length;
            var pickIndex = Math.floor((Math.random() * range));
            player.freeLetters.push(this.state.remainingLetters[pickIndex]);
            this.state.remainingLetters.splice(pickIndex, 1);
        }
    }

    private updateStateAfterPlayerAction(move: literki.GameMove, actionType: PlayerActionType): literki.IGameState {
        switch (actionType) {
            case PlayerActionType.Move: {
                this.state.currentMove = move;
                this.state.playState = literki.GamePlayState.MoveApproval;
                break;
            }
            case PlayerActionType.MoveApproval: {
                this.state.playState = literki.GamePlayState.PlayerMove;
                this.updateStateAfterMove(literki.MoveType.Move);
                this.state.currentMove = null;
                break;
            }
            case PlayerActionType.MoveCheck: {
                this.state.playState = literki.GamePlayState.PlayerMove;
                if (_.any(this.getNewWords(), w => !this.isValidWord(w.word))) {
                    //False Move
                    move.freeLetters.forEach(l => this.getCurrentPlayer().freeLetters.push(l.letter));
                    this.updateStateAfterMove(literki.MoveType.WrongMove);
                    this.state.currentMove = null;
                } else {
                    //Good Move
                    this.updateStateAfterMove(literki.MoveType.Move);
                    this.state.currentMove = null;
                    //Player must be skipped because the validation was correct
                    this.updateStateAfterMove(literki.MoveType.CheckMoveFailed);
                }
                break;
            }
        }
        return this.state;
    }

    private updateStateAfterMove(moveType: literki.MoveType): void {
        var moveHistory = new literki.GameMoveHistory();
        moveHistory.moveType = moveType;
        this.getNewWords().forEach(p => moveHistory.words.push(new literki.GameWord(p.word, p.x, p.y, p.direction, p.points)));
        this.getCurrentPlayer().moves.push(moveHistory);
        this.nextPlayer();
    }

    private isValidWord(word: string): boolean {
        //Dummy validation for tests
        return false;
    }

    private nextPlayer(): void {
        this.pickLetters(this.state.currentPlayerIndex);
        this.state.currentPlayerIndex = this.getNextPlayerIndex();
    }

}
