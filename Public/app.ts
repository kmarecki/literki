/// <reference path="./typings/jqueryui/jqueryui.d.ts" />

import ko = require("knockout");
import $ = require("jquery");

export class BaseViewModel {

    errorMessage = ko.observable("");

    protected refreshModel(result: any): void {
        this.errorMessage(result.errorMessage);
        if (result.errorMessage) {
            this.showErrorDialogBox(result.errorMessage);
        }
    }

    private dialogBoxCallback: (boolean) => void;

    protected showAskDialogBox(message: string, callback: (boolean) => void): void {
        this.showDialogBox(message, "Pytanie", callback, {
            showCancelButton: true,
            cancelButtonText: "Nie",
            okButtonText: "Tak"
        });
    }

    protected showErrorDialogBox(message: string): void {
        this.showDialogBox(message, "Wystąpił błąd", null , {
            showDialogOverlay: true
        });
    }

    protected showDialogBox(message: string,
                            title: string,
                            callback: (boolean) => void = null, 
                            options: {
                                showCancelButton?: boolean; 
                                showDialogOverlay?: boolean;
                                cancelButtonText?: string;
                                okButtonText?: string
                            } = null): void {
        var winW = window.innerWidth;
        var winH = window.innerHeight;

        var dialogoverlay = $("#dialogoverlay");
        var dialogbox = $("#dialogbox");
        var dialogboxhead = $("#dialogboxhead");
        var dialogboxbody = $("#dialogboxbody");
        var cancelButton = dialogbox.find("#cancelButton");
        var okButton = dialogbox.find("#okButton");

        dialogoverlay.css({ height: winH + "px" });
        dialogbox.css({
            left: (winW / 2) - (550 * .5) + "px",
            top: "100px"
        });
        dialogboxhead.html(title);
        dialogboxbody.html(message);

        cancelButton.hide();
        if (options) {
            if (options.showCancelButton) {
                cancelButton.show();
            }
            if (options.cancelButtonText) {
                cancelButton.text(options.cancelButtonText);
            }
            if (options.okButtonText) {
                okButton.text(options.okButtonText);
            }
            if (options.showDialogOverlay) {
                dialogoverlay.show();
            }
        }

        dialogbox.show();
        dialogbox.draggable();
        
        this.dialogBoxCallback = callback;
    }

    private cancelClick(): void {
        this.hideDialogBox();
        if (this.dialogBoxCallback) {
            this.dialogBoxCallback(false);
        }
    }

    private okClick(): void {
        this.hideDialogBox();
        if (this.dialogBoxCallback) {
            this.dialogBoxCallback(true);
        }
    }

    private hideDialogBox(): void {
        var dialogoverlay = $("#dialogoverlay");
        var dialogbox = $("#dialogbox");

        dialogbox.hide();
        dialogoverlay.hide();
    }
} 