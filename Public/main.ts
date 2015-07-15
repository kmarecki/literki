﻿import Literki = require('./scripts/literki');
import ko = require('knockout');
import $ = require('jquery');

export class GameViewModel {
    gameId: number;
    runState: Literki.GameRunState;
    joinAction(): string {
        return this.runState == Literki.GameRunState.Created ? "Dołącz" : "Obserwuj";
    }
}

export class MainViewModel {

    private self = this;
    games = ko.observableArray<GameViewModel>();

    init(): void {
        $.ajax({
            type: "GET",
            url: "/game/list",
            dataType: "json",
            success: (result) => {
                this.refreshModel(result.games);
                ko.applyBindings(this);
            }
        });
    }

    refreshModel(games: Array<any>): void {
        this.games.removeAll();
        games.forEach(g => {
            var gameModel = new GameViewModel();
            gameModel.gameId = g.gameId;
            gameModel.runState = g.runState;
            this.games.push(gameModel);
        });
    }
}

export function init(): void  {
    var viewModel = new MainViewModel();
    viewModel.init();
}
    
    