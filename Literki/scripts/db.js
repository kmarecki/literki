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
        this.GameState.find({ $query: {}, $orderby: { gameId: 1 } }, { gameId: 1, _id: 0 }, function (err, result) {
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
                callback(err, literki.GameState.invalidState());
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
    GameRepository.prototype.connect = function () {
        var uri = 'mongodb://localhost/literki';
        mongoose.connect(uri);
        this.addGameSchema();
    };
    GameRepository.prototype.addGameSchema = function () {
        this.schema = new mongoose.Schema({
            gameId: {
                type: Number,
                unique: true,
                index: true
            },
            remainingLetters: [String],
            currentPlayerIndex: Number,
            players: [{
                playerName: String,
                remainingTime: Number,
                freeLetters: [String],
                moves: [{
                    words: [{
                        word: String,
                        x: Number,
                        y: Number,
                        //direction: { type: String, enum: ['Vertical', 'Horizontal'] }
                        direction: Number,
                        points: Number
                    }]
                }]
            }]
        });
        this.GameState = mongoose.model("GameState", this.schema);
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