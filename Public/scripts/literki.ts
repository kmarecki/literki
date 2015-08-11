import _ = require('underscore');

export var ROW_SIZE = 15;
export var MAX_LETTERS = 7;

export class LetterDefinition {
    points: number;
    count: number;
}

export var LETTERS: { [letter: string]: LetterDefinition } = {
    "a": { points: 1, count: 9 },
    "e": { points: 1, count: 7 },
    "i": { points: 1, count: 8 },
    "n": { points: 1, count: 5 },
    "o": { points: 1, count: 6 },
    "r": { points: 1, count: 4 },
    "s": { points: 1, count: 4 },
    "w": { points: 1, count: 4 },
    "z": { points: 1, count: 5 },
    "c": { points: 2, count: 3 },
    "d": { points: 2, count: 3 },
    "k": { points: 2, count: 3 },
    "l": { points: 2, count: 3 },
    "m": { points: 2, count: 3 },
    "p": { points: 2, count: 3 },
    "t": { points: 2, count: 3 },
    "y": { points: 2, count: 4 },
    "b": { points: 3, count: 2 },
    "g": { points: 3, count: 2 },
    "h": { points: 3, count: 2 },
    "j": { points: 3, count: 2 },
    "ł": { points: 3, count: 2 },
    "u": { points: 3, count: 2 },
    "ą": { points: 5, count: 1 },
    "ę": { points: 5, count: 1 },
    "f": { points: 5, count: 1 },
    "ó": { points: 5, count: 1 },
    "ś": { points: 5, count: 1 },
    "ż": { points: 5, count: 1 },
    "ć": { points: 6, count: 1 },
    "ń": { points: 7, count: 1 },
    "ź": { points: 9, count: 1 },
};

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

export interface IGameWord {
    word: string;
    x: number;
    y: number;
    direction: GameMoveDirection;
    points: number;
}

export class GameWord implements IGameWord {
    word: string;
    x: number;
    y: number;
    direction: GameMoveDirection;
    points: number;

    constructor(word: string, x: number, y: number, direction: GameMoveDirection, points: number) {
        this.word = word;
        this.x = x;
        this.y = y;
        this.points = points;
        this.direction = direction;
    }

    equals(word: GameWord): boolean {
        if (word == null) {
            return false;
        }
        var result =
            this.word == word.word &&
            this.x == word.x &&
            this.y == word.y &&
            this.direction == word.direction;
        return result;
    }
}

export enum MoveType {
    Move,
    Fold,
    Exchange,
    WrongMove,
    CheckMoveFailed
}

export interface IGameMoveHistory {
    words: Array<IGameWord>;
    moveType: MoveType;
}

export class GameMoveHistory implements IGameMoveHistory {
    words: Array<IGameWord> = [];
    moveType: MoveType;
}

export interface IGamePlayer {
    userId: string; 
    playerName: string;
    freeLetters: Array<string>;
    remainingTime: number;
    lastSeen: Date;
    moves: Array<IGameMoveHistory>;
}

export class GamePlayer implements IGamePlayer {
    userId: string; 
    playerName: string;
    freeLetters: Array<string> = [];
    remainingTime: number;
    lastSeen: Date;
    moves: Array<IGameMoveHistory> = [];

    getPoints(): number {
        var points = 0;
        this.moves.forEach(gm => gm.words.forEach(w => points += w.points));
        return points;
    }

    static fromJSON(json: IGamePlayer): GamePlayer {
        var player = new GamePlayer();
        player.freeLetters = json.freeLetters;
        player.moves = json.moves;
        player.userId = json.userId;
        player.playerName = json.playerName;
        player.remainingTime = json.remainingTime;
        player.lastSeen = json.lastSeen;
        return player;
    }

    toJSON(): IGamePlayer {
        var json: IGamePlayer = {
            freeLetters: this.freeLetters,
            moves: this.moves,
            userId: this.userId,
            playerName: this.playerName,
            remainingTime: this.remainingTime,
            lastSeen : this.lastSeen
        }
        return json;
    }
}

export enum GameRunState {
   Created,
   Running,
   Paused,
   Finished
}

export enum GamePlayState {
    PlayerMove,
    MoveApproval
}

export interface IGameState {
    gameId: number;
    creationDate: Date;
    runState: GameRunState;
    playState: GamePlayState;
    players: Array<IGamePlayer>;
    currentPlayerIndex: number;
    remainingLetters: Array<string>;
    currentMove: GameMove;
}

export class GameState implements IGameState {
    gameId: number;
    creationDate: Date;
    runState: GameRunState;
    playState: GamePlayState;
    players: Array<GamePlayer>;
    currentPlayerIndex: number = 0;
    remainingLetters: Array<string>;
    currentMove: GameMove;

    static invalidState(): GameState {
        var state = new GameState();
        state.gameId = -1;
        state.players = new Array<GamePlayer>();
        state.remainingLetters = new Array<string>();
        return state;
    }

