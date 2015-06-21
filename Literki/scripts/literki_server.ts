﻿import literki = require('./literki');

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
            this.putFreeLetter(fl.letter, fl.index, fl.x, fl.y);
            var playersFreeLetters = this.getCurrentPlayer().freeLetters;
            var index = playersFreeLetters.indexOf(fl.letter);
            playersFreeLetters.splice(index, 1);
        });
        this.updateState();
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

    private updateState(): literki.IGameState {
        var move = new literki.GameMoveHistory();
        this.getNewWords().forEach(p => move.words.push(new literki.GameWord(p.word, p.x, p.y, p.direction, p.points)));
        this.getCurrentPlayer().moves.push(move);    
        this.state.currentPlayerIndex = (this.state.currentPlayerIndex + 1) % this.state.players.length;

        return this.state;
    }
}