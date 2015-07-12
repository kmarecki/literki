var main;
(function (main) {
    var GameViewModel = (function () {
        function GameViewModel() {
        }
        return GameViewModel;
    })();
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
                _this.games.push(gameModel);
            });
        };
        return MainViewModel;
    })();
    var viewModel;
    window.onload = function () {
        viewModel = new MainViewModel();
        viewModel.init();
    };
})(main || (main = {}));
//# sourceMappingURL=main.js.map