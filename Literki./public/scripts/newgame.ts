/// <reference path="../../typings/tsd.d.ts"/>
/// <amd-dependency path="./scripts/jquery-ui" />

import master = require('./master');
import literki = require('../../scripts/shared/literki');
import entities = require('../../scripts/shared/entities');
import ko = require('knockout');
import $ = require('jquery');
import _ = require('underscore');
import moment = require('moment');


class TimeLimitModel {
    description: string;
    timeLimit: number;
}

class NewGameModel extends master.MasterModel {
   
    playersCount = ko.observable<number>();
    timeLimit = ko.observable<TimeLimitModel>();
    timeLimits = ko.observableArray<TimeLimitModel>();
    
    constructor() {
        super();
    }

    public initialize(): void {
        this.playersCount(2);

        for (var minutes = 5; minutes <= 30; minutes += 5) {
            var limit: TimeLimitModel = {
                description: `${minutes} minut`,
                timeLimit: minutes
            };
            this.timeLimits().push(limit);
        }
        this.timeLimit(_.find(this.timeLimits(), limit => limit.timeLimit == 15));
    }

    getNewGameRequest(): entities.NewGameRequest {
        var request: entities.NewGameRequest = {
            playerCount: this.playersCount(),
            timeLimit: this.timeLimit().timeLimit
        };
        return request;
    }
}

class NewGameController extends master.MasterControler<NewGameModel> {

    init(): void {
        this.model.initialize();

        ko.applyBindings(this);
    }

    refreshModel(result: any): void {
        super.refreshModel(result);
    }

    protected cancelClick(): void {
        history.back();
    }

    protected newGameClick(): void {
        var data = this.model.getNewGameRequest();
        this.callPOSTMethod("/game/new", data, result => {
            if (result.state) {
                var gameId = result.state.gameId;
                var url = `board.html?gameId=${gameId}&join=1`;
                location.href = url;
            } else {
                this.showErrorDialogBox("Nie udało się utworzyć nowej gry");
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
    
    