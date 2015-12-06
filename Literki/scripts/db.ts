/// <reference path="..\typings\mongoose\mongoose.d.ts"/>
/// <reference path=".\literki.ts"/>

import mongoose = require('mongoose');
import entities = require('./entities');
import literki = require('./literki');

interface GameStateModel extends literki.IGameState, mongoose.Document { }
interface UserProfileModel extends entities.UserProfile, mongoose.Document { }
interface DictionaryWordModel extends entities.DictionaryWord, mongoose.Document { }

export class GameRepository {
    
    private connected = false; 
    private uri: string;

    GameState: mongoose.Model<GameStateModel>;
    User: mongoose.Model<UserProfileModel>;
    DictionaryWord: mongoose.Model<DictionaryWordModel>;

    open(uri: string): void {
        this.uri = uri;
        mongoose.connection.on('connected', () => {
            console.log('Mongoose default connection open to ' + this.uri);
            this.connected = true;
        });
        mongoose.connection.on('error', (err) => {
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
    }

    allGames(callback: (err: Error, games: any) => any): void {
        this.connect();
        this.GameState.find({ $query: {}, $orderby: { gameId: 1 } }, { gameId: 1, runState: 1, creationDate: 1, _id: 0 }, (err, result) => {
            if (err != null) {
                console.log(err);
            }
            callback(err, result);
        });
    }

    newState(state: literki.IGameState, callback: (err: Error, gameId: number) => any): void {
        this.connect();
        var gameId = this.getMaxGameId((err, result) => {
            if (result) {
                var newGameId = result != -1 ? result + 1 : 1;
                state.gameId = newGameId;
                state.creationDate = new Date();
                state.runState = literki.GameRunState.Created;
                state.playState = literki.GamePlayState.None;
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
        this.connect();
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
        this.connect();
        this.GameState.findOneAndUpdate({ gameId: state.gameId }, state, { upsert: true }, (err) => {
            if (err) {
                console.log(err);
            }
            callback(err);
        });
    }

    removeAllStates(callback: (err: Error) => any): void {
        this.connect();
        this.GameState.remove({}, (err) => {
            if (err) {
                console.log(err);
            }
            callback(err);
        });
    }

    loadOrCreateUser(authId: string, userName: string, callback: (err: Error, user: UserProfileModel) => any): void {
        this.connect();
        this.User.findOne({ authId: authId }).exec((err, result) => {
            if (err) {
                console.log(err);
            }
            if (result == null && err == null) {
                this.User.create({ authId: authId, userName: userName }, callback);
            } else {
                callback(err, result);
            }
        });
    }

    loadUser(id: number, callback: (err: Error, user: UserProfileModel) => any): void {
        this.connect();
        this.User.findOne({ _id: id }).exec((err, result) => {
            if (err) {
                console.log(err);
            }
            callback(err, result);
        });
    }

    saveUser(user: UserProfileModel, callback: (err: Error) => any): void {
        this.connect();
        this.User.findOneAndUpdate({ _id: user._id }, user, { new: true }, (err) => {
            if (err) {
                console.log(err);
            }
            callback(err);
        });
    }

    removeAllUsers(callback: (err: Error) => any): void {
        this.connect();
        this.User.remove({}, (err) => {
            if (err) {
                console.log(err);
            }
            callback(err);
        });
    }

    addWord(word: string, lang: string, callback: (err: Error) => any): void {
        this.connect();
        this.DictionaryWord.create({ word: word, lang: lang }, (err, result) => {
            if(err) {
                console.log(err);
            }
            callback(err);
        });
    }

    removeAllWords(lang: string, callback: (err: Error) => any): void {
        this.connect();
        this.DictionaryWord.remove({ lang: lang }, (err) => {
            if (err) {
                console.log(err);
            }
            callback(err);
        });
    }

    existWords(words: string[], lang: string, callback: (err: Error, exists: boolean) => any): void {
        this.connect();
        this.DictionaryWord.find({ $and: [{ word: { $in: words } }, { lang: lang }] }, { _id: 1 }, undefined, (err, result) => {
            if (err) {
                console.log(err);
            }
            callback(err, result.length == words.length ? true : false);
        });
    }

    private connect(): void {
        if (this.connected) {
            return;
        }

        mongoose.connect(this.uri);
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
            authId: String,
            userName: String,
            email: String,
            defaultLanguage: String
        });
        this.User = mongoose.model<UserProfileModel>("UserProfile", schema);
    }

    private addWordsDictionarySchema(): void {
        var schema = new mongoose.Schema({
            word: { type: String, index: true },
            lang: { type: String, index: true }
        });
        this.DictionaryWord = mongoose.model<DictionaryWordModel>("DictionaryWord", schema);
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
 