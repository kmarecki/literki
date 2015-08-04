/// <reference path="./typings/jqueryui/jqueryui.d.ts" />

import ko = require("knockout");
import $ = require("jquery");

export class BaseViewModel {

    errorMessage = ko.observable("");

    protected refreshModel(result: any): void {
        this.errorMessage(result.errorMessage);
        if (result.errorMessage) {
            this.showErrorMessage(result.errorMessage);
        }
    }

    private showErrorMessage(errorMessage: string): void {
        var winW = window.innerWidth;
        var winH = window.innerHeight;
        var dialogoverlay = document.getElementById("dialogoverlay");
        var dialogbox = document.getElementById("dialogbox");

        dialogoverlay.style.height = winH + "px";
        dialogbox.style.left = (winW / 2) - (550 * .5) + "px";
        dialogbox.style.top = "100px";
        document.getElementById("dialogboxhead").innerHTML = "Wystąpił błąd";
        document.getElementById("dialogboxbody").innerHTML = errorMessage;

        $("#dialogoverlay").show();

        $("#dialogbox").show();
        $("#dialogbox").draggable();

        
    }

    private closeMessageBoxClick(): void {
        $("#dialogbox").hide();
        $("#dialogoverlay").hide();
    }
} 