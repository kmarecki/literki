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
            this.max = FIELD_SIZE * Literki.ROW_SIZE;
            this.maxlines = BOARD_MARGIN + this.max;
            this.lettersTop = BOARD_MARGIN + this.maxlines + BOARD_MARGIN;
            this.changeLettersLeft = BOARD_MARGIN + (Literki.MAX_LETTERS + 1) * FIELD_SIZE;
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
            this.bonusColors[1 /* DoubleLetter */] = "lightblue";
            this.bonusColors[3 /* DoubleWord */] = "lightpink";
            this.bonusColors[2 /* TripleLetter */] = "blue";
            this.bonusColors[4 /* TripleWord */] = "red";
            this.bonusColors[5 /* Start */] = "lightpink";
            this.bonusColors[0 /* None */] = "darkgreen";
        };
        Board.prototype.drawGameState = function () {
            if (game == null || game.getState() == null) {
                return;
            }
            var backgroundLayer = new Kinetic.Layer();
            this.stage.add(backgroundLayer);
            var canvas = backgroundLayer.getCanvas()._canvas;
            var context = canvas.getContext("2d");
            var backgroundColor = "#FFFFCC";
            //background
            context.beginPath(), context.rect(0, 0, canvas.width, canvas.height);
            context.fillStyle = backgroundColor;
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
            for (var x = BOARD_MARGIN; x <= this.maxlines; x += FIELD_SIZE) {
                context.beginPath();
                context.moveTo(x, BOARD_MARGIN);
                context.lineTo(x, this.maxlines);
                context.lineWidth = LINE_WIDTH;
                context.strokeStyle = "black";
                context.stroke();
            }
            for (var y = BOARD_MARGIN; y <= this.maxlines; y += FIELD_SIZE) {
                context.beginPath();
                context.moveTo(BOARD_MARGIN, y);
                context.lineTo(this.maxlines, y);
                context.lineWidth = LINE_WIDTH;
                context.strokeStyle = "black";
                context.stroke();
            }
            //letters field
            context.beginPath();
            context.rect(BOARD_MARGIN, this.lettersTop, FIELD_SIZE * Literki.MAX_LETTERS, FIELD_SIZE);
            context.fillStyle = "green";
            context.fill();
            context.strokeStyle = "black";
            context.stroke();
            for (var x = 1; x < Literki.MAX_LETTERS; x++) {
                context.beginPath();
                context.moveTo(BOARD_MARGIN + x * FIELD_SIZE, this.lettersTop);
                context.lineTo(BOARD_MARGIN + x * FIELD_SIZE, this.lettersTop + FIELD_SIZE);
                context.strokeStyle = "black";
                context.stroke();
            }
            //change letters field
            context.beginPath();
            context.rect(this.changeLettersLeft, this.lettersTop, FIELD_SIZE * Literki.MAX_LETTERS, FIELD_SIZE);
            context.fillStyle = backgroundColor;
            context.fill();
            context.strokeStyle = "black";
            context.stroke();
            for (var x = 1; x < Literki.MAX_LETTERS; x++) {
                context.beginPath();
                context.moveTo(this.changeLettersLeft + x * FIELD_SIZE, this.lettersTop);
                context.lineTo(this.changeLettersLeft + x * FIELD_SIZE, this.lettersTop + FIELD_SIZE);
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
                        foregroundLayer.add(this.getLetterGroup(xpos, this.lettersTop, letter, x, true));
                    }
                }
                this.stage.add(foregroundLayer);
            }
        };
        Board.prototype.getLetterGroup = function (x, y, letter, index, foreground) {
            var _this = this;
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
                    var dragEnd = _this.getDragEnd(letterGroup);
                    var tween = new Kinetic.Tween({
                        node: letterGroup,
                        x: dragEnd.x,
                        y: dragEnd.y,
                        duration: 0.1
                    });
                    tween.play();
                    switch (dragEnd.endType) {
                        case 0 /* BoardField */: {
                            game.putLetterOnBoard(letter, index, dragEnd.fieldX, dragEnd.fieldY);
                            viewModel.refreshBindings();
                            break;
                        }
                        case 1 /* ExchangeLetter */:
                            game.addLetterToExchange(letter, index);
                            viewModel.refreshBindings();
                            break;
                        case 2 /* FreeLetter */:
                            game.removeLetter(letter, index);
                            viewModel.refreshBindings();
                            break;
                    }
                });
            }
            letterGroup.add(letterRect);
            letterGroup.add(letterText);
            letterGroup.add(pointsText);
            return letterGroup;
        };
        Board.prototype.getDragEnd = function (letterGroup) {
            var x = letterGroup.x() - BOARD_MARGIN;
            var y = letterGroup.y() - BOARD_MARGIN;
            var fieldX = Math.floor(x / FIELD_SIZE);
            var fieldY = Math.floor(y / FIELD_SIZE);
            var floorX = fieldX * FIELD_SIZE;
            var floorY = Math.floor(y / FIELD_SIZE) * FIELD_SIZE;
            if (y < this.lettersTop) {
                //board fields
                x = x <= floorX + FIELD_SIZE / 2 ? floorX : floorX + FIELD_SIZE;
                x += BOARD_MARGIN;
                y = y <= floorY + FIELD_SIZE / 2 ? floorY : floorY + FIELD_SIZE;
                y += BOARD_MARGIN;
            }
            else {
                //free letters fields
                x = x <= floorX + FIELD_SIZE / 2 ? floorX : floorX + FIELD_SIZE;
                x += BOARD_MARGIN;
                y = this.lettersTop;
            }
            var endType = 0 /* BoardField */;
            if (fieldY >= Literki.ROW_SIZE) {
                endType = fieldX > Literki.ROW_SIZE / 2 ? 1 /* ExchangeLetter */ : 2 /* FreeLetter */;
            }
            return { x: x, y: y, fieldX: fieldX, fieldY: fieldY, endType: endType };
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
            this.changeLetters = ko.observableArray();
            this.allPlayers = new Array();
            this.errorMessage = ko.observable("");
        }
        BoardViewModel.prototype.setNewWords = function (newWords) {
            var _this = this;
            this.cleanNewWords();
            newWords.forEach(function (word) { return _this.newWords.push(word); });
        };
        BoardViewModel.prototype.cleanNewWords = function () {
            this.newWords.removeAll();
        };
        BoardViewModel.prototype.setChangeLetters = function (changeLetters) {
            var _this = this;
            this.cleanChangeLetters();
            changeLetters.forEach(function (letter) { return _this.changeLetters.push(letter); });
        };
        BoardViewModel.prototype.cleanChangeLetters = function () {
            this.changeLetters.removeAll();
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
        BoardViewModel.prototype.refreshBindings = function () {
            var newWords = game.getNewWords();
            this.setNewWords(newWords);
            var changeLetters = game.getChangeLetters();
            this.setChangeLetters(changeLetters);
        };
        BoardViewModel.prototype.refreshModel = function (result) {
            this.errorMessage(result.errorMessage);
            if (result.state != null) {
                var state = Literki.GameState.fromJSON(result.state);
                game.runState(state);
                this.cleanNewWords();
                this.cleanChangeLetters();
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