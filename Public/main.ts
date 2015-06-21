module main {
    class GameViewModel {
        gameId: number;
    }

    class MainViewModel {

        private self = this;
        games = ko.observableArray<GameViewModel>();

        init(): void {
            $.ajax({
                type: "GET",
                url: "/games/list",
                dataType: "json",
                success: (result) => {
                    this.refreshModel(result.games);
                    ko.applyBindings(this);
                }
            });
        }

        refreshModel(games: Array<any>): void {
            this.games.removeAll();
            games.forEach(g => {
                var gameModel = new GameViewModel();
                gameModel.gameId = g.gameId;
                this.games.push(gameModel);
            });
        }
    }

    var viewModel: MainViewModel;

    window.onload = () => {
        viewModel = new MainViewModel();
        viewModel.init();
    }
}