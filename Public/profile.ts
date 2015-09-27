import master = require('./master');
import ko = require('knockout');
import $ = require('jquery');
import moment = require('moment');

import entities = require('./scripts/entities');

class LanguageModel {
    description: string;
    shortcut: string;

    constructor(description: string, shortcut: string) {
        this.description = description;
        this.shortcut = shortcut;
    }
}

class ProfileModel extends master.MasterModel {
    userName = ko.observable("");
    email = ko.observable("");
    defaultLanguage = ko.observable<LanguageModel>();
    availableLanguages = ko.observableArray([
        new LanguageModel("polski", "pl"),
        new LanguageModel("english", "en"),
        new LanguageModel("deutsch", "de")
    ]);

    constructor() {
        super();
        this.defaultLanguage(this.availableLanguages()[1]);
    }
}

class ProfileController extends master.MasterControler<ProfileModel> {

    init(): void {
        //$.ajax({
        //    type: "GET",
        //    url: "/player/get",
        //    dataType: "json",
        //    success: (result) => {
        //        this.refreshModel(result);
        //        ko.applyBindings(this);
        //    }
        //});
        super.callGETMethod("/player/get", undefined, (result) => {
            this.refreshModel(result);
            ko.applyBindings(this);
        });
    }

    refreshModel(result: any): void {
        super.refreshModel(result);
        var userProfile = <entities.UserProfile>result.userProfile;

        this.model.userName(userProfile.userName);
        this.model.email(userProfile.email);
    }

    protected cancelClick(): void {
        history.back();
    }

    protected okClick(): void {
        history.back();
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
    
    