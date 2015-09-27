/// <reference path="./typings/jqueryui/jqueryui.d.ts" />
define(["require", "exports", "knockout", "jquery"], function (require, exports, ko, $) {
    var MasterModel = (function () {
        function MasterModel() {
            this.errorMessage = ko.observable("");
        }
        return MasterModel;
    })();
    exports.MasterModel = MasterModel;
    var MasterControler = (function () {
        function MasterControler() {
        }
        MasterControler.prototype.refreshModel = function (result) {
            this.model.errorMessage(result.errorMessage);
            if (result.errorMessage) {
                this.showErrorDialogBox(result.errorMessage);
            }
        };
        MasterControler.prototype.showAskDialogBox = function (message, callback) {
            this.showDialogBox(message, "Pytanie", callback, {
                showOkButton: true,
                showCancelButton: true,
                cancelButtonText: "Nie",
                okButtonText: "Tak"
            });
        };
        MasterControler.prototype.showErrorDialogBox = function (message) {
            this.showDialogBox(message, "Wystąpił błąd", null, {
                showOkButton: true,
                showDialogOverlay: true
            });
        };
        MasterControler.prototype.showPersistentInfoDialogBox = function (message) {
            this.showDialogBox(message, "Uwaga", null, {
                showDialogOverlay: true
            });
        };
        MasterControler.prototype.showDialogBox = function (message, title, callback, options) {
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
        MasterControler.prototype.dialog_cancelClick = function () {
            this.hideDialogBox();
            if (this.dialogBoxCallback) {
                this.dialogBoxCallback(false);
            }
        };
        MasterControler.prototype.dialog_okClick = function () {
            this.hideDialogBox();
            if (this.dialogBoxCallback) {
                this.dialogBoxCallback(true);
            }
        };
        MasterControler.prototype.hideDialogBox = function () {
            var dialogoverlay = $("#dialogoverlay");
            var dialogbox = $("#dialogbox");
            dialogbox.hide();
            dialogoverlay.hide();
        };
        MasterControler.prototype.ajaxErrorHandler = function (xhr, ajaxOptions, thrownError) {
            var message = xhr.responseText ? xhr.responseText : "Brak połączenia z serwerem gry.";
            this.showErrorDialogBox(message);
        };
        MasterControler.prototype.callGETMethod = function (name, data, success) {
            var _this = this;
            $.ajax({
                type: "GET",
                url: name,
                data: data,
                dataType: "json",
                success: function (result) { return success(result); },
                error: function (xhr, ajaxOptions, thrownError) { return _this.ajaxErrorHandler(xhr, ajaxOptions, thrownError); }
            });
        };
        MasterControler.prototype.callPOSTMethod = function (name, data, success) {
            var _this = this;
            $.ajax({
                type: "POST",
                url: name,
                contentType: "application/json",
                data: JSON.stringify(data),
                dataType: "json",
                success: function (result) { return success(result); },
                error: function (xhr, ajaxOptions, thrownError) { return _this.ajaxErrorHandler(xhr, ajaxOptions, thrownError); }
            });
        };
        return MasterControler;
    })();
    exports.MasterControler = MasterControler;
    function init() {
        $.ajaxSetup({ cache: false });
    }
    exports.init = init;
    function hideBoardDiv() {
        $("#boardDiv").hide();
        $("#infoDiv").css("float", "right");
    }
    exports.hideBoardDiv = hideBoardDiv;
});
//# sourceMappingURL=master.js.map