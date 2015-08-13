/// <reference path=".\typings\kineticjs\kineticjs.d.ts"/>
/// <reference path=".\typings\jqueryui\jqueryui.d.ts" />
/// <amd-dependency path="./scripts/jquery-ui" />
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
define(["require", "exports", './app', './scripts/literki', './scripts/system', 'knockout', 'jquery', 'Kinetic', "./scripts/jquery-ui"], function (require, exports, App, Literki, System, ko, $, Kinetic) {
    var game;
    var viewModel;
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
            this.bonusColors[1 /* DoubleLetter */] = "lightblue";
            this.bonusColors[3 /* DoubleWord */] = "lightpink";
            this.bonusColors[2 /* TripleLetter */] = "blue";
            this.bonusColors[4 /* TripleWord */] = "red";
            this.bonusColors[5 /* Start */] = "lightpink";
            this.bonusColors[0 /* None */] = "darkgreen";
        };
        Board.prototype.setupDisplay = function () {
            var containerElem = $("#" + this.container);
            this.stage.setSize({
                width: containerElem.width(),
                height: containerElem.height()
            });
            this.FIELD_SIZE = this.stage.width() / (Literki.ROW_SIZE + 0.5);
            this.LINE_WIDTH = this.FIELD_SIZE / 15;
            this.BOARD_SIZE = this.FIELD_SIZE * Literki.ROW_SIZE;
            this.BOARD_MARGIN = this.FIELD_SIZE / 4;
            this.MAX_LINES = this.BOARD_MARGIN + this.BOARD_SIZE;
            this.LETTERS_TOP = this.MAX_LINES + 2 * this.BOARD_MARGIN;
            this.CHANGE_LETTERS_LEFT = this.BOARD_MARGIN + (Literki.MAX_LETTERS + 1) * this.FIELD_SIZE;
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
            context.beginPath(), context.rect(0, 0, canvas.width, canvas.height);
            context.fillStyle = backgroundColor;
            context.fill();
            for (var x = 0; x < Literki.ROW_SIZE; x++) {
                for (var y = 0; y < Literki.ROW_SIZE; y++) {
                    var xpos = this.BOARD_MARGIN + x * this.FIELD_SIZE;
                    var ypos = this.BOARD_MARGIN + y * this.FIELD_SIZE;
                    var value = game.board.getFieldValue(x, y);
                    if (value == null || value.trim() != "") {
                        var bonus = game.board.getFieldBonus(x, y);
                        var fieldColor = this.bonusColors[bonus];
                        context.beginPath();
                        context.rect(xpos, ypos, this.FIELD_SIZE, this.FIELD_SIZE);
                        context.fillStyle = fieldColor;
                        context.fill();
                        if (bonus == 5 /* Start */) {
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
            for (var x = this.BOARD_MARGIN; x <= this.MAX_LINES + this.LINE_WIDTH; x += this.FIELD_SIZE) {
                context.beginPath();
                context.moveTo(x, this.BOARD_MARGIN);
                context.lineTo(x, this.MAX_LINES);
                context.lineWidth = this.LINE_WIDTH;
                context.strokeStyle = "black";
                context.stroke();
            }
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
            context.rect(this.BOARD_MARGIN, this.LETTERS_TOP, this.FIELD_SIZE * Literki.MAX_LETTERS, this.FIELD_SIZE);
            context.fillStyle = "silver";
            context.fill();
            context.strokeStyle = "black";
            context.stroke();
            for (var x = 1; x < Literki.MAX_LETTERS; x++) {
                context.beginPath();
                context.moveTo(this.BOARD_MARGIN + x * this.FIELD_SIZE, this.LETTERS_TOP);
                context.lineTo(this.BOARD_MARGIN + x * this.FIELD_SIZE, this.LETTERS_TOP + this.FIELD_SIZE);
                context.strokeStyle = "black";
                context.stroke();
            }
            //change letters field
            context.beginPath();
            context.rect(this.CHANGE_LETTERS_LEFT, this.LETTERS_TOP, this.FIELD_SIZE * Literki.MAX_LETTERS, this.FIELD_SIZE);
            context.fillStyle = backgroundColor;
            context.fill();
            context.strokeStyle = "black";
            context.stroke();
            for (var x = 1; x < Literki.MAX_LETTERS; x++) {
                context.beginPath();
                context.moveTo(this.CHANGE_LETTERS_LEFT + x * this.FIELD_SIZE, this.LETTERS_TOP);
                context.lineTo(this.CHANGE_LETTERS_LEFT + x * this.FIELD_SIZE, this.LETTERS_TOP + this.FIELD_SIZE);
                context.strokeStyle = "black";
                context.stroke();
            }
            for (var x = 0; x < Literki.ROW_SIZE; x++) {
                for (var y = 0; y < Literki.ROW_SIZE; y++) {
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
                    var backgroundColor = game.isNextPlayer() ? "silver" : "#FFFFCC";
                    var letterGroup = _this.getLetterGroup(xpos, ypos, l.letter, -1, false, backgroundColor);
                    letterLayer.add(letterGroup);
                });
            }
            this.stage.add(letterLayer);
            var currentUser = game.getCurrentUser();
            if (currentUser != null) {
                // moving letters
                var foregroundLayer = new Kinetic.Layer();
                for (var x = 0; x < Literki.MAX_LETTERS; x++) {
                    if (x < currentUser.freeLetters.length) {
                        var letter = currentUser.freeLetters[x];
                        var xpos = this.BOARD_MARGIN + x * this.FIELD_SIZE;
                        var movable = game.isCurrentPlayer() && game.state.playState == 0 /* PlayerMove */;
                        var letterGroup = this.getLetterGroup(xpos, this.LETTERS_TOP, letter, x, movable);
                        foregroundLayer.add(letterGroup);
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
                letterGroup.on('dragstart', function (e) {
                    letterGroup.moveToTop();
                });
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
                x = x <= floorX + this.FIELD_SIZE / 3 * 2 ? floorX : floorX + this.FIELD_SIZE;
                x += this.BOARD_MARGIN;
                y = floorY;
                y += this.BOARD_MARGIN;
            }
            else {
                //free letters fields
                if (fieldX == Literki.ROW_SIZE / 2) {
                    fieldX++;
                    floorX += this.FIELD_SIZE;
                }
                x = x <= floorX + this.FIELD_SIZE / 3 * 2 ? floorX : floorX + this.FIELD_SIZE;
                x += this.BOARD_MARGIN;
                y = this.LETTERS_TOP;
            }
            var endType = 0 /* BoardField */;
            if (fieldY >= Literki.ROW_SIZE) {
                endType = fieldX > Literki.ROW_SIZE / 2 ? 1 /* ExchangeLetter */ : 2 /* FreeLetter */;
            }
            return { x: x, y: y, fieldX: fieldX, fieldY: fieldY, endType: endType };
        };
        Board.prototype.normalizeDragEndPositionX = function (x) {
            var lastTileX = (Literki.ROW_SIZE - 1) * this.FIELD_SIZE;
            return x >= 0 ? (x >= lastTileX ? lastTileX : x) : 0;
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
    var PlayerViewModel = (function () {
        function PlayerViewModel(parent) {
            this.isCurrentPlayer = ko.observable(false);
            this.isCurrentUser = ko.observable(false);
            this.playerName = ko.observable("");
            this.points = ko.observable(0);
            this.remainingTime = ko.observable("");
            this.playerCss = ko.observable("");
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
            this.isCurrentPlayer(player.userId == game.getCurrentPlayer().userId);
            this.isCurrentUser(player.userId == game.currentUserId);
            this.playerCss((this.isCurrentUser() ? "currentUser" : "player") + (!player.isAlive() ? " inactivePlayer" : ""));
        };
        return PlayerViewModel;
    })();
    var MoveHistoryViewModel = (function () {
        function MoveHistoryViewModel(moves) {
            var _this = this;
            this.playerMoves = ko.observableArray();
            moves.forEach(function (m) { return _this.playerMoves.push(m); });
        }
        return MoveHistoryViewModel;
    })();
    var BoardViewModel = (function (_super) {
        __extends(BoardViewModel, _super);
        function BoardViewModel() {
            _super.apply(this, arguments);
            this.self = this;
            this.newWords = ko.observableArray();
            this.changeLetters = ko.observable("");
            this.allPlayers = new Array();
            this.errorMessage = ko.observable("");
            this.historyMoves = ko.observableArray();
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
            this.cleanChangeLetters();
            this.changeLetters(changeLetters.join(" "));
        };
        BoardViewModel.prototype.cleanChangeLetters = function () {
            this.changeLetters("");
        };
        BoardViewModel.prototype.getAllPlayers = function () {
            return this.getPlayers(0, game.getPlayers().length);
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
        BoardViewModel.prototype.refreshClick = function () {
            this.callGETMethod("/game/get");
        };
        BoardViewModel.prototype.startClick = function () {
            this.callGETMethod("/game/start");
        };
        BoardViewModel.prototype.pauseClick = function () {
            this.callGETMethod("/game/pause");
        };
        BoardViewModel.prototype.foldClick = function () {
            this.callGETMethod("/game/fold");
        };
        BoardViewModel.prototype.exchangeClick = function () {
            this.callGETMethod("/game/exchange", true, {
                gameId: game.state.gameId,
                exchangeLetters: game.getExchangeLetters()
            });
        };
        BoardViewModel.prototype.alive = function () {
            this.callPOSTMethod("/player/alive", false, {
                gameId: game.state.gameId,
                currentPlayerId: game.getCurrentPlayer().userId,
                playState: game.state.playState
            });
        };
        BoardViewModel.prototype.callGETMethod = function (name, refreshBoard, data) {
            var _this = this;
            if (refreshBoard === void 0) { refreshBoard = true; }
            if (data === void 0) { data = { gameId: game.state.gameId }; }
            $.ajax({
                type: "GET",
                url: name,
                data: data,
                dataType: "json",
                success: function (result) { return _this.refreshAfterHTMLMethodCall(result, refreshBoard); },
                error: function (xhr, ajaxOptions, thrownError) { return _this.ajaxErrorHandler(xhr, ajaxOptions, thrownError); }
            });
        };
        BoardViewModel.prototype.callPOSTMethod = function (name, refreshBoard, data) {
            var _this = this;
            if (refreshBoard === void 0) { refreshBoard = true; }
            if (data === void 0) { data = { gameId: game.state.gameId }; }
            $.ajax({
                type: "POST",
                url: name,
                contentType: "application/json",
                data: JSON.stringify(data),
                dataType: "json",
                success: function (result) { return _this.refreshAfterHTMLMethodCall(result, refreshBoard); },
                error: function (xhr, ajaxOptions, thrownError) { return _this.ajaxErrorHandler(xhr, ajaxOptions, thrownError); }
            });
        };
        BoardViewModel.prototype.refreshAfterHTMLMethodCall = function (result, refreshBoard) {
            var refresh = refreshBoard || result.forceRefresh;
            this.refreshModel(result, refresh);
            if (refresh) {
                this.refreshBoard();
            }
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
            var changeLetters = game.getExchangeLetters();
            this.setChangeLetters(changeLetters);
        };
        BoardViewModel.prototype.refreshModel = function (result, fullRefresh) {
            var _this = this;
            if (fullRefresh === void 0) { fullRefresh = true; }
            _super.prototype.refreshModel.call(this, result);
            if (result.state) {
                var state = Literki.GameState.fromJSON(result.state);
                game.state = state;
                this.refreshPlayerModels();
                if (fullRefresh) {
                    game.runState(state);
                    this.cleanNewWords();
                    this.cleanChangeLetters();
                    this.refreshHistoryMoves();
                    if (!result.errorMessage) {
                        this.hideDialogBox();
                        if (game.canApproveMove()) {
                            this.showAskDialogBox("Czy akceptujesz ruch gracza " + game.getCurrentPlayer().playerName + "?", function (result) {
                                _this.callPOSTMethod("/game/approve", true, { gameId: game.state.gameId, approve: result });
                            });
                        }
                        if (game.isWaitingForMoveApproval()) {
                            this.showPersistentInfoDialogBox("Oczekiwanie na akceptację ruchu przez gracza " + game.getNextPlayer().playerName + ".");
                        }
                    }
                }
            }
        };
        BoardViewModel.prototype.refreshPlayerModels = function () {
            if (game != null) {
                this.allPlayers.forEach(function (p) { return p.findAndRefresh(game.getPlayers(), game.getCurrentPlayer()); });
            }
        };
        BoardViewModel.prototype.refreshHistoryMoves = function () {
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
                    var move = p.moves.length > moveIndex ? p.moves[moveIndex] : null;
                    if (move) {
                        var total = (p.userId in movesTotals) ? movesTotals[p.userId] : 0;
                        var sum = move.words.length > 0 ? move.words.map(function (w) { return w.points; }).reduce(function (total, x) { return total += x; }) : 0;
                        total += sum;
                        movesTotals[p.userId] = total;
                        switch (move.moveType) {
                            case 2 /* Exchange */:
                                moveDesc = "" + total + " (Wymiana)";
                                break;
                            case 1 /* Fold */:
                                moveDesc = "" + total + " (Pas)";
                                break;
                            case 3 /* WrongMove */:
                                moveDesc = "" + total + " (Błędny ruch)";
                                break;
                            case 4 /* CheckMoveFailed */:
                                moveDesc = "" + total + " (Błędne sprawdzenie)";
                                break;
                            case 0 /* Move */:
                                moveDesc = "" + total + " (" + sum + ")";
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
        return BoardViewModel;
    })(App.BaseViewModel);
    function init() {
        $.ajaxSetup({ cache: false });
        var debugLabel = document.getElementById("debugLabel");
        viewModel = new BoardViewModel();
        viewModel.board = new Board("boardDiv");
        viewModel.init();
        setInterval(function () {
            debugLabel.textContent = "Screen: " + screen.availWidth + " X " + screen.availHeight + ",  Window: " + window.innerWidth + " X " + window.innerHeight + " " + new Date().toLocaleTimeString();
            viewModel.alive();
        }, 1000);
    }
    exports.init = init;
    window.onresize = function () {
        viewModel.refreshBoard();
    };
});
//# sourceMappingURL=board.js.map