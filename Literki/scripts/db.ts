/// <reference path="..\typings\mongoose\mongoose.d.ts"/>
/// <reference path=".\literki.ts"/>

import mongoose = require('mongoose');
import async = require('async');
import literki = require('./literki');

interface IGameStateModel extends literki.IGameState, mongoose.Document { }

export class GameRepository {
    
    private schema: mongoose.Schema;
    private GameState: mongoose.Model<IGameStateModel>;

    newState(state: literki.IGameState): number {
        this.connect();

        var gameId = 1;
        state.gameId = gameId;
        this.saveState(state);
        return gameId;

    }

    loadState(gameId: number): literki.IGameState {
        var state: literki.IGameState;

        var calls = [];

        calls.push((callback) => {
            this.GameState.findOne({ gameId: gameId }).exec((err, result) => {
                if (!err) {
                    state = result;
                } else {
                    console.log(err);
                }
            })
        });

        async.parallel(calls, (err, result) => {
            if (err) return console.log(err);
        });

        //async.parallel({
        //    query: () => this.GameState.findOne({ gameId: gameId }).exec((err, result) => {
        //        if (!err) {
        //            state = result;
        //        } else {
        //            console.log(err);
        //        }
        //    })
        //},(err, result) => {
        //        if (err) return console.log(err);
        //    });

        return state;
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
 