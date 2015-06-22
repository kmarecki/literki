/// <reference path=".\typings\kineticjs\kineticjs.d.ts"/>
/// <reference path=".\typings\knockout\knockout.d.ts"/>
/// <reference path=".\typings\jquery\jquery.d.ts"/>
/// <reference path=".\scripts\literki.ts"/>

module board {
    var FIELD_SIZE: number;
    var LINE_WIDTH: number;
    var BOARD_MARGIN: number;

    function setupDisplay(fieldSize: number): void {
        FIELD_SIZE = fieldSize;
        LINE_WIDTH = fieldSize / 15;
        BOARD_MARGIN = fieldSize / 4;
    }

    class Board {
        private stage: Kinetic.IStage;
        private bonusColors: { [id: number]: string; } = {};
        private container: string;

        constructor(container: string) {
            this.container = container;
            //var width = BOARD_MARGIN * 2 + ROW_SIZE * FIELD_SIZE;
            //var height = BOARD_MARGIN * 2 + ROW_SIZE * FIELD_SIZE + BOARD_MARGIN * 2 + FIELD_SIZE;
            var containerElem = document.getElementById(container);
            this.stage = new Kinetic.Stage({
                container: container,
                width: containerElem.clientWidth,
                height: containerElem.clientHeight
            });

            this.initalizeFields();
        }

        private initalizeFields(): void {

            this.bonusColors[Literki.BoardFieldBonus.DoubleLetter] = "lightblue";
            this.bonusColors[Literki.BoardFieldBonus.DoubleWord] = "lightpink";
            this.bonusColors[Literki.BoardFieldBonus.TripleLetter] = "blue"
            this.bonusColors[Literki.BoardFieldBonus.TripleWord] = "red";
            this.bonusColors[Literki.BoardFieldBonus.Start] = "lightpink";
            this.bonusColors[Literki.BoardFieldBonus.None] = "darkgreen";
        }

        drawGameState(game: Literki.GameRun): void {
            if (game == null || game.getState() == null) {
                return;
            }

            var backgroundLayer = new Kinetic.Layer();
            this.stage.add(backgroundLayer);

            var canvas = backgroundLayer.getCanvas()._canvas;
            var context = canvas.getContext("2d");

            var max = FIELD_SIZE * Literki.ROW_SIZE;
            var maxlines = BOARD_MARGIN + max;

            //background
            context.beginPath(),
            context.rect(0, 0, canvas.width, canvas.height);
            context.fillStyle = "#FFFFCC";
            context.fill();

            //board fields
            for (var x = 0; x < Literki.ROW_SIZE; x++) {
                for (var y = 0; y < Literki.ROW_SIZE; y++) {
                    var xpos = BOARD_MARGIN + x * FIELD_SIZE;
                    var ypos = BOARD_MARGIN + y * FIELD_SIZE;
                    var value = game.board.getFieldValue(x, y);
                    if (value == null || value.trim() != "") {
                        var bonus = game.board.getFieldBonus(x, y);
                        var fieldColor = this.bonusColors[bonus];
                        context.beginPath();
                        context.rect(xpos, ypos, FIELD_SIZE, FIELD_SIZE);
                        context.fillStyle = fieldColor;
                        context.fill();
                    }
                }
            }

            //vertical lines
            for (var x = BOARD_MARGIN; x <= maxlines; x += FIELD_SIZE) {
                context.beginPath();
                context.moveTo(x, BOARD_MARGIN);
                context.lineTo(x, maxlines);
                context.lineWidth = LINE_WIDTH;
                context.strokeStyle = "black";
                context.stroke();
            }

            //horizontal lines
            for (var y = BOARD_MARGIN; y <= maxlines; y += FIELD_SIZE) {
                context.beginPath();
                context.moveTo(BOARD_MARGIN, y);
                context.lineTo(maxlines, y);
                context.lineWidth = LINE_WIDTH;
                context.strokeStyle = "black";
                context.stroke();
            }

            var lettersTop = BOARD_MARGIN + maxlines + BOARD_MARGIN;
            //letters field
            context.beginPath();
            context.rect(BOARD_MARGIN, lettersTop, FIELD_SIZE * Literki.MAX_LETTERS, FIELD_SIZE);
            context.fillStyle = "green";
            context.fill();
            context.strokeStyle = "black";
            context.stroke();

            //letters field lines
            for (var x = 1; x < Literki.MAX_LETTERS; x++) {
                context.beginPath();
                context.moveTo(BOARD_MARGIN + x * FIELD_SIZE, lettersTop);
                context.lineTo(BOARD_MARGIN + x * FIELD_SIZE, lettersTop + FIELD_SIZE);
                context.strokeStyle = "black";
                context.stroke();
            }

            var letterLayer = new Kinetic.Layer();

            //letter fields
            for (var x = 0; x < Literki.ROW_SIZE; x++) {
                for (var y = 0; y < Literki.ROW_SIZE; y++) {
                    var xpos = BOARD_MARGIN + x * FIELD_SIZE;
                    var ypos = BOARD_MARGIN + y * FIELD_SIZE;
                    var value = game.board.getFieldValue(x, y);
                    if (value != null && value.trim() != "") {
                        letterLayer.add(this.getLetterGroup(xpos, ypos, value, -1, false));
                    }
                }
            }

            this.stage.add(letterLayer);

            // moving letters
            var foregroundLayer = new Kinetic.Layer();

            for (var x = 0; x < Literki.MAX_LETTERS; x++) {
                if (x < game.getCurrentPlayer().freeLetters.length) {
                    var letter = game.getCurrentPlayer().freeLetters[x];
                    var xpos = BOARD_MARGIN + x * FIELD_SIZE;

                    foregroundLayer.add(this.getLetterGroup(xpos, lettersTop, letter, x, true));
                }
            }

            this.stage.add(foregroundLayer);
        }

