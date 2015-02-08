/// <reference path="..\typings\mongoose\mongoose.d.ts"/>
/// <reference path=".\literki.ts"/>

import mongoose = require('mongoose');
import literki = require('./literki');

export class GameRepository {
    
    private state: literki.GameState;

    newState(state: literki.GameState): number {
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
}
 