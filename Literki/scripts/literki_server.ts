import literki = require('./literki');

export class GameRun_Server extends literki.GameRun {
    
    public newGame(players: Array<literki.GamePlayer>): void {
        this.state = new literki.GameState();
        this.state.players = players.slice();
        this.state.remainingLetters = this.allLetters();
        this.state.players.forEach(p => this.pickLetters(this.state.players.indexOf(p)));
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
}
