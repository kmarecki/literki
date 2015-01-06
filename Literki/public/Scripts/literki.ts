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

    export class BoardFields {
        private fields: Array<Array<BoardFieldBonus>>;

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
                this.fields[field.x][field.y] = bonus;
            });
        }

        getFieldBonus(x: number, y: number): BoardFieldBonus {
            return this.fields[x][y] != null ? this.fields[x][y] : BoardFieldBonus.None;
        }
    }

    export enum GameMoveDirection {
        Vertical,
        Horizontal
    }

    export class GameMove {
        word: string;
        x: number;
        y: number;
        direction: GameMoveDirection;
        points: number;
    }

    export class GamePlayer {

        playerName: string;
        freeLetters: Array<string>;
        moves: Array<GameMove>;

    }

    export class GameState {

        private players: Array<GamePlayer>;

        static newGame(players: Array<GamePlayer>): GameState {
            var game = new GameState();
            game.players = players.slice();
            return game;
        }

        private currentPlayerIndex: number = 0;
        getCurrentPlayer(): GamePlayer {
            return this.players[this.currentPlayerIndex];
        }



    }

    export class GameRun {

    }
}