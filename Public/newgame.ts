/// <amd-dependency path="./scripts/jquery-ui" />

import master = require('./master');
import literki = require('./scripts/literki');
import ko = require('knockout');
import $ = require('jquery');
import moment = require('moment');


class NewGameModel extends master.MasterModel {
   
    playersCount = ko.observable("");
    timeLimit = ko.observable("");
    timeLimits = ko.observableArray();
    
    constructor() {
        super();

        this.initializeTimeLimits();
    }

    private initializeTimeLimits(): void {
        for (var minutes = 5; minutes <= 30; minutes += 5) {
            var limit = `${minutes} minut`;
            this.timeLimits().push(limit);
        }
    }
}

class NewGameController extends master.MasterControler<NewGameModel> {

    init(): void {
        ko.applyBindings(this);
    }

    refreshModel(result: any): void {
        super.refreshModel(result);
    }

    protected cancelClick(): void {
        history.back();
    }

    protected newGameClick(): void {
        $.ajax({
            type: "GET",
            url: "/game/new",
            dataType: "json",
            success: result => {
                if (result.state) {
                    var gameId = result.state.gameId;
                    var url = `board.html?gameId=${gameId}&join=1`;
                    location.href = url;
                } else {
                    this.showErrorDialogBox("Nie udało się utworzyć nowej gry");
                }
            }
        });
    }
}   


var controller = new NewGameController();

export function init(): void  {
    master.init();
    master.hideBoardDiv();
    
    var model = new NewGameModel();
    controller.model = model;
    controller.init();
}
    
    