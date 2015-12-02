var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
define(["require", "exports", './master', 'knockout', 'jquery'], function (require, exports, master, ko, $) {
    var NewGameModel = (function (_super) {
        __extends(NewGameModel, _super);
        function NewGameModel() {
            _super.call(this);
            this.playersLimit = ko.observable("");
            this.timeLimit = ko.observable("");
        }
        return NewGameModel;
    })(master.MasterModel);
    var NewGameController = (function (_super) {
        __extends(NewGameController, _super);
        function NewGameController() {
            _super.apply(this, arguments);
        }
        NewGameController.prototype.init = function () {
            ko.applyBindings(this);
        };
        NewGameController.prototype.refreshModel = function (result) {
            _super.prototype.refreshModel.call(this, result);
        };
        NewGameController.prototype.cancelClick = function () {
            history.back();
        };
        NewGameController.prototype.newGameClick = function () {
            var _this = this;
            $.ajax({
                type: "GET",
                url: "/game/new",
                dataType: "json",
                success: function (result) {
                    if (result.state) {
                        var gameId = result.state.gameId;
                        var url = "board.html?gameId=" + gameId + "&join=1";
                        location.href = url;
                    }
                    else {
                        _this.showErrorDialogBox("Nie udało się utworzyć nowej gry");
                    }
                }
            });
        };
        return NewGameController;
    })(master.MasterControler);
    var controller = new NewGameController();
    function init() {
        master.init();
        master.hideBoardDiv();
        var model = new NewGameModel();
        controller.model = model;
        controller.init();
    }
    exports.init = init;
});
//# sourceMappingURL=newgame.js.map