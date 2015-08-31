/// <reference path="./typings/jqueryui/jqueryui.d.ts" />

import ko = require("knockout");
import $ = require("jquery");

export class MasterModel {

    errorMessage = ko.observable("");
} 

export class MasterControler<TModel extends MasterModel> {
    private dialogBoxCallback: (boolean) => void;

    model: TModel;

    protected refreshModel(result: any): void {
        this.model.errorMessage(result.errorMessage);
        if (result.errorMessage) {
            this.showErrorDialogBox(result.errorMessage);
        }
    }

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

    protected dialog_cancelClick(): void {
        this.hideDialogBox();
        if (this.dialogBoxCallback) {
            this.dialogBoxCallback(false);
        }
    }

    protected dialog_okClick(): void {
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

    protected ajaxErrorHandler(xhr: JQueryXHR, ajaxOptions, thrownError): void {
        var message = xhr.responseText ? xhr.responseText : "Brak połączenia z serwerem gry.";
        this.showErrorDialogBox(message);
    }
}

export function init(): void {
    $.ajaxSetup({ cache: false });
}

export function hideBoardDiv(): void {
    $("#boardDiv").hide();
    $("#infoDiv").css("float", "right");
}

