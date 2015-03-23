var Literki;
(function (Literki) {
    Literki.ROW_SIZE = 15;
    Literki.MAX_LETTERS = 7;
    var LetterDefinition = (function () {
        function LetterDefinition() {
        }
        return LetterDefinition;
    })();
    Literki.LetterDefinition = LetterDefinition;
    Literki.LETTERS = {
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
    (function (BoardFieldBonus) {
        BoardFieldBonus[BoardFieldBonus["None"] = 0] = "None";
        BoardFieldBonus[BoardFieldBonus["DoubleLetter"] = 1] = "DoubleLetter";
        BoardFieldBonus[BoardFieldBonus["TripleLetter"] = 2] = "TripleLetter";
        BoardFieldBonus[BoardFieldBonus["DoubleWord"] = 3] = "DoubleWord";
        BoardFieldBonus[BoardFieldBonus["TripleWord"] = 4] = "TripleWord";
        BoardFieldBonus[BoardFieldBonus["Start"] = 5] = "Start";
    })(Literki.BoardFieldBonus || (Literki.BoardFieldBonus = {}));
    var BoardFieldBonus = Literki.BoardFieldBonus;
    (function (GameMoveDirection) {
        GameMoveDirection[GameMoveDirection["Vertical"] = 0] = "Vertical";
        GameMoveDirection[GameMoveDirection["Horizontal"] = 1] = "Horizontal";
    })(Literki.GameMoveDirection || (Literki.GameMoveDirection = {}));
    var GameMoveDirection = Literki.GameMoveDirection;
    var BoardField = (function () {
        function BoardField() {
        }
        return BoardField;
    })();
    Literki.BoardField = BoardField;
    var BoardFields = (function () {
        function BoardFields() {
            this.fields = new Array(Literki.ROW_SIZE);
            for (var i = 0; i < Literki.ROW_SIZE; i++) {
                this.fields[i] = new Array(Literki.ROW_SIZE);
            }
            this.addFieldBonus([
                { x: 3, y: 0 },
                { x: 11, y: 0 },
                { x: 6, y: 2 },
                { x: 8, y: 2 },
                { x: 0, y: 3 },
                { x: 7, y: 3 },
                { x: 14, y: 3 },
                { x: 2, y: 6 },
                { x: 6, y: 6 },
                { x: 8, y: 6 },
                { x: 12, y: 6 },
                { x: 3, y: 7 },
                { x: 11, y: 7 },
                { x: 2, y: 8 },
                { x: 6, y: 8 },
                { x: 8, y: 8 },
                { x: 12, y: 8 },
                { x: 0, y: 11 },
                { x: 7, y: 11 },
                { x: 14, y: 11 },
                { x: 3, y: 14 },
                { x: 11, y: 14 },
                { x: 6, y: 12 },
                { x: 8, y: 12 }
            ], 1 /* DoubleLetter */);
            this.addFieldBonus([
                { x: 5, y: 1 },
                { x: 9, y: 1 },
                { x: 1, y: 5 },
                { x: 5, y: 5 },
                { x: 9, y: 5 },
                { x: 13, y: 5 },
                { x: 1, y: 9 },
                { x: 5, y: 9 },
                { x: 9, y: 9 },
                { x: 13, y: 9 },
                { x: 5, y: 13 },
                { x: 9, y: 13 },
            ], 2 /* TripleLetter */);
            this.addFieldBonus([
                { x: 1, y: 1 },
                { x: 13, y: 1 },
                { x: 2, y: 2 },
                { x: 12, y: 2 },
                { x: 3, y: 3 },
                { x: 11, y: 3 },
                { x: 4, y: 4 },
                { x: 10, y: 4 },
                { x: 4, y: 10 },
                { x: 10, y: 10 },
                { x: 3, y: 11 },
                { x: 11, y: 11 },
                { x: 2, y: 12 },
                { x: 12, y: 12 },
                { x: 1, y: 13 },
                { x: 13, y: 13 }
            ], 3 /* DoubleWord */);
            this.addFieldBonus([
                { x: 0, y: 0 },
                { x: 7, y: 0 },
                { x: 14, y: 0 },
                { x: 0, y: 7 },
                { x: 14, y: 7 },
                { x: 0, y: 14 },
                { x: 7, y: 14 },
                { x: 14, y: 14 }
            ], 4 /* TripleWord */);
            this.addFieldBonus([
                { x: 7, y: 7 }
            ], 5 /* Start */);
        }
        BoardFields.prototype.addFieldBonus = function (fields, bonus) {
            var _this = this;
            fields.forEach(function (field, index) {
                _this.createIfNotExists(field.x, field.y).fieldBonus = bonus;
            });
        };
        BoardFields.prototype.createIfNotExists = function (x, y) {
            return this.fields[x][y] != null ? this.fields[x][y] : (this.fields[x][y] = new BoardField());
        };
        BoardFields.prototype.getFieldBonus = function (x, y) {
            return this.fields[x][y] != null ? this.fields[x][y].fieldBonus : 0 /* None */;
        };
        BoardFields.prototype.getFieldValue = function (x, y) {
            return this.fields[x][y] != null ? this.fields[x][y].value : null;
        };
        BoardFields.prototype.setFieldValue = function (x, y, value) {
            var field = this.createIfNotExists(x, y);
            field.value = value;
        };
        BoardFields.prototype.addWord = function (word, x, y, direction) {
            for (var i = 0; i < word.length; i++) {
                var fieldX = x + (direction == 1 /* Horizontal */ ? i : 0);
                var fieldY = y + (direction == 0 /* Vertical */ ? i : 0);
                this.setFieldValue(fieldX, fieldY, word.charAt(i));
            }
        };
        return BoardFields;
    })();
    Literki.BoardFields = BoardFields;
    var GameWord = (function () {
        function GameWord(word, x, y, direction, points) {
            this.word = word;
            this.x = x;
            this.y = y;
            this.points = points;
            this.direction = direction;
        }
        GameWord.prototype.equals = function (word) {
            if (word == null) {
                return false;
            }
            var result = this.word == word.word && this.x == word.x && this.y == word.y && this.direction == word.direction;
            return result;
        };
        return GameWord;
    })();
    Literki.GameWord = GameWord;
    var GameMove = (function () {
        function GameMove() {
            this.words = [];
        }
        return GameMove;
    })();
    Literki.GameMove = GameMove;
    var GamePlayerJSON = (function () {
        function GamePlayerJSON() {
        }
        return GamePlayerJSON;
    })();
    Literki.GamePlayerJSON = GamePlayerJSON;
    var GamePlayer = (function () {
        function GamePlayer() {
            this.freeLetters = [];
            this.moves = [];
        }
        GamePlayer.prototype.getPoints = function () {
            var points = 0;
            this.moves.forEach(function (gm) { return gm.words.forEach(function (w) { return points += w.points; }); });
            return points;
        };
        GamePlayer.fromJSON = function (json) {
            var player = new GamePlayer();
            player.freeLetters = json.freeLetters;
            player.moves = json.moves;
            player.playerName = json.playerName;
            player.remainingTime = json.remainingTime;
            return player;
        };
        GamePlayer.prototype.toJSON = function () {
            var json = new GamePlayerJSON();
            json.freeLetters = this.freeLetters;
            json.moves = this.moves;
            json.playerName = this.playerName;
            json.remainingTime = this.remainingTime;
            return json;
        };
        return GamePlayer;
    })();
    Literki.GamePlayer = GamePlayer;
    var GameStateJSON = (function () {
        function GameStateJSON() {
        }
        return GameStateJSON;
    })();
    Literki.GameStateJSON = GameStateJSON;
    var GameState = (function () {
        function GameState() {
            this.currentPlayerIndex = 0;
        }
        GameState.fromJSON = function (json) {
            var state = new GameState();
            state.currentPlayerIndex = json.currentPlayerIndex;
            state.players = new Array();
            json.players.forEach(function (p) {
                var player = GamePlayer.fromJSON(p);
                state.players.push(player);
            });
            state.remainingLetters = new Array();
            state.remainingLetters.concat(json.remainingLetters);
            return state;
        };
        GameState.prototype.toJSON = function () {
            var json = new GameStateJSON();
            json.currentPlayerIndex = this.currentPlayerIndex;
            json.players = new Array();
            this.players.forEach(function (p) {
                var player = p.toJSON();
                json.players.push(player);
            });
            json.remainingLetters = new Array();
            json.remainingLetters.concat(this.remainingLetters);
            return json;
        };
        return GameState;
    })();
    Literki.GameState = GameState;
    var LetterPosition = (function () {
        function LetterPosition(letter, index) {
            this.letter = letter;
            this.index = index;
        }
        return LetterPosition;
    })();
    var FreeLetters = (function () {
        function FreeLetters() {
            this.freeLetters = [];
        }
        FreeLetters.prototype.getLetter = function (letter, index) {
            var letters = this.freeLetters.filter(function (pos) { return pos.letter == letter && pos.index == index; });
            return letters.length > 0 ? letters[0] : null;
        };
        FreeLetters.prototype.setLetter = function (letter, index, x, y) {
            var position = this.getLetter(letter, index);
            if (position == null) {
                position = new LetterPosition(letter, index);
                this.freeLetters.push(position);
            }
            position.x = x;
            position.y = y;
        };
        FreeLetters.prototype.getAllLetters = function () {
            return this.freeLetters;
        };
        FreeLetters.prototype.exists = function (x, y) {
            return this.freeLetters.filter(function (pos) { return pos.x == x && pos.y == y; }).length > 0;
        };
        return FreeLetters;
    })();
    var GameRun = (function () {
        function GameRun() {
            this.freeLetters = new FreeLetters();
        }
        GameRun.prototype.getPlayers = function () {
            return this.state.players;
        };
        GameRun.prototype.getCurrentPlayer = function () {
            return this.state.players[this.state.currentPlayerIndex];
        };
        GameRun.prototype.getState = function () {
            return this.state;
        };
        GameRun.prototype.runState = function (state) {
            this.state = state;
            this.renderState();
        };
        GameRun.prototype.renderState = function () {
            var _this = this;
            this.board = new BoardFields();
            this.state.players.forEach(function (player) { return player.moves.forEach(function (move) { return move.words.forEach(function (word) { return _this.board.addWord(word.word, word.x, word.y, word.direction); }); }); });
        };
        GameRun.prototype.putFreeLetter = function (letter, index, x, y) {
            var oldPosition = this.freeLetters.getLetter(letter, index);
            if (oldPosition != null) {
                this.board.setFieldValue(oldPosition.x, oldPosition.y, null);
            }
            this.board.setFieldValue(x, y, letter);
            this.freeLetters.setLetter(letter, index, x, y);
        };
        GameRun.prototype.getNewWords = function () {
            var _this = this;
            var words = [];
            this.freeLetters.getAllLetters().forEach(function (letter) {
                //check horizontal
                var word = "";
                var searchLetter;
                var x = letter.x;
                var y = letter.y;
                var xWord = letter.x - 1;
                var yWord = letter.y;
                while (x > 0) {
                    searchLetter = _this.board.getFieldValue(x, y);
                    if (searchLetter != null) {
                        word = searchLetter.concat(word);
                        xWord = x;
                        x--;
                    }
                    else
                        break;
                }
                //search right
                var x = letter.x + 1;
                while (x < Literki.ROW_SIZE) {
                    searchLetter = _this.board.getFieldValue(x, y);
                    if (searchLetter != null) {
                        word = word.concat(searchLetter);
                        x++;
                    }
                    else
                        break;
                }
                if (word.length > 1) {
                    gameWord = _this.createGameWord(word, xWord, y, 1 /* Horizontal */);
                    _this.addGameWord(words, gameWord);
                }
                //check vertical
                word = letter.letter;
                var x = letter.x;
                var y = letter.y - 1;
                while (y > 0) {
                    searchLetter = _this.board.getFieldValue(x, y);
                    if (searchLetter != null) {
                        word = searchLetter.concat(word);
                        yWord = y;
                        y--;
                    }
                    else
                        break;
                }
                //search down
                var y = letter.y + 1;
                while (y < Literki.ROW_SIZE) {
                    searchLetter = _this.board.getFieldValue(x, y);
                    if (searchLetter != null) {
                        word = word.concat(searchLetter);
                        y++;
                    }
                    else
                        break;
                }
                if (word.length > 1) {
                    var gameWord = _this.createGameWord(word, x, yWord, 0 /* Vertical */);
                    _this.addGameWord(words, gameWord);
                }
            });
            return words;
        };
        GameRun.prototype.createGameWord = function (word, x, y, direction) {
            var points = this.countPoints(x, y, word.length, direction);
            var gameWord = new GameWord(word, x, y, direction, points);
            return gameWord;
        };
        GameRun.prototype.addGameWord = function (words, word) {
            var equals = words.filter(function (w) { return w.equals(word); });
            if (words.filter(function (w) { return w.equals(word); }).length == 0) {
                words.push(word);
            }
        };
        GameRun.prototype.countPoints = function (x, y, length, direction) {
            var points = 0;
            var wordBonus = 1;
            for (var i = 0; i < length; i++) {
                var fieldx = x + (direction == 1 /* Horizontal */ ? i : 0);
                var fieldy = y + (direction == 0 /* Vertical */ ? i : 0);
                var letter = this.board.getFieldValue(fieldx, fieldy);
                var basePoints = Literki.LETTERS[letter].points;
                if (this.freeLetters.exists(fieldx, fieldy)) {
                    var bonus = this.board.getFieldBonus(fieldx, fieldy);
                    switch (bonus) {
                        case 1 /* DoubleLetter */:
                            basePoints *= 2;
                            break;
                        case 2 /* TripleLetter */:
                            basePoints *= 3;
                            break;
                        case 5 /* Start */:
                        case 3 /* DoubleWord */:
                            wordBonus *= 2;
                            break;
                        case 4 /* TripleWord */:
                            wordBonus *= 3;
                            break;
                    }
                }
                points += basePoints;
            }
            points *= wordBonus;
            return points;
        };
        return GameRun;
    })();
    Literki.GameRun = GameRun;
})(Literki || (Literki = {}));
//# sourceMappingURL=literki.js.map