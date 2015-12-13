/// <reference path="..\typings\underscore\underscore.d.ts"/>
var _ = require('underscore');
exports.ROW_SIZE = 15;
exports.ROW_CENTER = 7;
exports.MAX_LETTERS = 7;
exports.CLIENT_TIMEOUT = 5000;
var LetterDefinition = (function () {
    function LetterDefinition() {
    }
    return LetterDefinition;
})();
exports.LetterDefinition = LetterDefinition;
exports.LETTERS = {
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
})(exports.BoardFieldBonus || (exports.BoardFieldBonus = {}));
var BoardFieldBonus = exports.BoardFieldBonus;
(function (GameMoveDirection) {
    GameMoveDirection[GameMoveDirection["Vertical"] = 0] = "Vertical";
    GameMoveDirection[GameMoveDirection["Horizontal"] = 1] = "Horizontal";
})(exports.GameMoveDirection || (exports.GameMoveDirection = {}));
var GameMoveDirection = exports.GameMoveDirection;
var BoardField = (function () {
    function BoardField() {
    }
    return BoardField;
})();
exports.BoardField = BoardField;
var BoardFields = (function () {
    function BoardFields() {
        this.fields = new Array(exports.ROW_SIZE);
        for (var i = 0; i < exports.ROW_SIZE; i++) {
            this.fields[i] = new Array(exports.ROW_SIZE);
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
    BoardFields.prototype.addFieldBonus = function (fields, bonus) {
        var _this = this;
        fields.forEach(function (field, index) {
            _this.createIfNotExists(field.x, field.y).fieldBonus = bonus;
        });
    };
    BoardFields.prototype.createIfNotExists = function (x, y) {
        return this.fields[x][y] ? this.fields[x][y] : (this.fields[x][y] = new BoardField());
    };
    BoardFields.prototype.checkIndexes = function (x, y) {
        if (x < 0 || x >= exports.ROW_SIZE || y < 0 || y >= exports.ROW_SIZE) {
            throw new RangeError("x:" + x + ", y:" + y);
        }
    };
    BoardFields.prototype.getFieldBonus = function (x, y) {
        this.checkIndexes(x, y);
        return this.fields[x][y] ? this.fields[x][y].fieldBonus : BoardFieldBonus.None;
    };
    BoardFields.prototype.getFieldValue = function (x, y) {
        this.checkIndexes(x, y);
        return this.fields[x][y] != null ? this.fields[x][y].value : null;
    };
    BoardFields.prototype.setFieldValue = function (x, y, value) {
        this.checkIndexes(x, y);
        var field = this.createIfNotExists(x, y);
        field.value = value;
    };
    BoardFields.prototype.addWord = function (word, x, y, direction) {
        for (var i = 0; i < word.length; i++) {
            var fieldX = x + (direction == GameMoveDirection.Horizontal ? i : 0);
            var fieldY = y + (direction == GameMoveDirection.Vertical ? i : 0);
            this.setFieldValue(fieldX, fieldY, word.charAt(i));
        }
    };
    BoardFields.prototype.isFieldFree = function (x, y) {
        return this.getFieldValue(x, y) == null;
    };
    BoardFields.prototype.hasFieldNeighbour = function (x, y) {
        var _this = this;
        var result = false;
        var fields = [{ x: x - 1, y: y }, { x: x + 1, y: y }, { x: x, y: y - 1 }, { x: x, y: y + 1 }];
        fields.forEach(function (field) {
            if (field.x >= 0 && field.x < exports.ROW_SIZE && field.y >= 0 && field.y < exports.ROW_SIZE) {
                if (!_this.isFieldFree(field.x, field.y)) {
                    result = true;
                }
            }
        });
        return result;
    };
    BoardFields.prototype.isBoardEmpty = function () {
        return !_.any(this.fields, function (iter) {
            return _.any(iter, function (iter2) {
                return iter2 != null && iter2.value != null;
            });
        });
    };
    BoardFields.prototype.isBoardValid = function () {
        return !this.isFieldFree(exports.ROW_CENTER, exports.ROW_CENTER);
    };
    return BoardFields;
})();
exports.BoardFields = BoardFields;
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
        var result = this.word == word.word &&
            this.x == word.x &&
            this.y == word.y &&
            this.direction == word.direction;
        return result;
    };
    return GameWord;
})();
exports.GameWord = GameWord;
(function (MoveType) {
    MoveType[MoveType["Move"] = 0] = "Move";
    MoveType[MoveType["Fold"] = 1] = "Fold";
    MoveType[MoveType["Exchange"] = 2] = "Exchange";
    MoveType[MoveType["WrongMove"] = 3] = "WrongMove";
    MoveType[MoveType["CheckMoveFailed"] = 4] = "CheckMoveFailed";
    MoveType[MoveType["SkipNoTimeLeft"] = 5] = "SkipNoTimeLeft";
})(exports.MoveType || (exports.MoveType = {}));
var MoveType = exports.MoveType;
var GameMoveHistory = (function () {
    function GameMoveHistory() {
        this.words = [];
    }
    return GameMoveHistory;
})();
exports.GameMoveHistory = GameMoveHistory;
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
    GamePlayer.prototype.isAlive = function () {
        var now = new Date();
        return this.lastSeen ? now.getTime() - this.lastSeen.getTime() < exports.CLIENT_TIMEOUT : false;
    };
    GamePlayer.fromJSON = function (json) {
        var player = new GamePlayer();
        player.freeLetters = json.freeLetters;
        player.moves = json.moves;
        player.userId = json.userId;
        player.playerName = json.playerName;
        player.remainingTime = json.remainingTime;
        if (json.lastSeen) {
            player.lastSeen = new Date(json.lastSeen.toString());
        }
        player.isPlaceholder = json.isPlaceholder;
        return player;
    };
    GamePlayer.prototype.toJSON = function () {
        var json = {
            freeLetters: this.freeLetters,
            moves: this.moves,
            userId: this.userId,
            playerName: this.playerName,
            remainingTime: this.remainingTime,
            lastSeen: this.lastSeen,
            isPlaceholder: this.isPlaceholder
        };
        return json;
    };
    return GamePlayer;
})();
exports.GamePlayer = GamePlayer;
(function (GameRunState) {
    GameRunState[GameRunState["Created"] = 0] = "Created";
    GameRunState[GameRunState["Running"] = 1] = "Running";
    GameRunState[GameRunState["Paused"] = 2] = "Paused";
    GameRunState[GameRunState["Finished"] = 3] = "Finished";
})(exports.GameRunState || (exports.GameRunState = {}));
var GameRunState = exports.GameRunState;
(function (GamePlayState) {
    GamePlayState[GamePlayState["PlayerMove"] = 0] = "PlayerMove";
    GamePlayState[GamePlayState["MoveApproval"] = 1] = "MoveApproval";
    GamePlayState[GamePlayState["None"] = 2] = "None";
})(exports.GamePlayState || (exports.GamePlayState = {}));
var GamePlayState = exports.GamePlayState;
var GameState = (function () {
    function GameState() {
        this.currentPlayerIndex = 0;
    }
    GameState.invalidState = function () {
        var state = new GameState();
        state.gameId = -1;
        state.players = new Array();
        state.remainingLetters = new Array();
        return state;
    };
    GameState.fromJSON = function (json) {
        var state = new GameState();
        state.gameId = json.gameId;
        state.creationDate = new Date(json.creationDate.toString());
        ;
        state.runState = json.runState;
        state.playState = json.playState;
        state.currentPlayerIndex = json.currentPlayerIndex;
        state.players = new Array();
        json.players.forEach(function (p) {
            var player = GamePlayer.fromJSON(p);
            state.players.push(player);
        });
        state.remainingLetters = json.remainingLetters;
        state.currentMove = json.currentMove;
        return state;
    };
    GameState.prototype.toJSON = function () {
        var json = {
            gameId: this.gameId,
            creationDate: this.creationDate,
            runState: this.runState,
            playState: this.playState,
            currentPlayerIndex: this.currentPlayerIndex,
            players: new Array(),
            remainingLetters: new Array(),
            currentMove: this.currentMove
        };
        this.players.forEach(function (p) {
            var player = p.toJSON();
            json.players.push(player);
        });
        json.remainingLetters.concat(this.remainingLetters);
        return json;
    };
    return GameState;
})();
exports.GameState = GameState;
(function (LetterPositionType) {
    LetterPositionType[LetterPositionType["BoardField"] = 0] = "BoardField";
    LetterPositionType[LetterPositionType["ExchangeLetter"] = 1] = "ExchangeLetter";
    LetterPositionType[LetterPositionType["FreeLetter"] = 2] = "FreeLetter";
})(exports.LetterPositionType || (exports.LetterPositionType = {}));
var LetterPositionType = exports.LetterPositionType;
var LetterPosition = (function () {
    function LetterPosition(letter, index) {
        this.letter = letter;
        this.index = index;
    }
    return LetterPosition;
})();
exports.LetterPosition = LetterPosition;
var FreeLetters = (function () {
    function FreeLetters() {
        this.freeLetters = [];
    }
    FreeLetters.prototype.getLetter = function (letter, index) {
        var letters = this.freeLetters.filter(function (pos) { return pos.letter == letter && pos.index == index; });
        return letters.length > 0 ? letters[0] : null;
    };
    FreeLetters.prototype.setLetter = function (letter, index, x, y, positionType) {
        var position = this.getLetter(letter, index);
        if (position == null) {
            position = new LetterPosition(letter, index);
            this.freeLetters.push(position);
        }
        position.x = x;
        position.y = y;
        position.positionType = positionType;
    };
    FreeLetters.prototype.getAllLetters = function (positionType) {
        if (positionType === void 0) { positionType = LetterPositionType.BoardField; }
        return this.freeLetters.filter(function (letter) { return letter.positionType == positionType; });
    };
    FreeLetters.prototype.removeLetter = function (letter, index) {
        this.freeLetters = this.freeLetters.filter(function (pos) { return pos.letter != letter || pos.index != index; });
    };
    FreeLetters.prototype.exists = function (x, y) {
        return this.freeLetters.filter(function (pos) { return pos.x == x && pos.y == y; }).length > 0;
    };
    FreeLetters.prototype.clear = function () {
        this.freeLetters = [];
    };
    return FreeLetters;
})();
exports.FreeLetters = FreeLetters;
var GameRun = (function () {
    function GameRun(userId) {
        this.freeLetters = new FreeLetters();
        this.isMoveRendered = false;
        this.currentUserId = userId;
    }
    GameRun.prototype.getPlayers = function () {
        return this.state.players;
    };
    GameRun.prototype.getPlayersInGame = function () {
        return this.state.players.filter(function (player) { return !player.isPlaceholder; });
    };
    GameRun.prototype.getCurrentPlayer = function () {
        return this.state.players[this.state.currentPlayerIndex];
    };
    GameRun.prototype.getNextPlayer = function () {
        var nextPlayerIndex = this.getNextPlayerIndex();
        return this.state.players[nextPlayerIndex];
    };
    GameRun.prototype.getNextPlayerIndex = function () {
        return (this.state.currentPlayerIndex + 1) % this.state.players.length;
    };
    GameRun.prototype.getCurrentUser = function () {
        var _this = this;
        return _.find(this.state.players, function (p) { return p.userId == _this.currentUserId; });
    };
    GameRun.prototype.runState = function (state) {
        this.state = state;
        this.renderState();
    };
    GameRun.prototype.isUndefinedGame = function () {
        return this.state.gameId == -1;
    };
    GameRun.prototype.isGameOwner = function () {
        var gameOwner = this.state.players[0];
        return gameOwner.userId == this.currentUserId;
    };
    GameRun.prototype.isCurrentPlayer = function () {
        return this.getCurrentPlayer().userId == this.currentUserId;
    };
    GameRun.prototype.isNextPlayer = function () {
        return this.getNextPlayer().userId == this.currentUserId;
    };
    GameRun.prototype.renderState = function () {
        var _this = this;
        this.board = new BoardFields();
        this.freeLetters.clear();
        this.state.players.forEach(function (player) { return player.moves.forEach(function (move) { return move.words.forEach(function (word) { return _this.board.addWord(word.word, word.x, word.y, word.direction); }); }); });
    };
    GameRun.prototype.putLetterOnBoard = function (letter, index, x, y) {
        this.cleanLetterOnBoard(letter, index);
        this.board.setFieldValue(x, y, letter);
        this.freeLetters.setLetter(letter, index, x, y, LetterPositionType.BoardField);
    };
    GameRun.prototype.isFieldFree = function (x, y) {
        return this.board.isFieldFree(x, y);
    };
    GameRun.prototype.isFieldValid = function (x, y) {
        return (x == exports.ROW_CENTER && y == exports.ROW_CENTER && !this.board.isFieldFree(exports.ROW_CENTER, exports.ROW_CENTER))
            || this.board.hasFieldNeighbour(x, y);
    };
    GameRun.prototype.isBoardValid = function () {
        return this.board.isBoardValid();
    };
    GameRun.prototype.addLetterToExchange = function (letter, index) {
        this.cleanLetterOnBoard(letter, index);
        this.freeLetters.setLetter(letter, index, -1, -1, LetterPositionType.ExchangeLetter);
    };
    GameRun.prototype.removeLetter = function (letter, index) {
        this.cleanLetterOnBoard(letter, index);
        this.freeLetters.removeLetter(letter, index);
    };
    GameRun.prototype.cleanLetterOnBoard = function (letter, index) {
        var oldPosition = this.freeLetters.getLetter(letter, index);
        if (oldPosition != null && oldPosition.positionType == LetterPositionType.BoardField) {
            this.board.setFieldValue(oldPosition.x, oldPosition.y, null);
        }
    };
    GameRun.prototype.getExchangeLetters = function () {
        return this.freeLetters.getAllLetters(LetterPositionType.ExchangeLetter).map(function (pos) { return pos.letter; });
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
            //search left
            while (x >= 0) {
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
            while (x < exports.ROW_SIZE) {
                searchLetter = _this.board.getFieldValue(x, y);
                if (searchLetter != null) {
                    word = word.concat(searchLetter);
                    x++;
                }
                else
                    break;
            }
            if (word.length > 1) {
                if (xWord < 0) {
                    throw new RangeError(word + ", x:" + xWord + ", y:" + y);
                }
                gameWord = _this.createGameWord(word, xWord, y, GameMoveDirection.Horizontal);
                _this.addGameWord(words, gameWord);
            }
            //check vertical
            word = letter.letter;
            var x = letter.x;
            var y = letter.y - 1;
            //search up
            while (y >= 0) {
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
            while (y < exports.ROW_SIZE) {
                searchLetter = _this.board.getFieldValue(x, y);
                if (searchLetter != null) {
                    word = word.concat(searchLetter);
                    y++;
                }
                else
                    break;
            }
            if (word.length > 1) {
                if (yWord < 0) {
                    throw new RangeError(word + ", x:" + x + ", y:" + yWord);
                }
                var gameWord = _this.createGameWord(word, x, yWord, GameMoveDirection.Vertical);
                _this.addGameWord(words, gameWord);
            }
        });
        return words;
    };
    GameRun.prototype.getActualMove = function () {
        var freeLetters = this.freeLetters.getAllLetters();
        if (this.state.currentMove && !this.isMoveRendered) {
            freeLetters = freeLetters.concat(this.state.currentMove.freeLetters);
        }
        return { gameId: this.state.gameId, freeLetters: freeLetters };
    };
    GameRun.prototype.renderMove = function () {
        var _this = this;
        var move = this.getActualMove();
        move.freeLetters.forEach(function (fl) {
            _this.putLetterOnBoard(fl.letter, fl.index, fl.x, fl.y);
        });
        this.isMoveRendered = true;
    };
    GameRun.prototype.canApproveMove = function () {
        return (this.isNextPlayer() &&
            this.state.runState == GameRunState.Running &&
            this.state.playState == GamePlayState.MoveApproval);
    };
    GameRun.prototype.isWaitingForMoveApproval = function () {
        return (this.isCurrentPlayer() &&
            this.state.runState == GameRunState.Running &&
            this.state.playState == GamePlayState.MoveApproval);
    };
    GameRun.prototype.isFinished = function () {
        return this.state.runState == GameRunState.Finished;
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
            var fieldx = x + (direction == GameMoveDirection.Horizontal ? i : 0);
            var fieldy = y + (direction == GameMoveDirection.Vertical ? i : 0);
            var letter = this.board.getFieldValue(fieldx, fieldy);
            var basePoints = exports.LETTERS[letter].points;
            if (this.freeLetters.exists(fieldx, fieldy)) {
                var bonus = this.board.getFieldBonus(fieldx, fieldy);
                switch (bonus) {
                    case BoardFieldBonus.DoubleLetter:
                        basePoints *= 2;
                        break;
                    case BoardFieldBonus.TripleLetter:
                        basePoints *= 3;
                        break;
                    case BoardFieldBonus.Start:
                    case BoardFieldBonus.DoubleWord:
                        wordBonus *= 2;
                        break;
                    case BoardFieldBonus.TripleWord:
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
exports.GameRun = GameRun;
var GameMove = (function () {
    function GameMove() {
    }
    return GameMove;
})();
exports.GameMove = GameMove;
//# sourceMappingURL=literki.js.map