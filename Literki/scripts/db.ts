/// <reference path="..\typings\mongoose\mongoose.d.ts"/>
/// <reference path=".\literki.ts"/>

import mongoose = require('mongoose');
import async = require('async');
import literki = require('./literki');

interface IGameStateModel extends literki.IGameState, mongoose.Document { }

export class GameRepository {
    
    private schema: mongoose.Schema;
    private GameState: mongoose.Model<IGameStateModel>;

    open(): void {
        this.connect();
    }


    newState(state: literki.IGameState, callback: (err: Error, gameId: number) => any): void {
        var gameId = this.getMaxGameId((err, result) => {
            if (result != null) {
                var newGameId = result + 1;
                state.gameId = newGameId;
                this.saveState(state, err => {
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
        })
    }

    saveState(state: literki.IGameState, callback: (err: Error) => any): void {
        var modelState = new this.GameState(state);
        modelState.save(callback);
    }

    private connect(): void {
        var uri = 'mongodb://localhost/literki';
        mongoose.connect(uri);
        this.addGameSchema();
    }

    private addGameSchema(): void {
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
        this.GameState = mongoose.model<IGameStateModel>("GameState", this.schema);
    }

    private getMaxGameId(callback: (err: Error, gameId: number) => any): void {
        this.GameState.findOne({}).sort({ gameId: -1 }).exec((err, result) => {
            if (err == null && result != null) {
                callback(null, result.gameId);
            } else {
                console.log(err);
                callback(err, null);
            }
        })
    }
}
 