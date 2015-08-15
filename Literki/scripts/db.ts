/// <reference path="..\typings\mongoose\mongoose.d.ts"/>
/// <reference path=".\literki.ts"/>

import mongoose = require('mongoose');
import literki = require('./literki');

interface UserProfile {
    googleId: string;
    userName: string;
}

interface WordsDictionary {
}

interface GameStateModel extends literki.IGameState, mongoose.Document { }
interface UserProfilModel extends UserProfile, mongoose.Document { }
interface WordsDictionaryModel extends WordsDictionary, mongoose.Document { }

export class GameRepository {
    
    GameState: mongoose.Model<GameStateModel>;
    User: mongoose.Model<UserProfilModel>;
    WordsDictionary: mongoose.Model<WordsDictionaryModel>;

    open(): void {
        this.connect();
    }

    allGames(callback: (err: Error, games: any) => any): void {
        this.GameState.find({ $query: {}, $orderby: { gameId: 1 } }, { gameId: 1, runState: 1, creationDate: 1, _id: 0 }, (err, result) => {
            if (err != null) {
                console.log(err);
            }
            callback(err, result);
        });
    }

    newState(state: literki.IGameState, callback: (err: Error, gameId: number) => any): void {
        var gameId = this.getMaxGameId((err, result) => {
            if (result != null) {
                var newGameId = result != -1 ? result + 1 : 1;
                state.gameId = newGameId;
                state.creationDate = new Date();
                state.runState = literki.GameRunState.Created;
                this.saveState(state, (err) => {
                    if (err == null) {
                        callback(null, newGameId);
                    } else {
                        console.log(err);
                        callback(err, -1);
                    }
                });
            } else {
                callback(err, -1);
            }
        });
    }

    loadState(gameId: number, callback: (err: Error, state: literki.IGameState) => any): void {
        this.GameState.findOne({ gameId: gameId }).exec((err, result) => {
            if (err == null && result != null) {
                callback(null, result);
            } else {
                console.log(err);
                callback(err, result);
            }
        });
    }

    saveState(state: literki.IGameState, callback: (err: Error) => any): void {
        var modelState = new this.GameState(state);
        this.GameState.findOneAndUpdate({ gameId: state.gameId }, state, { upsert: true },(err) => {
            if (err != null) {
                console.log(err);
            }
            callback(err);
        });
    }

    loadOrCreateUser(googleId: number, userName: string, callback: (err: Error, user: UserProfile) => any): void {
        this.User.findOne({ googleId: googleId }).exec((err, result) => {
            if (err != null) {
                console.log(err);
            }
            if (result == null && err == null) {
                this.User.create({ googleId: googleId, userName: userName }, callback);
            } else {
                callback(err, result);
            }
        });
    }

    loadUser(id: number, callback: (err: Error, user: UserProfile) => any): void {
        this.User.findOne({ _id: id }).exec((err, result) => {
            if (err != null) {
                console.log(err);
            }
            callback(err, result);
        });
    }

    //addWord(word: string, callback: (err: Error) => any): void {
    //    this.
    //}


    private connect(): void {
        var uri = 'mongodb://localhost/literki';
        mongoose.connect(uri);
        this.addGameStateSchema();
        this.addUserProfileSchema();
        this.addWordsDictionarySchema();
    }

    private addGameStateSchema(): void {
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
        this.GameState = mongoose.model<GameStateModel>("GameState", schema);
    }

    private addUserProfileSchema(): void {
        var schema = new mongoose.Schema({
            googleId: String,
            userName: String
        });
        this.User = mongoose.model<UserProfilModel>("UserProfile", schema);
    }

    private addWordsDictionarySchema(): void {
        var schema = new mongoose.Schema({
            language: String,
            words: [String]
        });
        this.WordsDictionary = mongoose.model<WordsDictionaryModel>("WordsDictionary", schema);
    }

    private getMaxGameId(callback: (err: Error, gameId: number) => any): void {
        this.GameState.findOne({}).sort({ gameId: -1 }).exec((err, result) => {
            if (err == null && result != null) {
                callback(null, result.gameId);
            } else {
                console.log(err);
                callback(err, -1);
            }
        })
    }
}
 