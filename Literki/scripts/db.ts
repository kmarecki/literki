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


    newState(state: literki.IGameState): number {
        var gameId = 1;
        state.gameId = gameId;
        this.saveState(state);
        return gameId;

    }

    loadState(gameId: number, callback: (state: literki.IGameState) => any): void {
        this.GameState.findOne({ gameId: gameId }).exec((err, result) => {
            if (!err) {
                callback(result);
            } else {
                console.log(err);
            }
        })
    }

    saveState(state: literki.IGameState) {
        var modelState = new this.GameState(state);
        modelState.save(err => {
            if (err) console.log(err);
        });
    }

    private connect(): void {
        var uri = 'mongodb://localhost/literki';
        mongoose.connect(uri);
        this.addGameSchema();
    }

    private addGameSchema(): void {
        this.schema = new mongoose.Schema({
            gameId: Number,
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
}
 