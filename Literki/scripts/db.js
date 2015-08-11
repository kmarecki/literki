/// <reference path="..\typings\mongoose\mongoose.d.ts"/>
/// <reference path=".\literki.ts"/>
var mongoose = require('mongoose');
var literki = require('./literki');
var GameRepository = (function () {
    function GameRepository() {
    }
    GameRepository.prototype.open = function () {
        this.connect();
    };
    GameRepository.prototype.allGames = function (callback) {
        this.GameState.find({ $query: {}, $orderby: { gameId: 1 } }, { gameId: 1, runState: 1, creationDate: 1, _id: 0 }, function (err, result) {
            if (err != null) {
                console.log(err);
            }
            callback(err, result);
        });
    };
    GameRepository.prototype.newState = function (state, callback) {
        var _this = this;
        var gameId = this.getMaxGameId(function (err, result) {
            if (result != null) {
                var newGameId = result != -1 ? result + 1 : 1;
                state.gameId = newGameId;
                state.creationDate = new Date();
                state.runState = literki.GameRunState.Created;
                _this.saveState(state, function (err) {
                    if (err == null) {
                        callback(null, newGameId);
                    }
                    else {
                        console.log(err);
                        callback(err, -1);
                    }
                });
            }
            else {
                callback(err, -1);
            }
        });
    };
    GameRepository.prototype.loadState = function (gameId, callback) {
        this.GameState.findOne({ gameId: gameId }).exec(function (err, result) {
            if (err == null && result != null) {
                callback(null, result);
            }
            else {
                console.log(err);
                callback(err, result);
            }
        });
    };
    GameRepository.prototype.saveState = function (state, callback) {
        var modelState = new this.GameState(state);
        this.GameState.findOneAndUpdate({ gameId: state.gameId }, state, { upsert: true }, function (err) {
            if (err != null) {
                console.log(err);
            }
            callback(err);
        });
    };
    GameRepository.prototype.loadOrCreateUser = function (googleId, userName, callback) {
        var _this = this;
        this.User.findOne({ googleId: googleId }).exec(function (err, result) {
            if (err != null) {
                console.log(err);
            }
            if (result == null && err == null) {
                _this.User.create({ googleId: googleId, userName: userName }, callback);
            }
            else {
                callback(err, result);
            }
        });
    };
    GameRepository.prototype.loadUser = function (id, callback) {
        this.User.findOne({ _id: id }).exec(function (err, result) {
            if (err != null) {
                console.log(err);
            }
            callback(err, result);
        });
    };
    GameRepository.prototype.connect = function () {
        var uri = 'mongodb://localhost/literki';
        mongoose.connect(uri);
        this.addGameStateSchema();
        this.addUserProfileSchema();
    };
    GameRepository.prototype.addGameStateSchema = function () {
        var schema = new mongoose.Schema({
            gameId: {
                type: Number,
                unique: true,
                index: true
            },
            creationDate: Date,
            runState: Number,
            playState: Number,
            currentPlayerIndex: Number,
            players: [{
                    userId: mongoose.Schema.Types.ObjectId,
                    playerName: String,
                    remainingTime: Number,
                    freeLetters: [String],
                    moves: [{
                            words: [{
                                    word: String,
                                    x: Number,
                                    y: Number,
                                    direction: Number,
                                    points: Number
                                }],
                            moveType: Number
                        }]
                }],
            remainingLetters: [String],
            currentMove: {
                freeLetters: [{
                        letter: String,
                        index: Number,
                        x: Number,
                        y: Number,
                        positionType: Number
                    }]
            }
        });
        this.GameState = mongoose.model("GameState", schema);
    };
    GameRepository.prototype.addUserProfileSchema = function () {
        var schema = new mongoose.Schema({
            googleId: String,
            userName: String
        });
        this.User = mongoose.model("UserProfile", schema);
    };
    GameRepository.prototype.getMaxGameId = function (callback) {
        this.GameState.findOne({}).sort({ gameId: -1 }).exec(function (err, result) {
            if (err == null && result != null) {
                callback(null, result.gameId);
            }
            else {
                console.log(err);
                callback(err, -1);
            }
        });
    };
    return GameRepository;
})();
exports.GameRepository = GameRepository;
//# sourceMappingURL=db.js.map