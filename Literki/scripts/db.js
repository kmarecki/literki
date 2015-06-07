/// <reference path="..\typings\mongoose\mongoose.d.ts"/>
/// <reference path=".\literki.ts"/>
var mongoose = require('mongoose');
var GameRepository = (function () {
    function GameRepository() {
    }
    GameRepository.prototype.open = function () {
        this.connect();
    };
    GameRepository.prototype.newState = function (state, callback) {
        var gameId = 1;
        state.gameId = gameId;
        this.saveState(state, function (err) {
            if (err == null) {
                callback(null, gameId);
            }
            else {
                console.log(err);
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
                callback(err, null);
            }
        });
    };
    GameRepository.prototype.saveState = function (state, callback) {
        var modelState = new this.GameState(state);
        modelState.save(callback);
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
                        direction: Number
                    }]
                }]
            }]
        });
        this.GameState = mongoose.model("GameState", this.schema);
    };
    return GameRepository;
})();
exports.GameRepository = GameRepository;
//# sourceMappingURL=db.js.map