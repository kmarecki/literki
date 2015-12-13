/// <reference path="..\typings\mongoose\mongoose.d.ts"/>
/// <reference path=".\literki.ts"/>
var mongoose = require('mongoose');
var literki = require('./literki');
var GameRepository = (function () {
    function GameRepository() {
        this.connected = false;
    }
    GameRepository.prototype.open = function (uri) {
        var _this = this;
        this.uri = uri;
        mongoose.connection.on('connected', function () {
            console.log('Mongoose default connection open to ' + _this.uri);
            _this.connected = true;
        });
        mongoose.connection.on('error', function (err) {
            console.log('Mongoose default connection error: ' + err);
        });
        mongoose.connection.on('disconnected', function () {
            console.log('Mongoose default connection disconnected');
            this.connected = false;
        });
        process.on('SIGINT', function () {
            mongoose.connection.close(function () {
                console.log('Mongoose default connection disconnected through app termination');
                process.exit(0);
            });
        });
        this.addGameStateSchema();
        this.addUserProfileSchema();
        this.addWordsDictionarySchema();
    };
    GameRepository.prototype.allGames = function (callback) {
        this.connect();
        this.GameState.find({ $query: {}, $orderby: { gameId: 1 } }, { gameId: 1, runState: 1, creationDate: 1, _id: 0 }, function (err, result) {
            if (err != null) {
                console.log(err);
            }
            callback(err, result);
        });
    };
    GameRepository.prototype.newState = function (state, callback) {
        var _this = this;
        this.connect();
        var gameId = this.getMaxGameId(function (err, result) {
            if (result) {
                var newGameId = result != -1 ? result + 1 : 1;
                state.gameId = newGameId;
                state.creationDate = new Date();
                state.runState = literki.GameRunState.Created;
                state.playState = literki.GamePlayState.None;
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
        this.connect();
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
        this.connect();
        this.GameState.findOneAndUpdate({ gameId: state.gameId }, state, { upsert: true }, function (err) {
            if (err) {
                console.log(err);
            }
            callback(err);
        });
    };
    GameRepository.prototype.removeAllStates = function (callback) {
        this.connect();
        this.GameState.remove({}, function (err) {
            if (err) {
                console.log(err);
            }
            callback(err);
        });
    };
    GameRepository.prototype.loadOrCreateUser = function (authId, userName, callback) {
        var _this = this;
        this.connect();
        this.User.findOne({ authId: authId }).exec(function (err, result) {
            if (err) {
                console.log(err);
            }
            if (result == null && err == null) {
                _this.User.create({ authId: authId, userName: userName }, callback);
            }
            else {
                callback(err, result);
            }
        });
    };
    GameRepository.prototype.loadUser = function (id, callback) {
        this.connect();
        this.User.findOne({ _id: id }).exec(function (err, result) {
            if (err) {
                console.log(err);
            }
            callback(err, result);
        });
    };
    GameRepository.prototype.saveUser = function (user, callback) {
        this.connect();
        this.User.findOneAndUpdate({ _id: user.id }, user, { new: true }, function (err) {
            if (err) {
                console.log(err);
            }
            callback(err);
        });
    };
    GameRepository.prototype.removeAllUsers = function (callback) {
        this.connect();
        this.User.remove({}, function (err) {
            if (err) {
                console.log(err);
            }
            callback(err);
        });
    };
    GameRepository.prototype.addWord = function (word, lang, callback) {
        this.connect();
        this.DictionaryWord.create({ word: word, lang: lang }, function (err, result) {
            if (err) {
                console.log(err);
            }
            callback(err);
        });
    };
    GameRepository.prototype.removeAllWords = function (lang, callback) {
        this.connect();
        this.DictionaryWord.remove({ lang: lang }, function (err) {
            if (err) {
                console.log(err);
            }
            callback(err);
        });
    };
    GameRepository.prototype.existWords = function (words, lang, callback) {
        this.connect();
        this.DictionaryWord.find({ $and: [{ word: { $in: words } }, { lang: lang }] }, { _id: 1 }, undefined, function (err, result) {
            if (err) {
                console.log(err);
            }
            callback(err, result.length == words.length ? true : false);
        });
    };
    GameRepository.prototype.connect = function () {
        if (this.connected) {
            return;
        }
        mongoose.connect(this.uri);
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
                    lastSeen: Date,
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
                        }],
                    isPlaceholder: Boolean
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
            authId: String,
            userName: String,
            email: String,
            defaultLanguage: String
        });
        this.User = mongoose.model("UserProfile", schema);
    };
    GameRepository.prototype.addWordsDictionarySchema = function () {
        var schema = new mongoose.Schema({
            word: { type: String, index: true },
            lang: { type: String, index: true }
        });
        this.DictionaryWord = mongoose.model("DictionaryWord", schema);
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