    static fromJSON(json: IGameState): GameState {
        var state = new GameState();
        state.gameId = json.gameId;
        state.creationDate = json.creationDate;
        state.runState = json.runState;
        state.playState = json.playState;
        state.currentPlayerIndex = json.currentPlayerIndex;
        state.players = new Array<GamePlayer>();
        json.players.forEach(p => {
            var player = GamePlayer.fromJSON(p);
            state.players.push(player);
        });
        state.remainingLetters = new Array<string>();
        state.remainingLetters.concat(json.remainingLetters);
        state.currentMove = json.currentMove;

        return state;
    }

    toJSON(): IGameState {
        var json: IGameState = {
            gameId: this.gameId,
            creationDate: this.creationDate,
            runState: this.runState,
            playState: this.playState,
            currentPlayerIndex: this.currentPlayerIndex,
            players: new Array<IGamePlayer>(),
            remainingLetters: new Array<string>(),
            currentMove: this.currentMove
        }

        this.players.forEach(p => {
            var player = p.toJSON();
            json.players.push(player);
        });
        json.remainingLetters.concat(this.remainingLetters)

        return json;
    }
}

export enum LetterPositionType {
    BoardField,
    ExchangeLetter,
    FreeLetter
}

export class LetterPosition {
    letter: string
    index: number
    x: number;
    y: number;
    positionType: LetterPositionType;

    constructor(letter: string, index: number) {
        this.letter = letter;
        this.index = index;
    }
}

export class FreeLetters {
    private freeLetters: Array<LetterPosition> = [];

    getLetter(letter: string, index: number): LetterPosition {
        var letters = this.freeLetters.filter(pos => pos.letter == letter && pos.index == index);
        return letters.length > 0 ? letters[0] : null;
    }

    setLetter(letter: string, index: number, x: number, y: number, positionType: LetterPositionType): void {
        var position = this.getLetter(letter, index);
        if (position == null) {
            position = new LetterPosition(letter, index);
            this.freeLetters.push(position);
        }
        position.x = x;
        position.y = y;
        position.positionType = positionType;
    }

    getAllLetters(positionType: LetterPositionType = LetterPositionType.BoardField): Array<LetterPosition> {
        return this.freeLetters.filter(letter => letter.positionType == positionType);
    }

    removeLetter(letter: string, index: number): void {
        this.freeLetters = this.freeLetters.filter(pos => pos.letter != letter || pos.index != index);
    }

    exists(x: number, y: number): boolean {
        return this.freeLetters.filter(pos => pos.x == x && pos.y == y).length > 0;
    }

    clear(): void {
        this.freeLetters = [];
    }
}

export class GameRun {

    board: BoardFields;

    protected state: IGameState;
    protected freeLetters = new FreeLetters();
    currentUserId: string;

    constructor(userId: string) {
        this.currentUserId = userId;
    }

    getPlayers(): Array<IGamePlayer> {
        return this.state.players;
    }

    getCurrentPlayer(): IGamePlayer {
        return this.state.players[this.state.currentPlayerIndex];
    }

    getNextPlayer(): IGamePlayer {
        var nextPlayerIndex = this.getNextPlayerIndex();
        return this.state.players[nextPlayerIndex];
    }

    protected getNextPlayerIndex(): number {
        return (this.state.currentPlayerIndex + 1) % this.state.players.length;
    }
        

    getCurrentUser(): IGamePlayer {
        return _.find(this.state.players, p => p.userId == this.currentUserId);
    }

    getState(): IGameState {
        return this.state;
    }

    runState(state: IGameState): void {
        this.state = state;
        this.renderState();
    }

    isUndefinedGame(): boolean {
        return this.state.gameId == -1;
    }

    isGameOwner(): boolean {
        var gameOwner = this.state.players[0];
        return gameOwner.userId == this.currentUserId;
    }

    isCurrentPlayer(): boolean {
        return this.getCurrentPlayer().userId == this.currentUserId;
    }

    isNextPlayer(): boolean {
        return this.getNextPlayer().userId == this.currentUserId;
    }

    private renderState(): void {
        this.board = new BoardFields();
        this.freeLetters.clear();
        this.state.players.forEach(
            player => player.moves.forEach(
                move => move.words.forEach(
                    word => this.board.addWord(word.word, word.x, word.y, word.direction))));
    }


    putLetterOnBoard(letter: string, index: number, x: number, y: number): void {
        this.cleanLetterOnBoard(letter, index);
        this.board.setFieldValue(x, y, letter);
        this.freeLetters.setLetter(letter, index, x, y, LetterPositionType.BoardField);
    }

    addLetterToExchange(letter: string, index: number): void {
        this.cleanLetterOnBoard(letter, index);
        this.freeLetters.setLetter(letter, index, -1, -1, LetterPositionType.ExchangeLetter);
    }

