import master = require('./master');
import literki = require('./scripts/literki');
import ko = require('knockout');
import $ = require('jquery');
import moment = require('moment');


class NewGameModel extends master.MasterModel {
}

class NewGameController extends master.MasterControler<NewGameModel> {

    init(): void {
        ko.applyBindings(this);
    }

    refreshModel(result: any): void {
        super.refreshModel(result);
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
    
    