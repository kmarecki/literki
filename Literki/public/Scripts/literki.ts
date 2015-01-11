module Literki {

    export var ROW_SIZE = 15;
    export var MAX_LETTERS = 7;

    export enum BoardFieldBonus {
        None,
        DoubleLetter,
        TripleLetter,
        DoubleWord,
        TripleWord,
        Start
    }

    export enum GameMoveDirection {
        Vertical,
        Horizontal
    }

    export class BoardField {

        fieldBonus: BoardFieldBonus;
        value: string;
    }

    interface BoardFieldPosition {
        x: number;
        y: number;
    }

    export class BoardFields {
        private fields: Array<Array<BoardField>>;

        constructor() {
            this.fields = new Array(ROW_SIZE);
            for (var i = 0; i < ROW_SIZE; i++) {
                this.fields[i] = new Array(ROW_SIZE);
            }

            this.addFieldBonus([
                { x: 3, y: 0 }, { x: 11, y: 0 }, { x: 6, y: 2 }, { x: 8, y: 2 },
                { x: 0, y: 3 }, { x: 7, y: 3 }, { x: 14, y: 3 },
                { x: 2, y: 6 }, { x: 6, y: 6 }, { x: 8, y: 6 }, { x: 12, y: 6 },
                { x: 3, y: 7 }, { x: 11, y: 7 },
                { x: 2, y: 8 }, { x: 6, y: 8 }, { x: 8, y: 8 }, { x: 12, y: 8 },
                { x: 0, y: 11 }, { x: 7, y: 11 }, { x: 14, y: 11 },
                { x: 3, y: 14 }, { x: 11, y: 14 }, { x: 6, y: 12 }, { x: 8, y: 12 }
            ], BoardFieldBonus.DoubleLetter);
            this.addFieldBonus([
                { x: 5, y: 1 }, { x: 9, y: 1 },
                { x: 1, y: 5 }, { x: 5, y: 5 }, { x: 9, y: 5 }, { x: 13, y: 5 },
                { x: 1, y: 9 }, { x: 5, y: 9 }, { x: 9, y: 9 }, { x: 13, y: 9 },
                { x: 5, y: 13 }, { x: 9, y: 13 },
            ], BoardFieldBonus.TripleLetter);
            this.addFieldBonus([
                { x: 1, y: 1 }, { x: 13, y: 1 }, { x: 2, y: 2 }, { x: 12, y: 2 },
                { x: 3, y: 3 }, { x: 11, y: 3 }, { x: 4, y: 4 }, { x: 10, y: 4 },
                { x: 4, y: 10 }, { x: 10, y: 10 }, { x: 3, y: 11 }, { x: 11, y: 11 },
                { x: 2, y: 12 }, { x: 12, y: 12 }, { x: 1, y: 13 }, { x: 13, y: 13 }
            ], BoardFieldBonus.DoubleWord);
            this.addFieldBonus([
                { x: 0, y: 0 }, { x: 7, y: 0 }, { x: 14, y: 0 },
                { x: 0, y: 7 }, { x: 14, y: 7 },
                { x: 0, y: 14 }, { x: 7, y: 14 }, { x: 14, y: 14 }
            ], BoardFieldBonus.TripleWord);
            this.addFieldBonus([
                { x: 7, y: 7 }
            ], BoardFieldBonus.Start);
        }

        private addFieldBonus(fields: Array<{ x: number; y: number; }>, bonus: BoardFieldBonus): void {
            fields.forEach((field, index) => {
                this.createIfNotExists(field.x, field.y).fieldBonus = bonus;
            });
        }

        private createIfNotExists(x: number, y: number): BoardField {
            return this.fields[x][y] != null ? this.fields[x][y] : (this.fields[x][y] = new BoardField());
        }

        getFieldBonus(x: number, y: number): BoardFieldBonus {
            return this.fields[x][y] != null ? this.fields[x][y].fieldBonus : BoardFieldBonus.None;
        }

        getFieldValue(x: number, y: number): string {
            return this.fields[x][y] != null ? this.fields[x][y].value : null;
        }

        setFieldValue(x: number, y: number, value: string): void {
            var field = this.createIfNotExists(x, y);
            field.value = value;
        }

        addWord(word: string, x: number, y: number, direction: GameMoveDirection): void {
            for (var i = 0; i < word.length; i++) {
                var fieldX = x + (direction == GameMoveDirection.Horizontal ? i : 0);
                var fieldY = y + (direction == GameMoveDirection.Vertical ? i : 0);
                this.setFieldValue(fieldX, fieldY, word.charAt(i));
            }
        }
    }

    export class GameMoveWord {
        word: string;
        x: number;
        y: number;
        direction: GameMoveDirection;
        points: number;
    }

    export class GameMove {
        words: Array<GameMoveWord> = [];
    }

    export class GamePlayer {

        playerName: string;
        freeLetters: Array<string>;
        moves: Array<GameMove> = [];
    }

    export class GameState {
        players: Array<GamePlayer>;
        currentPlayerIndex: number = 0;
    }

    export class GameRun {

        board: BoardFields;

        private state: GameState;
        private freeLetters: { [letter: string]: BoardFieldPosition; } = {};

        static newGame(players: Array<GamePlayer>): GameState {
            var game = new GameState();
            game.players = players.slice();
            return game;
        }

        getCurrentPlayer(): GamePlayer {
            return this.state.players[this.state.currentPlayerIndex];
        }

        runState(state: GameState) {
            this.state = state;
            this.renderState();
        }

        private renderState(): void {
            this.board = new BoardFields();
            this.state.players.forEach(
                player => player.moves.forEach(
                    move => move.words.forEach(
                    word => this.board.addWord(word.word, word.x, word.y, word.direction))));
        }


        putFreeLetter(letter: string, x: number, y: number): void {
            if (this.freeLetters[letter] != null) {
                var oldPosition = this.freeLetters[letter];
                this.board.setFieldValue(oldPosition.x, oldPosition.y, null);
            }
            this.board.setFieldValue(x, y, letter);
            this.freeLetters[letter] = { x: x, y: y };
        }

        getNewWords(): GameMoveWord[] {
            var words: GameMoveWord[] = [];
            this.getCurrentPlayer().freeLetters.forEach(letter => {
                if (this.freeLetters[letter] != null) {

                    //check horizontal
                    var word = letter;
                    var searchLetter;
                    var x = this.freeLetters[letter].x;
                    var y = this.freeLetters[letter].y;
                    //search left
                    do {
                        x--;
                        searchLetter = this.board.getFieldValue(x, y);
                        if (searchLetter != null) {
                            word = searchLetter.concat(word);
                        }
                    } while (x > 0 && searchLetter != null);
                    //search right
                    var x = this.freeLetters[letter].x;
                    do {
                        x++;
                        searchLetter = this.board.getFieldValue(x, y);
                        if (searchLetter != null) {
                            word = word.concat(searchLetter);
                        }
                    } while (x < FIELD_SIZE && searchLetter != null);
                    if (word.length > 1) {
                        var gameWord = new GameMoveWord();
                        gameWord.word = word;
                        gameWord.points = 10;
                        gameWord.x = x;
                        gameWord.y = y;
                        gameWord.direction = GameMoveDirection.Horizontal;
                        words.push(gameWord);
                    }

                    //check vertical
                    word = letter;
                    var x = this.freeLetters[letter].x;
                    var y = this.freeLetters[letter].y;
                    //search up
                    do {
                        y--;
                        searchLetter = this.board.getFieldValue(x, y);
                        if (searchLetter != null) {
                            word = searchLetter.concat(word);
                        }
                    } while (y > 0 && searchLetter != null);
                    //search down
                    var y = this.freeLetters[letter].y;
                    do {
                        y++;
                        searchLetter = this.board.getFieldValue(x, y);
                        if (searchLetter != null) {
                            word = word.concat(searchLetter);
                        }
                    } while (y < FIELD_SIZE && searchLetter != null);
                    if (word.length > 1) {
                        var gameWord = new GameMoveWord();
                        gameWord.word = word;
                        gameWord.points = 7;
                        gameWord.x = x;
                        gameWord.y = y;
                        gameWord.direction = GameMoveDirection.Vertical;
                        words.push(gameWord);
                    }
                }
            });
            return words;
        }
    }
}