        private getLetterGroup(x: number, y: number, letter: string, index: number, foreground: boolean): Kinetic.IGroup {
            var letterRect = new Kinetic.Rect({
                width: FIELD_SIZE,
                height: FIELD_SIZE,
                fill: "#FFFFCC",
                stroke: "black",
                strokeWidth: LINE_WIDTH,
                cornerRadius: 5
            });

            var letterText = new Kinetic.Text({
                width: FIELD_SIZE,
                height: FIELD_SIZE,
                align: "center",
                verticalAlign: "middle",
                text: letter.toUpperCase(),
                fontFamily: "Calibri",
                fontSize: 30,
                fontStyle: "bold",
                fill: "black",
            });

            var letterGroup = new Kinetic.Group({
                x: x,
                y: y,
                draggable: foreground
            });

            if (foreground) {
                letterGroup.on('dragend',(e) => {
                    var x = letterGroup.x() - BOARD_MARGIN;
                    var y = letterGroup.y() - BOARD_MARGIN;
                    var fieldX = Math.floor(x / FIELD_SIZE);
                    var fieldY = Math.floor(y / FIELD_SIZE);
                    var floorX = fieldX * FIELD_SIZE;
                    var floorY = Math.floor(y / FIELD_SIZE) * FIELD_SIZE;

                    x = x <= floorX + FIELD_SIZE / 2 ? floorX : floorX + FIELD_SIZE;
                    y = y <= floorY + FIELD_SIZE / 2 ? floorY : floorY + FIELD_SIZE;

                    x += BOARD_MARGIN;
                    y += BOARD_MARGIN;

                    var tween = new Kinetic.Tween({
                        node: letterGroup,
                        x: x,
                        y: y,
                        duration: 0.1
                    });
                    tween.play();

                    viewModel.game.putFreeLetter(letter, index, fieldX, fieldY);
                    var newWords = viewModel.game.getNewWords();
                    viewModel.setNewWords(newWords);
                });
            }

            letterGroup.add(letterRect);
            letterGroup.add(letterText);
            return letterGroup;
        }

        clearBoard(): void {
            this.stage.clear();
        }
    }

    class BoardViewModelWord {
        word: string;
        points: number;
    }

    class PlayerViewModel {
        isCurrentPlayer = ko.observable(false);
        playerName = ko.observable("");
        points = ko.observable(0);
        remainingTime = ko.observable(0);

        findAndRefresh(players: Literki.IGamePlayer[], currentPlayer: Literki.IGamePlayer): void {
            players.forEach(p => {
                if (p.playerName == this.playerName()) {
                    this.refresh(p, currentPlayer);
                }
            });
        }

