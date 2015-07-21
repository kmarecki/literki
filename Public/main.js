define(["require", "exports", './scripts/literki', 'knockout', 'jquery'], function (require, exports, Literki, ko, $) {
    var GameViewModel = (function () {
        function GameViewModel() {
        }
        GameViewModel.prototype.joinAction = function () {
            return this.runState == 0 /* Created */ ? "Dołącz" : "Obserwuj";
        };
        return GameViewModel;
    })();
    exports.GameViewModel = GameViewModel;
    var MainViewModel = (function () {
        function MainViewModel() {
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
                    _this.refreshModel(result.games);
                    ko.applyBindings(_this);
                }
            });
        };
        MainViewModel.prototype.refreshModel = function (games) {
            var _this = this;
            this.games.removeAll();
            games.forEach(function (g) {
                var gameModel = new GameViewModel();
                gameModel.gameId = g.gameId;
                gameModel.runState = g.runState;
                _this.games.push(gameModel);
            });
        };
        return MainViewModel;
    })();
    exports.MainViewModel = MainViewModel;
    function init() {
        var viewModel = new MainViewModel();
        viewModel.init();
    }
    exports.init = init;
});
//# sourceMappingURL=main.js.map