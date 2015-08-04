/// <reference path="./typings/jqueryui/jqueryui.d.ts" />
define(["require", "exports", "knockout", "jquery"], function (require, exports, ko, $) {
    var BaseViewModel = (function () {
        function BaseViewModel() {
            this.errorMessage = ko.observable("");
        }
        BaseViewModel.prototype.refreshModel = function (result) {
            this.errorMessage(result.errorMessage);
            if (result.errorMessage) {
                this.showErrorMessage(result.errorMessage);
            }
        };
        BaseViewModel.prototype.showErrorMessage = function (errorMessage) {
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
        };
        BaseViewModel.prototype.closeMessageBoxClick = function () {
            $("#dialogbox").hide();
            $("#dialogoverlay").hide();
        };
        return BaseViewModel;
    })();
    exports.BaseViewModel = BaseViewModel;
});
//# sourceMappingURL=app.js.map