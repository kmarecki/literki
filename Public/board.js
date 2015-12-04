/// <reference path=".\typings\kineticjs\kineticjs.d.ts"/>
/// <reference path=".\typings\jqueryui\jqueryui.d.ts" />
/// <amd-dependency path="./scripts/jquery-ui" />
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
define(["require", "exports", './master', './scripts/literki', './scripts/system', 'knockout', 'jquery', 'Kinetic', "./scripts/jquery-ui"], function (require, exports, master, literki, System, ko, $, Kinetic) {
    var BoardLetterPosition = (function () {
        function BoardLetterPosition() {
        }
        return BoardLetterPosition;
    })();
    var Board = (function () {
        function Board(container) {
            this.bonusColors = {};
            this.container = container;
            this.stage = new Kinetic.Stage({
                container: container,
                width: 0,
                height: 0
            });
            this.initalizeFields();
        }
        Board.prototype.initalizeFields = function () {
            this.bonusColors[literki.BoardFieldBonus.DoubleLetter] = "lightblue";
            this.bonusColors[literki.BoardFieldBonus.DoubleWord] = "lightpink";
            this.bonusColors[literki.BoardFieldBonus.TripleLetter] = "blue";
            this.bonusColors[literki.BoardFieldBonus.TripleWord] = "red";
            this.bonusColors[literki.BoardFieldBonus.Start] = "lightpink";
            this.bonusColors[literki.BoardFieldBonus.None] = "darkgreen";
        };
        Board.prototype.setupDisplay = function () {
            var containerElem = $("#" + this.container);
            this.stage.setSize({
                width: containerElem.width(),
                height: containerElem.height()
            });
            this.FIELD_SIZE = this.stage.width() / (literki.ROW_SIZE + 0.5);
            this.LINE_WIDTH = this.FIELD_SIZE / 15;
            this.BOARD_SIZE = this.FIELD_SIZE * literki.ROW_SIZE;
            this.BOARD_MARGIN = this.FIELD_SIZE / 4;
            this.MAX_LINES = this.BOARD_MARGIN + this.BOARD_SIZE;
            this.LETTERS_TOP = this.MAX_LINES + 2 * this.BOARD_MARGIN;
            this.CHANGE_LETTERS_LEFT = this.BOARD_MARGIN + (literki.MAX_LETTERS + 1) * this.FIELD_SIZE;
        };
        Board.prototype.drawGameState = function () {
            var _this = this;
            if (!game || !game.state) {
                return;
            }
            this.setupDisplay();
            //For drawing star on start field
            var letterLayer = new Kinetic.Layer();
            var backgroundLayer = new Kinetic.Layer();
            this.stage.add(backgroundLayer);
            var canvas = backgroundLayer.getCanvas()._canvas;
            var context = canvas.getContext("2d");
            var backgroundColor = "#FFFFCC";
            //background
            context.beginPath(),
                context.rect(0, 0, canvas.width, canvas.height);
            context.fillStyle = backgroundColor;
            context.fill();
            //board fields
            for (var x = 0; x < literki.ROW_SIZE; x++) {
                for (var y = 0; y < literki.ROW_SIZE; y++) {
                    var xpos = this.BOARD_MARGIN + x * this.FIELD_SIZE;
                    var ypos = this.BOARD_MARGIN + y * this.FIELD_SIZE;
                    var value = game.board.getFieldValue(x, y);
                    if (value == null || value.trim() != "") {
                        var bonus = game.board.getFieldBonus(x, y);
                        var fieldColor = this.bonusColors[bonus];
                        var context = canvas.getContext('2d');
                        //var centerX = xpos + this.FIELD_SIZE / 2;
                        //var centerY = ypos + this.FIELD_SIZE / 2;
                        //var radius = this.FIELD_SIZE / 2;
                        context.beginPath();
                        context.rect(xpos, ypos, this.FIELD_SIZE, this.FIELD_SIZE);
                        //context.arc(centerX, centerY, radius, 0, 2 * Math.PI, false);
                        context.fillStyle = fieldColor;
                        context.fill();
                        if (bonus == literki.BoardFieldBonus.Start) {
                            var star = new Kinetic.Star({
                                x: xpos + this.FIELD_SIZE / 2,
                                y: ypos + this.FIELD_SIZE / 2,
                                numPoints: 5,
                                innerRadius: this.FIELD_SIZE / 6,
                                outerRadius: this.FIELD_SIZE / 3,
                                fill: "Black",
                            });
                            letterLayer.add(star);
                        }
                    }
                }
            }
            //vertical lines
            for (var x = this.BOARD_MARGIN; x <= this.MAX_LINES + this.LINE_WIDTH; x += this.FIELD_SIZE) {
                context.beginPath();
                context.moveTo(x, this.BOARD_MARGIN);
                context.lineTo(x, this.MAX_LINES);
                context.lineWidth = this.LINE_WIDTH;
                context.strokeStyle = "black";
                context.stroke();
            }
            //horizontal lines
            for (var y = this.BOARD_MARGIN; y <= this.MAX_LINES + this.LINE_WIDTH; y += this.FIELD_SIZE) {
                context.beginPath();
                context.moveTo(this.BOARD_MARGIN, y);
                context.lineTo(this.MAX_LINES, y);
                context.lineWidth = this.LINE_WIDTH;
                context.strokeStyle = "black";
                context.stroke();
            }
            //letters field
            context.beginPath();
            context.rect(this.BOARD_MARGIN, this.LETTERS_TOP, this.FIELD_SIZE * literki.MAX_LETTERS, this.FIELD_SIZE);
            context.fillStyle = "silver";
            context.fill();
            context.strokeStyle = "black";
            context.stroke();
            //letters field lines
            for (var x = 1; x < literki.MAX_LETTERS; x++) {
                context.beginPath();
                context.moveTo(this.BOARD_MARGIN + x * this.FIELD_SIZE, this.LETTERS_TOP);
                context.lineTo(this.BOARD_MARGIN + x * this.FIELD_SIZE, this.LETTERS_TOP + this.FIELD_SIZE);
                context.strokeStyle = "black";
                context.stroke();
            }
            //change letters field
            context.beginPath();
            context.rect(this.CHANGE_LETTERS_LEFT, this.LETTERS_TOP, this.FIELD_SIZE * literki.MAX_LETTERS, this.FIELD_SIZE);
            context.fillStyle = backgroundColor;
            context.fill();
            context.strokeStyle = "black";
            context.stroke();
            //change letters field lines
            for (var x = 1; x < literki.MAX_LETTERS; x++) {
                context.beginPath();
                context.moveTo(this.CHANGE_LETTERS_LEFT + x * this.FIELD_SIZE, this.LETTERS_TOP);
                context.lineTo(this.CHANGE_LETTERS_LEFT + x * this.FIELD_SIZE, this.LETTERS_TOP + this.FIELD_SIZE);
                context.strokeStyle = "black";
                context.stroke();
            }
            //letter fields
            for (var x = 0; x < literki.ROW_SIZE; x++) {
                for (var y = 0; y < literki.ROW_SIZE; y++) {
                    var xpos = this.BOARD_MARGIN + x * this.FIELD_SIZE;
                    var ypos = this.BOARD_MARGIN + y * this.FIELD_SIZE;
                    var value = game.board.getFieldValue(x, y);
                    if (value != null && value.trim() != "") {
                        var letterGroup = this.getLetterGroup(xpos, ypos, value, -1, false);
                        letterLayer.add(letterGroup);
                    }
                }
            }
            //current move letters
            if (game.isCurrentPlayer() || game.isNextPlayer()) {
                var move = game.getActualMove();
                move.freeLetters.forEach(function (l) {
                    var xpos = _this.BOARD_MARGIN + l.x * _this.FIELD_SIZE;
                    var ypos = _this.BOARD_MARGIN + l.y * _this.FIELD_SIZE;
                    var backgroundColor = !game.isNextPlayer() ? "#FFFFCC" : "silver";
                    var letterGroup = _this.getLetterGroup(xpos, ypos, l.letter, -1, false, backgroundColor);
                    //if (game.isNextPlayer()) {
                    //    var duration = 1500; 
                    //    var lighten = true;
                    //    var tick = 0;
                    //    var anim = new Kinetic.Animation((frame) => {
                    //        var newTick = Math.ceil(frame.time / duration);
                    //        if (newTick > tick) {
                    //            lighten = !lighten;
                    //            tick = newTick;
                    //        }
                    //        var opacity = lighten ?
                    //            (frame.time % duration) / duration :
                    //            1 - (frame.time % duration) / duration;
                    //        letterGroup.setOpacity(opacity);
                    //        console.log("opacity: %s, frame.time: %s, tick: %s", opacity, frame.time, tick);
                    //    }, letterLayer);
                    //    anim.start();
                    //}
                    letterLayer.add(letterGroup);
                });
            }
            this.stage.add(letterLayer);
            var currentUser = game.getCurrentUser();
            if (currentUser != null) {
                // moving letters
                var foregroundLayer = new Kinetic.Layer();
                for (var x = 0; x < literki.MAX_LETTERS; x++) {
                    if (x < currentUser.freeLetters.length) {
                        var letter = currentUser.freeLetters[x];
                        if (letter) {
                            var xpos = this.BOARD_MARGIN + x * this.FIELD_SIZE;
                            var movable = game.isCurrentPlayer() && game.state.playState == literki.GamePlayState.PlayerMove;
                            var letterGroup = this.getLetterGroup(xpos, this.LETTERS_TOP, letter, x, movable);
                            foregroundLayer.add(letterGroup);
                        }
                    }
                }
                this.stage.add(foregroundLayer);
            }
        };
        Board.prototype.getLetterGroup = function (x, y, letter, index, foreground, backgroundColor) {
            var _this = this;
            if (backgroundColor === void 0) { backgroundColor = "#FFFFCC"; }
            var letterRect = new Kinetic.Rect({
                width: this.FIELD_SIZE,
                height: this.FIELD_SIZE,
                fill: backgroundColor,
                stroke: "black",
                strokeWidth: this.LINE_WIDTH,
                cornerRadius: 5
            });
            //var letterRect = new Kinetic.Circle({
            //    x: this.FIELD_SIZE / 2,
            //    y: this.FIELD_SIZE / 2,
            //    radius: this.FIELD_SIZE /2,
            //    fill: backgroundColor,
            //    stroke: "black",
            //    strokeWidth: this.LINE_WIDTH,
            //});
            var letterText = new Kinetic.Text({
                width: this.FIELD_SIZE,
                height: this.FIELD_SIZE,
                align: "center",
                y: (this.FIELD_SIZE - this.FIELD_SIZE * 2 / 3) / 2,
                text: letter.toUpperCase(),
                fontFamily: "Calibri",
                fontSize: this.FIELD_SIZE * 2 / 3,
                fontStyle: "bold",
                fill: "black",
            });
            var pointsText = new Kinetic.Text({
                width: this.FIELD_SIZE,
                height: this.FIELD_SIZE,
                align: "right",
                x: -5,
                y: this.FIELD_SIZE - 15,
                text: literki.LETTERS[letter].points.toString(),
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
                var dragStart;
                letterGroup.on('dragstart', function (e) {
                    letterGroup.moveToTop();
                    dragStart = _this.getLetterPosition(letterGroup);
                });
                letterGroup.on('dragend', function (e) {
                    var dragEnd = _this.getLetterPosition(letterGroup);
                    var isFieldFree = dragEnd.endType != literki.LetterPositionType.BoardField || game.isFieldFree(dragEnd.fieldX, dragEnd.fieldY);
                    if (!isFieldFree) {
                        dragEnd = dragStart;
                    }
                    var tween = new Kinetic.Tween({
                        node: letterGroup,
                        x: dragEnd.x,
                        y: dragEnd.y,
                        duration: 0.1
                    });
                    tween.play();
                    if (isFieldFree) {
                        switch (dragEnd.endType) {
                            case literki.LetterPositionType.BoardField: {
                                game.putLetterOnBoard(letter, index, dragEnd.fieldX, dragEnd.fieldY);
                                controller.model.refreshBindings();
                                break;
                            }
                            case literki.LetterPositionType.ExchangeLetter:
                                game.addLetterToExchange(letter, index);
                                controller.model.refreshBindings();
                                break;
                            case literki.LetterPositionType.FreeLetter:
                                game.removeLetter(letter, index);
                                controller.model.refreshBindings();
                                break;
                        }
                    }
                });
            }
            letterGroup.add(letterRect);
            letterGroup.add(letterText);
            letterGroup.add(pointsText);
            return letterGroup;
        };
        Board.prototype.getLetterPosition = function (letterGroup) {
            var x = letterGroup.x() - this.BOARD_MARGIN;
            x = this.normalizeDragEndPositionX(x);
            var y = letterGroup.y() - this.BOARD_MARGIN;
            y = this.normalizeDragEndPositionY(y);
            var fieldX = Math.floor(x / this.FIELD_SIZE);
            var fieldY = Math.floor(y / this.FIELD_SIZE);
            var floorX = fieldX * this.FIELD_SIZE;
            var floorY = Math.floor(y / this.FIELD_SIZE) * this.FIELD_SIZE;
            if (letterGroup.y() < this.LETTERS_TOP - 2 * this.BOARD_MARGIN) {
                //board fields
                x = x <= floorX + this.FIELD_SIZE / 2 ? floorX : floorX + this.FIELD_SIZE;
                x += this.BOARD_MARGIN;
                y = y <= floorY + this.FIELD_SIZE / 2 ? floorY : floorY + this.FIELD_SIZE;
                y += this.BOARD_MARGIN;
            }
            else {
                //free letters fields
                if (fieldX == literki.ROW_SIZE / 2) {
                    fieldX++;
                    floorX += this.FIELD_SIZE;
                }
                x = x <= floorX + this.FIELD_SIZE / 3 * 2 ? floorX : floorX + this.FIELD_SIZE;
                x += this.BOARD_MARGIN;
                y = this.LETTERS_TOP;
            }
            var endType = literki.LetterPositionType.BoardField;
            if (fieldY >= literki.ROW_SIZE) {
                endType = fieldX > literki.ROW_SIZE / 2 ? literki.LetterPositionType.ExchangeLetter : literki.LetterPositionType.FreeLetter;
            }
            fieldX = Math.floor(x / this.FIELD_SIZE);
            fieldY = Math.floor(y / this.FIELD_SIZE);
            return { x: x, y: y, fieldX: fieldX, fieldY: fieldY, endType: endType };
        };
        Board.prototype.normalizeDragEndPositionX = function (x) {
            var lastTileX = (literki.ROW_SIZE - 1) * this.FIELD_SIZE;
            return x >= 0 ?
                (x >= lastTileX ? lastTileX : x) :
                0;
        };
        Board.prototype.normalizeDragEndPositionY = function (y) {
            return y >= 0 ? y : 0;
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
    var PlayerModel = (function () {
        function PlayerModel(parent) {
            this.isCurrentPlayer = ko.observable(false);
            this.isCurrentUser = ko.observable(false);
            this.playerName = ko.observable("");
            this.points = ko.observable(0);
            this.remainingTime = ko.observable("");
            this.playerCss = ko.observable("");
            this.parentModel = parent;
        }
        PlayerModel.prototype.findAndRefresh = function (players, currentPlayer) {
            var _this = this;
            players.forEach(function (p) {
                if (p.playerName == _this.playerName()) {
                    _this.refresh(p, currentPlayer);
                }
            });
        };
        PlayerModel.prototype.refresh = function (player, currentPlayer) {
            this.playerName(player.playerName);
            this.points(player.getPoints());
            this.remainingTime(System.formatSeconds(player.remainingTime, "mm:ss"));
            this.isCurrentPlayer(player.userId == game.getCurrentPlayer().userId);
            this.isCurrentUser(player.userId == game.currentUserId);
            this.playerCss((this.isCurrentUser() ? "currentUser" : "player") + (!player.isAlive() ? " inactivePlayer" : ""));
        };
        return PlayerModel;
    })();
    var MoveHistoryViewModel = (function () {
        function MoveHistoryViewModel(moves) {
            var _this = this;
            this.playerMoves = ko.observableArray();
            moves.forEach(function (m) { return _this.playerMoves.push(m); });
        }
        return MoveHistoryViewModel;
    })();
    var BoardModel = (function (_super) {
        __extends(BoardModel, _super);
        function BoardModel() {
            _super.apply(this, arguments);
            this.newWords = ko.observableArray();
            this.changeLetters = ko.observable("");
            this.errorMessage = ko.observable("");
            this.allPlayers = ko.observableArray();
            this.playerCount = ko.observable(0);
            this.historyMoves = ko.observableArray();
        }
        BoardModel.prototype.setNewWords = function (newWords) {
            var _this = this;
            this.cleanNewWords();
            newWords.forEach(function (word) { return _this.newWords.push(word); });
        };
        BoardModel.prototype.cleanNewWords = function () {
            this.newWords.removeAll();
        };
        BoardModel.prototype.setChangeLetters = function (changeLetters) {
            this.cleanChangeLetters();
            this.changeLetters(changeLetters.join(" "));
        };
        BoardModel.prototype.cleanChangeLetters = function () {
            this.changeLetters("");
        };
        BoardModel.prototype.getPlayers = function (start, end) {
            var _this = this;
            var players = new Array();
            game.getPlayers().slice(start, end).forEach(function (p) {
                var playerModel = new PlayerModel(_this);
                playerModel.refresh(p, game.getCurrentPlayer());
                players.push(playerModel);
            });
            this.allPlayers(players);
            return this.allPlayers();
        };
        BoardModel.prototype.getAllPlayers = function () {
            return this.getPlayers(0, game.getPlayers().length);
        };
        BoardModel.prototype.getPlayersRow = function () {
            return game.getPlayers().length > 2 ? [0, 1] : [0];
        };
        BoardModel.prototype.refreshBoard = function () {
            this.board.clearBoard();
            this.board.drawGameState();
        };
        BoardModel.prototype.refreshBindings = function () {
            var newWords = game.getNewWords();
            this.setNewWords(newWords);
            var changeLetters = game.getExchangeLetters();
            this.setChangeLetters(changeLetters);
        };
        BoardModel.prototype.refreshPlayerModels = function () {
            if (this.allPlayers().length == game.getPlayers().length) {
                this.allPlayers().forEach(function (p) { return p.findAndRefresh(game.getPlayers(), game.getCurrentPlayer()); });
            }
            else {
                this.allPlayers.removeAll();
                this.playerCount(game.getPlayers().length);
                this.getAllPlayers();
            }
        };
        BoardModel.prototype.refreshHistoryMoves = function () {
            this.historyMoves.removeAll();
            var players = game.getPlayers();
            var moves = new Array();
            var movesTotals = {};
            var moveIndex = 0;
            var lastMove = _.max(players, function (p) { return p.moves.length; }).moves.length;
            while (moveIndex < lastMove) {
                var playerMoves = new Array();
                players.forEach(function (p) {
                    var moveDesc = "";
                    var move = p.moves.length > moveIndex ?
                        p.moves[moveIndex] :
                        null;
                    if (move) {
                        var total = (p.userId in movesTotals) ? movesTotals[p.userId] : 0;
                        var sum = move.words.length > 0 ?
                            move.words.map(function (w) { return w.points; }).reduce(function (total, x) { return total += x; }) :
                            0;
                        total += sum;
                        movesTotals[p.userId] = total;
                        switch (move.moveType) {
                            case literki.MoveType.Exchange:
                                moveDesc = total + " (Wymiana)";
                                break;
                            case literki.MoveType.Fold:
                                moveDesc = total + " (Pas)";
                                break;
                            case literki.MoveType.WrongMove:
                                moveDesc = total + " (B\u0142\u0119dny ruch)";
                                break;
                            case literki.MoveType.CheckMoveFailed:
                                moveDesc = total + " (B\u0142\u0119dne sprawdzenie)";
                                break;
                            case literki.MoveType.SkipNoTimeLeft:
                                moveDesc = total + " (Brak czasu)";
                                break;
                            case literki.MoveType.Move:
                                moveDesc = total + " (" + sum + ")";
                                break;
                        }
                    }
                    playerMoves.push(moveDesc);
                });
                var moveModel = new MoveHistoryViewModel(playerMoves);
                this.historyMoves.push(moveModel);
                moveIndex++;
            }
        };
        BoardModel.prototype.drawGameState = function () {
            this.board.drawGameState();
        };
        return BoardModel;
    })(master.MasterModel);
    var BoardController = (function (_super) {
        __extends(BoardController, _super);
        function BoardController() {
            _super.apply(this, arguments);
        }
        BoardController.prototype.runState = function (state) {
            game.runState(state);
            this.model.drawGameState();
        };
        BoardController.prototype.init = function () {
            var gameId = System.urlParam("gameId");
            var join = System.urlParam("join");
            if (join) {
                this.callGETMethod("/game/join", true, { gameId: gameId }, true);
            }
            else {
                if (gameId != null) {
                    this.callGETMethod("/game/get", true, { gameId: gameId }, true);
                }
                else {
                    console.log("Not enough parameters");
                }
            }
        };
        BoardController.prototype.refreshClick = function () {
            this.callGETMethod("/game/get", true);
        };
        BoardController.prototype.startClick = function () {
            this.callGETMethod("/game/start");
        };
        BoardController.prototype.pauseClick = function () {
            this.callGETMethod("/game/pause");
        };
        BoardController.prototype.foldClick = function () {
            this.callGETMethod("/game/fold");
        };
        BoardController.prototype.exchangeClick = function () {
            this.callGETMethod("/game/exchange", true, {
                gameId: game.state.gameId,
                exchangeLetters: game.getExchangeLetters()
            });
        };
        BoardController.prototype.alive = function () {
            this.callPOSTMethod("/player/alive", false, {
                gameId: game.state.gameId,
                currentPlayerId: game.getCurrentPlayer().userId,
                playState: game.state.playState,
                playersCount: game.getPlayers().length
            });
        };
        BoardController.prototype.callGETMethod = function (name, refreshBoard, data, applyBindings) {
            var _this = this;
            if (refreshBoard === void 0) { refreshBoard = true; }
            if (data === void 0) { data = { gameId: game.state.gameId }; }
            if (applyBindings === void 0) { applyBindings = false; }
            _super.prototype.callGETMethod.call(this, name, data, function (result) { return _this.refreshAfterHTMLMethodCall(result, refreshBoard, applyBindings); });
        };
        BoardController.prototype.callPOSTMethod = function (name, refreshBoard, data, applyBindings) {
            var _this = this;
            if (refreshBoard === void 0) { refreshBoard = true; }
            if (data === void 0) { data = { gameId: game.state.gameId }; }
            if (applyBindings === void 0) { applyBindings = false; }
            _super.prototype.callPOSTMethod.call(this, name, data, function (result) { return _this.refreshAfterHTMLMethodCall(result, refreshBoard, applyBindings); });
        };
        BoardController.prototype.refreshAfterHTMLMethodCall = function (result, refreshBoard, applyBindings) {
            var refresh = refreshBoard || result.forceRefresh;
            this.refreshModel(result, refresh);
            if (refresh) {
                this.model.refreshBoard();
            }
            if (applyBindings) {
                ko.applyBindings(this);
            }
        };
        BoardController.prototype.moveClick = function () {
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
                    _this.model.refreshBoard();
                }
            });
        };
        BoardController.prototype.refreshModel = function (result, fullRefresh) {
            var _this = this;
            if (fullRefresh === void 0) { fullRefresh = true; }
            _super.prototype.refreshModel.call(this, result);
            if (result.state) {
                if (!game) {
                    game = new literki.GameRun(result.userId);
                }
                var state = literki.GameState.fromJSON(result.state);
                game.state = state;
                this.model.refreshPlayerModels();
                if (fullRefresh) {
                    game.runState(state);
                    this.model.cleanNewWords();
                    this.model.cleanChangeLetters();
                    this.model.refreshHistoryMoves();
                    if (!result.errorMessage) {
                        this.hideDialogBox();
                        if (game.canApproveMove()) {
                            this.showAskDialogBox("Czy akceptujesz ruch gracza " + game.getCurrentPlayer().playerName + "?", function (result) {
                                _this.callPOSTMethod("/game/approve", true, { gameId: game.state.gameId, approve: result });
                            });
                        }
                        if (game.isWaitingForMoveApproval()) {
                            this.showInfoDialogBox("Oczekiwanie na akceptacj\u0119 ruchu przez gracza " + game.getNextPlayer().playerName + ".");
                        }
                        if (game.isFinished()) {
                            this.showInfoDialogBox('Gra została zakończona');
                        }
                    }
                }
            }
        };
        return BoardController;
    })(master.MasterControler);
    var game;
    var controller = new BoardController();
    function init() {
        $("#tabsDiv").tabs();
        master.init();
        var debugLabel = document.getElementById("debugLabel");
        var model = new BoardModel();
        model.board = new Board("boardDiv");
        controller.model = model;
        controller.init();
        setInterval(function () {
            debugLabel.textContent =
                "Screen: " + screen.availWidth + " X " + screen.availHeight + ",  Window: " + window.innerWidth + " X " + window.innerHeight + " " + new Date().toLocaleTimeString();
            controller.alive();
        }, 1000);
    }
    exports.init = init;
    window.onresize = function () {
        controller.model.refreshBoard();
    };
});
//# sourceMappingURL=board.js.map