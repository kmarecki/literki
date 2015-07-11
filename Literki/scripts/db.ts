/// <reference path="..\typings\mongoose\mongoose.d.ts"/>
/// <reference path=".\literki.ts"/>

import mongoose = require('mongoose');
import async = require('async');
import literki = require('./literki');

interface IUserProfile {
    googleId: string;
    userName: string;
}

interface IGameStateModel extends literki.IGameState, mongoose.Document { }
interface IUserProfilModel extends IUserProfile, mongoose.Document { }

export class GameRepository {
    
    GameState: mongoose.Model<IGameStateModel>;
    User: mongoose.Model<IUserProfilModel>;

    open(): void {
        this.connect();
    }

    allGames(callback: (err: Error, games: any) => any): void {
        this.GameState.find({ $query: {}, $orderby: { gameId: 1 } }, { gameId: 1, _id: 0 }, (err, result) => {
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
                callback(err, literki.GameState.invalidState());
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

    loadUser(googleId: number, userName: string, callback: (err: Error, user: IUserProfile) => any): void {
        this.User.findOne({ googleId: googleId }).exec((err, result) => {
            if (err != null) {
                console.log(err)
                callback(err, result)
            }
            if (result == null) {
                this.User.create({ googleId: googleId, userName: userName }, callback)
            }
        });
    }


    private connect(): void {
        var uri = 'mongodb://localhost/literki';
        mongoose.connect(uri);
        this.addGameStateSchema();
        this.addUserProfileSchema();
    }

    private addGameStateSchema(): void {
       var schema = new mongoose.Schema({
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
        this.GameState = mongoose.model<IGameStateModel>("GameState", schema);
    }

    private addUserProfileSchema(): void {
        var schema = new mongoose.Schema({
            googleId: String,
            userName: String
        });
        this.User = mongoose.model<IUserProfilModel>("UserProfile", schema);
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
 