﻿///<reference path="..\typings\underscore\underscore.d.ts"/>

import _ = require('underscore');
import literki = require('./literki');

export class GameRun_Server extends literki.GameRun {

    newGame(players: Array<literki.GamePlayer>): void {
        this.state = new literki.GameState();
        this.state.gameId = 1;
        this.state.players = players.slice();
        this.state.remainingLetters = this.allLetters();
        this.state.players.forEach(p => this.pickLetters(this.state.players.indexOf(p)));
    }

    makeMove(move: literki.GameMove): void {
        move.freeLetters.forEach(fl => {
            this.putLetterOnBoard(fl.letter, fl.index, fl.x, fl.y);
            var playersFreeLetters = this.getCurrentPlayer().freeLetters;
            var index = playersFreeLetters.indexOf(fl.letter);
            playersFreeLetters.splice(index, 1);
        });
        this.updateStateAfterMove(literki.MoveType.Move);
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

    join(): string {
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
        return null;
    }

    start(): string {
        if (!this.isGameOwner()) {
            return "Tylko założyciel gry może ją rozpocząć";
        }
        if (this.state.players.length < 2) {
            return "Za mało graczy do rozpoczęcia gry";
        }
        if (this.state.runState == literki.GameRunState.Created || literki.GameRunState.Paused) {
            this.state.runState = literki.GameRunState.Running;
        } else {
            return "Nie można rozpocząć gry";
        }
        return null;
    }

    pause(): string {
        if (!this.isGameOwner()) {
            return "Tylko założyciel gry może ją zatrzymać";
        }
        if (this.state.runState == literki.GameRunState.Running) {
            this.state.runState = literki.GameRunState.Paused;
        } else {
            return "Nie można zatrzymać gry";
        }
        return null;
    }

    fold(): string {
        if (this.isCurrentPlayer()) {
            this.updateStateAfterMove(literki.MoveType.Fold);
        }
        return null;
    }

    exchange(exchangeLetters: string[]): string {
        if (this.isCurrentPlayer()) {
            
            if (exchangeLetters == null || exchangeLetters.length == 0) {
                return "Nie ma żadnych literek do wymiany";
            }
            var freeLetters = this.getCurrentPlayer().freeLetters;
            exchangeLetters.forEach(letter => freeLetters = _.filter(freeLetters, l => l == letter));
            this.getCurrentPlayer().freeLetters = freeLetters;
            this.updateStateAfterMove(literki.MoveType.Exchange);
        }
        return null;
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

    private updateStateAfterMove(moveType: literki.MoveType): literki.IGameState {
        var move = new literki.GameMoveHistory();
        move.moveType = moveType;
        this.getNewWords().forEach(p => move.words.push(new literki.GameWord(p.word, p.x, p.y, p.direction, p.points)));
        this.getCurrentPlayer().moves.push(move);    
        this.pickLetters(this.state.currentPlayerIndex);
        this.state.currentPlayerIndex = (this.state.currentPlayerIndex + 1) % this.state.players.length;
        return this.state;
    }
}
