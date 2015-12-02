import master = require('./master');
import literki = require('./scripts/literki');
import ko = require('knockout');
import $ = require('jquery');
import moment = require('moment');


class NewGameModel extends master.MasterModel {
   
    playersLimit = ko.observable("");
    timeLimit = ko.observable("");
    
    constructor() {
        super();
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
    
    