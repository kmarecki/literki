import App = require('./app');
import Literki = require('./scripts/literki');
import ko = require('knockout');
import $ = require('jquery');
import moment = require('moment');

class GameViewModel {
    gameId: number;
    runState: Literki.GameRunState;
    creationDate: string;
    joinAction(): string {
        return this.runState == Literki.GameRunState.Created ? "Dołącz" : "Obserwuj";
    }
}

class MainViewModel extends App.BaseViewModel {

    private self = this;
    games = ko.observableArray<GameViewModel>();

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
        this.games.removeAll();
        games.forEach(g => {
            var gameModel = new GameViewModel();
            gameModel.gameId = g.gameId;
            gameModel.creationDate = g.creationDate ? moment(g.creationDate).format("DD.MM.YYYY hh:mm") : "";
            gameModel.runState = g.runState;
            this.games.push(gameModel);
        });
    }
}

export function init(): void  {
    $.ajaxSetup({ cache: false });

    var viewModel = new MainViewModel();
    viewModel.init();
}
    
    