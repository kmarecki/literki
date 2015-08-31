var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
define(["require", "exports", './master', './scripts/literki', 'knockout', 'jquery', 'moment'], function (require, exports, master, literki, ko, $, moment) {
    var GameViewModel = (function () {
        function GameViewModel() {
        }
        GameViewModel.prototype.joinAction = function () {
            return this.runState == literki.GameRunState.Created ? "Dołącz" : "Obserwuj";
        };
        return GameViewModel;
    })();
    var MainModel = (function (_super) {
        __extends(MainModel, _super);
        function MainModel() {
            _super.apply(this, arguments);
            this.games = ko.observableArray();
        }
        return MainModel;
    })(master.MasterModel);
    var MainController = (function (_super) {
        __extends(MainController, _super);
        function MainController() {
            _super.apply(this, arguments);
        }
        MainController.prototype.init = function () {
            var _this = this;
            $.ajax({
                type: "GET",
                url: "/game/list",
                dataType: "json",
                success: function (result) {
                    _this.refreshModel(result);
                    ko.applyBindings(_this);
                }
            });
        };
        MainController.prototype.refreshModel = function (result) {
            var _this = this;
            _super.prototype.refreshModel.call(this, result);
            var games = result.games;
            this.model.games.removeAll();
            games.forEach(function (g) {
                var gameModel = new GameViewModel();
                gameModel.gameId = g.gameId;
                gameModel.creationDate = g.creationDate ? moment(g.creationDate).format("DD.MM.YYYY hh:mm") : "";
                gameModel.runState = g.runState;
                _this.model.games.push(gameModel);
            });
        };
        return MainController;
    })(master.MasterControler);
    var controller = new MainController();
    function init() {
        master.init();
        master.hideBoardDiv();
        var model = new MainModel();
        controller.model = model;
        controller.init();
    }
    exports.init = init;
});
//# sourceMappingURL=main.js.map