        refresh(player: Literki.IGamePlayer, currentPlayer: Literki.IGamePlayer): void {
            this.playerName(player.playerName);
            this.remainingTime(player.remainingTime);
            this.points((<Literki.GamePlayer>player).getPoints());
            this.isCurrentPlayer(currentPlayer.playerName == this.playerName());
        }
    }

    class BoardViewModel {

        private self = this;
        private newWords = ko.observableArray<BoardViewModelWord>();
        private allPlayers = new Array<PlayerViewModel>();

        board: Board;
        game: Literki.GameRun;
        errorMessage = ko.observable("");

        getNewWords(): KnockoutObservableArray<BoardViewModelWord> {
            return this.newWords;
        }

        setNewWords(newWords: BoardViewModelWord[]): void {
            this.cleanNewWords();
            newWords.forEach(word => this.newWords.push(word));
        }

        private cleanNewWords(): void {
            this.newWords.removeAll();
        }

        getPlayers(start: number, end: number): PlayerViewModel[] {
            var players = new Array<PlayerViewModel>();

            this.game.getPlayers().slice(start, end).forEach(p => {
                var playerModel = new PlayerViewModel();
                playerModel.refresh(p, this.game.getCurrentPlayer());
                players.push(playerModel);
                this.allPlayers.push(playerModel);
            });

            return players;
        }

        getPlayersRow(): Number[] {
            return this.game.getPlayers().length > 2 ? [0, 1] : [0];
        }

        refreshBoard(): void {
            this.board.clearBoard();
            this.board.drawGameState(this.game);
        }

        runState(state: Literki.GameState): void {
            viewModel.game.runState(state);
            viewModel.board.drawGameState(viewModel.game);
        }

        init(): void {
            $.ajax({
                type: "GET",
                url: "/games/new",
                dataType: "json",
                success: (result) => {
                    this.game = new Literki.GameRun();
                    this.refreshModel(result);
                    this.refreshBoard();
                    ko.applyBindings(this);
                }
            });
        }

        refreshClick(): void {
            $.ajax({
                type: "GET",
                url: "/game/get",
                data: { gameId: this.game.getState().gameId },
                dataType: "json",
                success: (result) => {
                    this.refreshModel(result);
                    this.refreshBoard();
                }
            });
        }

        moveClick(): void {
            var move = this.game.getActualMove();
            $.ajax({
                type: "POST",
                url: "/game/move",
                contentType: 'application/json',
                data: JSON.stringify(move),
                dataType: "json",
                success: (result) => {
                    this.refreshModel(result);
                    this.refreshBoard();
                }
            });
        }

        private refreshModel(result: any): void {
            if (result.state != null) {
                var state = Literki.GameState.fromJSON(<Literki.IGameState>result.state);
                this.game.runState(state);
                this.cleanNewWords();
                this.refreshPlayerModels();
            }
            this.errorMessage(result.errorMessage);
        }

        private refreshPlayerModels(): void {
            this.allPlayers.forEach(p => p.findAndRefresh(this.game.getPlayers(), this.game.getCurrentPlayer()));
        }
    }

    var viewModel: BoardViewModel;

    window.onload = () => {

        var boardDiv = <HTMLElement>document.getElementById("boardDiv");
        boardDiv.style.width = screen.availWidth / 2 + "px";
        boardDiv.style.height = screen.availHeight * 0.9 + "px";

        var infoDiv = <HTMLElement>document.getElementById("infoDiv");
        infoDiv.style.width = screen.availWidth / 2 - 50 + "px";
        infoDiv.style.height = screen.availHeight * 0.9 + "px";

        var debugLabel = <HTMLLabelElement>document.getElementById("debugLabel");

        setInterval(() => {
            debugLabel.textContent = screen.availWidth + " X " + screen.availHeight + " " + new Date().toLocaleTimeString();
        }, 1000);

        setupDisplay(screen.availHeight / 20);

        viewModel = new BoardViewModel();
        viewModel.board = new Board("boardDiv");
        viewModel.init();
    }

    window.onresize = () => {
        viewModel.refreshBoard();
    }
}



   