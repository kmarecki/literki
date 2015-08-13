/// <reference path="./typings/jqueryui/jqueryui.d.ts" />
define(["require", "exports", "knockout", "jquery"], function (require, exports, ko, $) {
    var BaseViewModel = (function () {
        function BaseViewModel() {
            this.errorMessage = ko.observable("");
        }
        BaseViewModel.prototype.refreshModel = function (result) {
            this.errorMessage(result.errorMessage);
            if (result.errorMessage) {
                this.showErrorDialogBox(result.errorMessage);
            }
        };
        BaseViewModel.prototype.showAskDialogBox = function (message, callback) {
            this.showDialogBox(message, "Pytanie", callback, {
                showOkButton: true,
                showCancelButton: true,
                cancelButtonText: "Nie",
                okButtonText: "Tak"
            });
        };
        BaseViewModel.prototype.showErrorDialogBox = function (message) {
            this.showDialogBox(message, "Wystąpił błąd", null, {
                showOkButton: true,
                showDialogOverlay: true
            });
        };
        BaseViewModel.prototype.showPersistentInfoDialogBox = function (message) {
            this.showDialogBox(message, "Uwaga", null, {
                showDialogOverlay: true
            });
        };
        BaseViewModel.prototype.showDialogBox = function (message, title, callback, options) {
            if (callback === void 0) { callback = null; }
            if (options === void 0) { options = null; }
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
        };
        BaseViewModel.prototype.cancelClick = function () {
            this.hideDialogBox();
            if (this.dialogBoxCallback) {
                this.dialogBoxCallback(false);
            }
        };
        BaseViewModel.prototype.okClick = function () {
            this.hideDialogBox();
            if (this.dialogBoxCallback) {
                this.dialogBoxCallback(true);
            }
        };
        BaseViewModel.prototype.hideDialogBox = function () {
            var dialogoverlay = $("#dialogoverlay");
            var dialogbox = $("#dialogbox");
            dialogbox.hide();
            dialogoverlay.hide();
        };
        BaseViewModel.prototype.ajaxErrorHandler = function (xhr, ajaxOptions, thrownError) {
            var message = xhr.responseText ? xhr.responseText : "Brak połączenia z serwerem gry.";
            this.showErrorDialogBox(message);
        };
        return BaseViewModel;
    })();
    exports.BaseViewModel = BaseViewModel;
});
//# sourceMappingURL=app.js.map