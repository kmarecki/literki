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
            showOkButton: true,
            showCancelButton: true,
            cancelButtonText: "Nie",
            okButtonText: "Tak"
        });
    }

    protected showErrorDialogBox(message: string): void {
        this.showDialogBox(message, "Wystąpił błąd", null, {
            showOkButton: true,
            showDialogOverlay: true
        });
    }

    protected showPersistentInfoDialogBox(message: string): void {
        this.showDialogBox(message, "Uwaga", null, {
            showDialogOverlay: true
        });
    }

    protected showDialogBox(message: string,
                            title: string,
                            callback: (boolean) => void = null, 
                            options: {
                                showCancelButton?: boolean; 
                                showOkButton?: boolean;
                                showDialogOverlay?: boolean;
                                cancelButtonText?: string;
                                okButtonText?: string
                            } = null): void {
        this.hideDialogBox();

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
        okButton.hide();
        if (options) {
            if (options.showCancelButton) {
                cancelButton.show();
            }
            if (options.showOkButton) {
                okButton.show();
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

    protected cancelClick(): void {
        this.hideDialogBox();
        if (this.dialogBoxCallback) {
            this.dialogBoxCallback(false);
        }
    }

    protected okClick(): void {
        this.hideDialogBox();
        if (this.dialogBoxCallback) {
            this.dialogBoxCallback(true);
        }
    }

    protected hideDialogBox(): void {
        var dialogoverlay = $("#dialogoverlay");
        var dialogbox = $("#dialogbox");

        dialogbox.hide();
        dialogoverlay.hide();
    }
} 