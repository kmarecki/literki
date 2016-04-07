/// <reference path="../../typings/main.d.ts"/>

import master = require('./master');
import literki = require('../../scripts/shared/literki');
import ko = require('knockout');
import $ = require('jquery');
import moment = require('moment');

class GameViewModel {
    gameId: number;
    runState: literki.GameRunState;
    creationDate: string;
    joinAction(): string {
        return this.runState == literki.GameRunState.Created ? "Dołącz" : "Obserwuj";
    }
}

class MainModel extends master.MasterModel {

    games = ko.observableArray<GameViewModel>();
}

class MainController extends master.MasterControler<MainModel> {

    init(): void {
        $.ajax({
            type: "GET",
            url: "/game/list",
            dataType: "json",
            success: (result) => {
                this.refreshModel(result);
                ko.applyBindings(this);
            }
        });
    }

    refreshModel(result: any): void {
        super.refreshModel(result);

        var games: Array<any> = result.games;
        this.model.games.removeAll();
        games.forEach(g => {
            var gameModel = new GameViewModel();
            gameModel.gameId = g.gameId;
            gameModel.creationDate = g.creationDate ? moment(g.creationDate).format("DD.MM.YYYY hh:mm") : "";
            gameModel.runState = g.runState;
            this.model.games.push(gameModel);
        });
    }

    protected newGameClick(): void {
        window.location.href = "newgame.html";
    }
}

var controller = new MainController();

export function init(): void  {
    master.init();
    master.hideBoardDiv();
    
    var model = new MainModel();
    controller.model = model;
    controller.init();
}

window.onload = init;
    
    