import master = require('./master');
import literki = require('./scripts/literki');
import ko = require('knockout');
import $ = require('jquery');
import moment = require('moment');


class ProfileModel extends master.MasterModel {
}

class ProfileController extends master.MasterControler<ProfileModel> {

    init(): void {
        $.ajax({
            type: "GET",
            url: "/player/get",
            dataType: "json",
            success: (result) => {
                this.refreshModel(result);
                ko.applyBindings(this);
            }
        });
    }

    refreshModel(result: any): void {
        super.refreshModel(result);
    }
}

var controller = new ProfileController();

export function init(): void  {
    master.init();
    master.hideBoardDiv();
    
    var model = new ProfileModel();
    controller.model = model;
    controller.init();
}
    
    