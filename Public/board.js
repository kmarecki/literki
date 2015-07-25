/// <reference path=".\typings\kineticjs\kineticjs.d.ts"/>
define(["require", "exports", './scripts/literki', './scripts/system', 'knockout', 'jquery', 'Kinetic'], function (require, exports, Literki, System, ko, $, Kinetic) {
    var FIELD_SIZE;
    var LINE_WIDTH;
    var BOARD_MARGIN;
    function setupDisplay(fieldSize) {
        FIELD_SIZE = fieldSize;
        LINE_WIDTH = fieldSize / 15;
        BOARD_MARGIN = fieldSize / 4;
    }
    var game;
    var viewModel;
    var Board = (function () {
        function Board(container) {
            this.bonusColors = {};
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
        Board.prototype.initalizeFields = function () {
            this.bonusColors[Literki.BoardFieldBonus.DoubleLetter] = "lightblue";
            this.bonusColors[Literki.BoardFieldBonus.DoubleWord] = "lightpink";
            this.bonusColors[Literki.BoardFieldBonus.TripleLetter] = "blue";
            this.bonusColors[Literki.BoardFieldBonus.TripleWord] = "red";
            this.bonusColors[Literki.BoardFieldBonus.Start] = "lightpink";
            this.bonusColors[Literki.BoardFieldBonus.None] = "darkgreen";
        };
        Board.prototype.drawGameState = function () {
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
            context.beginPath(), context.rect(0, 0, canvas.width, canvas.height);
            context.fillStyle = "#FFFFCC";
            context.fill();
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
            for (var x = BOARD_MARGIN; x <= maxlines; x += FIELD_SIZE) {
                context.beginPath();
                context.moveTo(x, BOARD_MARGIN);
                context.lineTo(x, maxlines);
                context.lineWidth = LINE_WIDTH;
                context.strokeStyle = "black";
                context.stroke();
            }
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
            for (var x = 1; x < Literki.MAX_LETTERS; x++) {
                context.beginPath();
                context.moveTo(BOARD_MARGIN + x * FIELD_SIZE, lettersTop);
                context.lineTo(BOARD_MARGIN + x * FIELD_SIZE, lettersTop + FIELD_SIZE);
                context.strokeStyle = "black";
                context.stroke();
            }
            var letterLayer = new Kinetic.Layer();
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
            var currentUser = game.getCurrentUser();
            if (currentUser != null) {
                // moving letters
                var foregroundLayer = new Kinetic.Layer();
                for (var x = 0; x < Literki.MAX_LETTERS; x++) {
                    if (x < currentUser.freeLetters.length) {
                        var letter = currentUser.freeLetters[x];
                        var xpos = BOARD_MARGIN + x * FIELD_SIZE;
                        foregroundLayer.add(this.getLetterGroup(xpos, lettersTop, letter, x, true));
                    }
                }
                this.stage.add(foregroundLayer);
            }
        };
        Board.prototype.getLetterGroup = function (x, y, letter, index, foreground) {
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
                y: (FIELD_SIZE - FIELD_SIZE * 2 / 3) / 2,
                text: letter.toUpperCase(),
                fontFamily: "Calibri",
                fontSize: FIELD_SIZE * 2 / 3,
                fontStyle: "bold",
                fill: "black",
            });
            var pointsText = new Kinetic.Text({
                width: FIELD_SIZE,
                height: FIELD_SIZE,
                align: "right",
                x: -5,
                y: FIELD_SIZE - 15,
                text: Literki.LETTERS[letter].points.toString(),
                fontFamily: "Calibri",
                fontSize: 14,
                fontStyle: "bold",
                fill: "black",
            });
            var letterGroup = new Kinetic.Group({
                x: x,
                y: y,
                draggable: foreground
            });
            if (foreground) {
                letterGroup.on('dragend', function (e) {
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
                    game.putFreeLetter(letter, index, fieldX, fieldY);
                    var newWords = game.getNewWords();
                    viewModel.setNewWords(newWords);
                });
            }
            letterGroup.add(letterRect);
            letterGroup.add(letterText);
            letterGroup.add(pointsText);
            return letterGroup;
        };
        Board.prototype.clearBoard = function () {
            this.stage.clear();
        };
        return Board;
    })();
    var game;
    var BoardViewModelWord = (function () {
        function BoardViewModelWord() {
        }
        return BoardViewModelWord;
    })();
    var PlayerViewModel = (function () {
        function PlayerViewModel(parent) {
            this.isCurrentPlayer = ko.observable(false);
            this.playerName = ko.observable("");
            this.points = ko.observable(0);
            this.remainingTime = ko.observable('');
            this.parentModel = parent;
        }
        PlayerViewModel.prototype.findAndRefresh = function (players, currentPlayer) {
            var _this = this;
            players.forEach(function (p) {
                if (p.playerName == _this.playerName()) {
                    _this.refresh(p, currentPlayer);
                }
            });
        };
        PlayerViewModel.prototype.refresh = function (player, currentPlayer) {
            this.playerName(player.playerName);
            this.points(player.getPoints());
            this.remainingTime(System.formatSeconds(player.remainingTime, "mm:ss"));
            this.isCurrentPlayer(player.userId == game.currentUserId);
        };
        return PlayerViewModel;
    })();
    var BoardViewModel = (function () {
        function BoardViewModel() {
            this.self = this;
            this.newWords = ko.observableArray();
            this.allPlayers = new Array();
            this.errorMessage = ko.observable("");
        }
        BoardViewModel.prototype.getNewWords = function () {
            return this.newWords;
        };
        BoardViewModel.prototype.setNewWords = function (newWords) {
            var _this = this;
            this.cleanNewWords();
            newWords.forEach(function (word) { return _this.newWords.push(word); });
        };
        BoardViewModel.prototype.cleanNewWords = function () {
            this.newWords.removeAll();
        };
        BoardViewModel.prototype.getPlayers = function (start, end) {
            var _this = this;
            var players = new Array();
            game.getPlayers().slice(start, end).forEach(function (p) {
                var playerModel = new PlayerViewModel(_this);
                playerModel.refresh(p, game.getCurrentPlayer());
                players.push(playerModel);
                _this.allPlayers.push(playerModel);
            });
            return players;
        };
        BoardViewModel.prototype.getPlayersRow = function () {
            return game.getPlayers().length > 2 ? [0, 1] : [0];
        };
        BoardViewModel.prototype.refreshBoard = function () {
            this.board.clearBoard();
            this.board.drawGameState();
        };
        BoardViewModel.prototype.runState = function (state) {
            game.runState(state);
            viewModel.board.drawGameState();
        };
        BoardViewModel.prototype.init = function () {
            var _this = this;
            var gameId = System.urlParam("gameId");
            var join = System.urlParam("join");
            if (join) {
                $.ajax({
                    type: "GET",
                    url: "/game/join",
                    data: { gameId: gameId },
                    dataType: "json",
                    success: function (result) { return _this.initRefresh(result); }
                });
            }
            else {
                if (gameId != null) {
                    $.ajax({
                        type: "GET",
                        url: "/game/get",
                        data: { gameId: gameId },
                        dataType: "json",
                        success: function (result) { return _this.initRefresh(result); }
                    });
                }
                else {
                    $.ajax({
                        type: "GET",
                        url: "/game/new",
                        dataType: "json",
                        success: function (result) { return _this.initRefresh(result); }
                    });
                }
            }
        };
        BoardViewModel.prototype.initRefresh = function (result) {
            game = new Literki.GameRun(result.userId);
            this.refreshModel(result);
            this.refreshBoard();
            ko.applyBindings(this);
        };
        BoardViewModel.prototype.alive = function () {
            var _this = this;
            $.ajax({
                type: "POST",
                url: "/game/alive",
                contentType: 'application/json',
                data: JSON.stringify({
                    gameId: game.getState().gameId,
                    currentPlayerId: game.getCurrentPlayer().userId
                }),
                dataType: "json",
                success: function (result) {
                    _this.errorMessage(result.errorMessage);
                    if (!result.forceRefresh) {
                        if (result.remainingTime != null) {
                            game.getCurrentPlayer().remainingTime = result.remainingTime;
                        }
                        _this.refreshPlayerModels();
                    }
                    else {
                        _this.refreshClick();
                    }
                }
            });
        };
        BoardViewModel.prototype.refreshClick = function () {
            this.callGameMethod("get");
        };
        BoardViewModel.prototype.startClick = function () {
            this.callGameMethod("start");
        };
        BoardViewModel.prototype.pauseClick = function () {
            this.callGameMethod("pause");
        };
        BoardViewModel.prototype.foldClick = function () {
            this.callGameMethod("fold");
        };
        BoardViewModel.prototype.callGameMethod = function (name) {
            var _this = this;
            $.ajax({
                type: "GET",
                url: "/game/" + name,
                data: { gameId: game.getState().gameId },
                dataType: "json",
                success: function (result) {
                    _this.refreshModel(result);
                    _this.refreshBoard();
                }
            });
        };
        BoardViewModel.prototype.moveClick = function () {
            var _this = this;
            var move = game.getActualMove();
            $.ajax({
                type: "POST",
                url: "/game/move",
                contentType: 'application/json',
                data: JSON.stringify(move),
                dataType: "json",
                success: function (result) {
                    _this.refreshModel(result);
                    _this.refreshBoard();
                }
            });
        };
        BoardViewModel.prototype.refreshModel = function (result) {
            this.errorMessage(result.errorMessage);
            if (result.state != null) {
                var state = Literki.GameState.fromJSON(result.state);
                game.runState(state);
                this.cleanNewWords();
            }
            this.refreshPlayerModels();
        };
        BoardViewModel.prototype.refreshPlayerModels = function () {
            if (game != null) {
                this.allPlayers.forEach(function (p) { return p.findAndRefresh(game.getPlayers(), game.getCurrentPlayer()); });
            }
        };
        return BoardViewModel;
    })();
    function init() {
        var boardDiv = document.getElementById("boardDiv");
        boardDiv.style.width = screen.availWidth / 2 + "px";
        boardDiv.style.height = screen.availHeight * 0.85 + "px";
        var infoDiv = document.getElementById("infoDiv");
        infoDiv.style.width = screen.availWidth / 2 - 50 + "px";
        infoDiv.style.height = boardDiv.style.height;
        var debugLabel = document.getElementById("debugLabel");
        setupDisplay(screen.availHeight / 20);
        viewModel = new BoardViewModel();
        viewModel.board = new Board("boardDiv");
        viewModel.init();
        setInterval(function () {
            debugLabel.textContent = screen.availWidth + " X " + screen.availHeight + " " + new Date().toLocaleTimeString();
            viewModel.alive();
        }, 1000);
    }
    exports.init = init;
    window.onresize = function () {
        viewModel.refreshBoard();
    };
});
//# sourceMappingURL=board.js.map