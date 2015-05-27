/// <reference path="..\typings\mongoose\mongoose.d.ts"/>
/// <reference path=".\literki.ts"/>

import mongoose = require('mongoose');
import literki = require('./literki');

export class GameRepository {
    
    private state: literki.GameState;

    newState(state: literki.GameState): number {
        this.connect();

        var gameId = 1;
        state.gameId = gameId;
        this.saveState(state);
        return gameId;
    }

    loadState(gameId: number): literki.GameState {
        return this.state;
    }

    saveState(state: literki.GameState) {
        this.state = state;
    }

    private connect(): void {
        var uri = 'mongodb://localhost/literki';
        mongoose.connect(uri);
        //this.addGameSchema();
    }

    private addGameSchema(): void {
        var schema = new mongoose.Schema({
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
                        direction: { type: String, enum: ['Vertical', 'Horizontal'] }
                    }]
                }]
            }]
        });
        //var Game:IMongooseSearchable = mongoose.model('Game', schema);
        //game = new Game();
    }
}
 