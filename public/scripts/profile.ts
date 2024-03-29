﻿/// <reference path="../../typings/main.d.ts"/>

import master = require('./master');
import ko = require('knockout');
import $ = require('jquery');
import _ = require('underscore');
import moment = require('moment');

import entities = require('../../scripts/shared/entities');

class LanguageModel {
    description: string;
    shortcut: string;

    constructor(description: string, shortcut: string) {
        this.description = description;
        this.shortcut = shortcut;
    }
}

class ProfileModel extends master.MasterModel {
    private entity: entities.UserProfile;

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
    }

    fromEntity(userProfile: entities.UserProfile): void {
        this.entity = userProfile;

        this.userName(userProfile.userName);
        this.email(userProfile.email);
        this.defaultLanguage(_.find(this.availableLanguages(), lang => lang.shortcut == userProfile.defaultLanguage));
        if (!this.defaultLanguage()) {
            this.defaultLanguage(this.availableLanguages()[1]);
        }
    }

    toEntity(): entities.UserProfile {
        this.entity.email = this.email();
        this.entity.userName = this.userName();
        this.entity.defaultLanguage = this.defaultLanguage().shortcut;
        return this.entity;
    }
}

class ProfileController extends master.MasterControler<ProfileModel> {

    init(): void {
        super.callGETMethod("/player/get", undefined, (result) => {
            this.refreshModel(result);
            ko.applyBindings(this);
        });
    }

    refreshModel(result: any): void {
        super.refreshModel(result);
        var userProfile = <entities.UserProfile>result.userProfile;

        this.model.fromEntity(userProfile);
    }


    protected cancelClick(): void {
        history.back();
    }

    protected okClick(): void {
        var userProfile = this.model.toEntity();
        super.callPOSTMethod("/player/update", userProfile, (result) => {
            this.refreshModel(result);
            if (!result.errorMessage) {
                history.back();
            }
        });
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
    
    