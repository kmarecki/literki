var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
define(["require", "exports", './app', './scripts/literki', 'knockout', 'jquery', 'moment'], function (require, exports, App, Literki, ko, $, moment) {
    var GameViewModel = (function () {
        function GameViewModel() {
        }
        GameViewModel.prototype.joinAction = function () {
            return this.runState == Literki.GameRunState.Created ? "Dołącz" : "Obserwuj";
        };
        return GameViewModel;
    })();
    var MainViewModel = (function (_super) {
        __extends(MainViewModel, _super);
        function MainViewModel() {
            _super.apply(this, arguments);
            this.self = this;
            this.games = ko.observableArray();
        }
        MainViewModel.prototype.init = function () {
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
        MainViewModel.prototype.refreshModel = function (result) {
            var _this = this;
            _super.prototype.refreshModel.call(this, result);
            var games = result.games;
            this.games.removeAll();
            games.forEach(function (g) {
                var gameModel = new GameViewModel();
                gameModel.gameId = g.gameId;
                gameModel.creationDate = g.creationDate ? moment(g.creationDate).format("DD.MM.YYYY hh:mm") : "";
                gameModel.runState = g.runState;
                _this.games.push(gameModel);
            });
        };
        return MainViewModel;
    })(App.BaseViewModel);
    function init() {
        $.ajaxSetup({ cache: false });
        var viewModel = new MainViewModel();
        viewModel.init();
    }
    exports.init = init;
});
//# sourceMappingURL=main.js.map