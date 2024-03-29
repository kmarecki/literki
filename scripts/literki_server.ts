﻿///<reference path="../typings/main.d.ts"/>

import _ = require('underscore');
import literki = require('./shared/literki');

enum PlayerActionType {
    Move,
    MoveApproval,
    MoveCheck,
}

export class GameMethodResult {
    errorMessage: string;
    forceRefresh: boolean;

    constructor(errorMessage?: string, forceRefresh?: boolean) {
        this.errorMessage = errorMessage;
    }

    static Undefined = new GameMethodResult();
}

export class GameRun_Server extends literki.GameRun {

    private UNATHORIZED_ACCESS = new GameMethodResult("Gracz jest nieuprawniony do wykonania operacji");
    private PLACEHOLDER_PLAYER_ID = "51bb793aca2ab77a3200000d";

    newGame(userId: string, playerName: string, playersCount: number, timeLimit: number): void {

        var player = new literki.GamePlayer();
        player.userId = userId;
        player.playerName = playerName;
        player.remainingTime = timeLimit * 60;

        var players = new Array<literki.GamePlayer>();
        players.push(player);
      
        this.state = new literki.GameState();
        this.state.gameId = 1;
        this.state.players = players;
        this.state.remainingLetters = this.allLetters();
        this.state.players.forEach(p => this.pickLetters(this.state.players.indexOf(p)));

        while (--playersCount > 0) {
            var placeholderPlayer = new literki.GamePlayer();
            placeholderPlayer.userId = this.PLACEHOLDER_PLAYER_ID;
            placeholderPlayer.playerName = "?";
            placeholderPlayer.remainingTime = 60;
            placeholderPlayer.isPlaceholder = true;
            players.push(placeholderPlayer);
        } 
    }

    alive(): GameMethodResult {
        if (this.getCurrentUser()) {
            var now = new Date();
            if (this.checkGame()) {
                if (this.isCurrentPlayer() &&
                    this.state.runState == literki.GameRunState.Running &&
                    this.state.playState == literki.GamePlayState.PlayerMove &&
                    _.every(this.state.players, player => (<literki.GamePlayer>player).isAlive())) {
                    var remainingTime = this.getCurrentPlayer().remainingTime;
                    if (remainingTime > 0) {
                        var span = (now.getTime() - this.getCurrentPlayer().lastSeen.getTime());
                        //Otherwise remainingTime can be zeroed after reconect after game is paused
                        if (span < literki.CLIENT_TIMEOUT) {
                            remainingTime -= (span / 1000);
                            if (remainingTime < 0) {
                                remainingTime = 0;
                            }
                            this.getCurrentPlayer().remainingTime = remainingTime;
                            this.checkCurrentPlayer();
                        }
                    }
                }
            }
            this.getCurrentUser().lastSeen = now;
        }
        return GameMethodResult.Undefined;
    }

    private checkGame(): boolean {
        if (this.state.runState != literki.GameRunState.Finished) {
            if (this.noMoreActivePlayers()) {
                this.endGame();
                return false;
            }
            return true
        }
        return false;
    }

    private noMoreActivePlayers(): boolean {
        return (_.all(this.state.players, p => p.remainingTime < 0) ||
                _.all(this.state.players, p => p.moves.length > 0 && p.moves[p.moves.length - 1].moveType == literki.MoveType.Fold));
    }

    private endGame(): void {
        this.state.runState = literki.GameRunState.Finished;
        this.state.playState = literki.GamePlayState.None;
    }

    private checkCurrentPlayer(): void {
        if (this.getCurrentPlayer().remainingTime <= 0 && !this.noMoreActivePlayers()) {
            this.updateStateAfterMove(literki.MoveType.SkipNoTimeLeft);
        }
    }

    makeMove(move: literki.GameMove): GameMethodResult {
        if (this.isCurrentPlayer()) {
            var result = GameMethodResult.Undefined;
            move.freeLetters.forEach(field => {
                this.putLetterOnBoard(field.letter, field.index, field.x, field.y);
                var playersFreeLetters = this.getCurrentPlayer().freeLetters;
                var index = playersFreeLetters.indexOf(field.letter);
                playersFreeLetters.splice(index, 1);
            });

            move.freeLetters.forEach(field => {
                if (!this.isFieldValid(field.x, field.y)) {
                    result = new GameMethodResult("Niedozwolony ruch");
                }
            });

            if (!this.isBoardValid()) {
                result = new GameMethodResult("Niedozwolony ruch");
            } else {
                this.updateStateAfterPlayerAction(move, PlayerActionType.Move);
            }
            return result;
        }
        return this.UNATHORIZED_ACCESS;
    }

    approveMove(approve: boolean, existsWords?: boolean): GameMethodResult {
        var move = this.getActualMove();
        if (this.isNextPlayer()) {
            if (approve) {
                this.updateStateAfterPlayerAction(move, PlayerActionType.MoveApproval);
            } else {
                this.updateStateAfterPlayerAction(move, PlayerActionType.MoveCheck, { existsWords: existsWords });
            }
            return GameMethodResult.Undefined;
        }
        return this.UNATHORIZED_ACCESS;
    }

    addPlayer(player: literki.IGamePlayer): boolean {
        if (this.state.runState == literki.GameRunState.Created) {
            var res = _.find(this.state.players, p => p.userId == player.userId);
            if (res == null) {
                var placeholderIndex = this.getFirstPlaceHolderIndex();
                this.state.players[placeholderIndex] = player;
                this.pickLetters(placeholderIndex);
                return true;
            }
        }
        return false;
    }

    private getFirstPlaceHolderIndex(): number {
        return _.findIndex(this.state.players, player => player.isPlaceholder);
    }

    join(playerName: string): GameMethodResult {
        if (this.state.runState == literki.GameRunState.Created) {
            var res = _.find(this.state.players, p => p.userId == this.currentUserId);
            if (res == null) {
                var newPlayer = new literki.GamePlayer();
                newPlayer.userId = this.currentUserId;
                newPlayer.playerName = playerName;
                newPlayer.remainingTime = this.state.players[0].remainingTime;
                this.addPlayer(newPlayer);
            }
        }
        return GameMethodResult.Undefined;
    }

    start(): GameMethodResult {
        if (this.isGameOwner()) {

            if (this.getPlayersInGame().length < this.state.players.length) {
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

    private updateStateAfterPlayerAction(move: literki.GameMove, actionType: PlayerActionType, options?: { existsWords?: boolean }): literki.IGameState {
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
                    move.freeLetters.forEach(l => this.getCurrentPlayer().freeLetters.push(l.letter));
                    this.clearMove();
                    this.updateStateAfterMove(literki.MoveType.WrongMove);
                } else {
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
    }

    private clearMove(): void {
        this.state.currentMove = null;
        this.freeLetters.clear();
    }

    private updateStateAfterMove(moveType: literki.MoveType): void {
        var moveHistory = new literki.GameMoveHistory();
        moveHistory.moveType = moveType;
        this.getNewWords().forEach(p => moveHistory.words.push(new literki.GameWord(p.word, p.x, p.y, p.direction, p.points)));
        this.getCurrentPlayer().moves.push(moveHistory);
        if (this.checkGame()) {
            this.nextPlayer();
            this.checkCurrentPlayer();
        }
    }

    private nextPlayer(): void {
        this.pickLetters(this.state.currentPlayerIndex);
        this.state.currentPlayerIndex = this.getNextPlayerIndex();
    }

}