    removeLetter(letter: string, index: number): void {
        this.cleanLetterOnBoard(letter, index);
        this.freeLetters.removeLetter(letter, index);
    }

    private cleanLetterOnBoard(letter: string, index: number): void {
        var oldPosition = this.freeLetters.getLetter(letter, index);
        if (oldPosition != null && oldPosition.positionType == LetterPositionType.BoardField) {
            this.board.setFieldValue(oldPosition.x, oldPosition.y, null);
        }
    }

    getExchangeLetters(): string[] {
        return this.freeLetters.getAllLetters(LetterPositionType.ExchangeLetter).map(pos => pos.letter);
    }

    getNewWords(): GameWord[] {
        var words: GameWord[] = [];
        this.freeLetters.getAllLetters().forEach(letter => {

            //check horizontal
            var word = "";
            var searchLetter;
            var x = letter.x;
            var y = letter.y;
            var xWord = letter.x - 1;
            var yWord = letter.y;
            //search left
            while (x > 0) {
                searchLetter = this.board.getFieldValue(x, y);
                if (searchLetter != null) {
                    word = searchLetter.concat(word);
                    xWord = x;
                    x--;
                } else break;
            } 
                
            //search right
            var x = letter.x + 1;
            while (x < ROW_SIZE) {
                searchLetter = this.board.getFieldValue(x, y);
                if (searchLetter != null) {
                    word = word.concat(searchLetter);
                    x++;
                } else break;
            }
            if (word.length > 1) {
                gameWord = this.createGameWord(word, xWord, y, GameMoveDirection.Horizontal);
                this.addGameWord(words, gameWord);
            }

            //check vertical
            word = letter.letter;
            var x = letter.x;
            var y = letter.y - 1;
            //search up
            while (y > 0) {
                searchLetter = this.board.getFieldValue(x, y);
                if (searchLetter != null) {
                    word = searchLetter.concat(word);
                    yWord = y;
                    y--;
                } else break;
            } 
            //search down
            var y = letter.y + 1;
            while (y < ROW_SIZE) {
                searchLetter = this.board.getFieldValue(x, y);
                if (searchLetter != null) {
                    word = word.concat(searchLetter);
                    y++;
                } else break;
            }
            if (word.length > 1) {
                var gameWord = this.createGameWord(word, x, yWord, GameMoveDirection.Vertical);
                this.addGameWord(words, gameWord);
            }
        });
        return words;
    }

    public getActualMove(): GameMove {
        var freeLetters = this.freeLetters.getAllLetters();
        if (this.state.currentMove) {
            freeLetters = freeLetters.concat(this.state.currentMove.freeLetters);
        }
        return { gameId: this.state.gameId, freeLetters: freeLetters };
    }

    public canApproveMove(): boolean {
        return (
            this.isNextPlayer() &&
            this.state.runState == GameRunState.Running &&
            this.state.playState == GamePlayState.MoveApproval
        );
    }

    public isWaitingForMoveApproval(): boolean {
        return (
            this.isCurrentPlayer() &&
            this.state.runState == GameRunState.Running &&
            this.state.playState == GamePlayState.MoveApproval
        );
    }


    private createGameWord(word: string, x: number, y: number, direction: GameMoveDirection): GameWord {
        var points = this.countPoints(x, y, word.length, direction);
        var gameWord = new GameWord(word, x, y, direction, points);
        return gameWord;
    }

    private addGameWord(words: GameWord[], word: GameWord): void {
        var equals = words.filter(w => w.equals(word));
        if (words.filter(w => w.equals(word)).length == 0) {
            words.push(word);
        }
    }

    private countPoints(x: number, y: number, length: number, direction: GameMoveDirection): number {
        var points = 0;
        var wordBonus = 1;

        for (var i = 0; i < length; i++) {
            var fieldx = x + (direction == GameMoveDirection.Horizontal ? i : 0);
            var fieldy = y + (direction == GameMoveDirection.Vertical ? i : 0);
            var letter = this.board.getFieldValue(fieldx, fieldy);
            var basePoints = LETTERS[letter].points;
            if (this.freeLetters.exists(fieldx, fieldy)) {
                var bonus = this.board.getFieldBonus(fieldx, fieldy);
                switch (bonus) {
                    case BoardFieldBonus.DoubleLetter: basePoints *= 2; break;
                    case BoardFieldBonus.TripleLetter: basePoints *= 3; break;
                    case BoardFieldBonus.Start:
                    case BoardFieldBonus.DoubleWord: wordBonus *= 2; break;
                    case BoardFieldBonus.TripleWord: wordBonus *= 3; break;
                }
            }
            points += basePoints;
        }
        points *= wordBonus;
        return points;
    }
}

export class GameMove {
    gameId: number;
    freeLetters: Array<LetterPosition>;
}
