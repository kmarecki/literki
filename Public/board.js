/// <reference path=".\typings\kineticjs\kineticjs.d.ts"/>
/// <reference path=".\typings\knockout\knockout.d.ts"/>
/// <reference path=".\typings\jquery\jquery.d.ts"/>
/// <reference path=".\scripts\literki.ts"/>
var FIELD_SIZE;
var LINE_WIDTH;
var BOARD_MARGIN;
function setupDisplay(fieldSize) {
    FIELD_SIZE = fieldSize;
    LINE_WIDTH = fieldSize / 15;
    BOARD_MARGIN = fieldSize / 4;
}
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
        this.bonusColors[1 /* DoubleLetter */] = "lightblue";
        this.bonusColors[3 /* DoubleWord */] = "lightpink";
        this.bonusColors[2 /* TripleLetter */] = "blue";
        this.bonusColors[4 /* TripleWord */] = "red";
        this.bonusColors[5 /* Start */] = "lightpink";
        this.bonusColors[0 /* None */] = "darkgreen";
    };
    Board.prototype.drawGameState = function (game) {
        if (game == null || game.getState()) {
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
        // moving letters
        var foregroundLayer = new Kinetic.Layer();
        for (var x = 0; x < Literki.MAX_LETTERS; x++) {
            var letter = game.getCurrentPlayer().freeLetters[x];
            var xpos = BOARD_MARGIN + x * FIELD_SIZE;
            foregroundLayer.add(this.getLetterGroup(xpos, lettersTop, letter, x, true));
        }
        this.stage.add(foregroundLayer);
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
                viewModel.game.putFreeLetter(letter, index, fieldX, fieldY);
                var newWords = viewModel.game.getNewWords();
                viewModel.setNewWords(newWords);
            });
        }
        letterGroup.add(letterRect);
        letterGroup.add(letterText);
        return letterGroup;
    };
    Board.prototype.clearBoard = function () {
        this.stage.clear();
    };
    return Board;
})();
var BoardViewModelWord = (function () {
    function BoardViewModelWord() {
    }
    return BoardViewModelWord;
})();
var BoardViewModel = (function () {
    function BoardViewModel() {
        this.self = this;
        this.errorMessage = ko.observable('');
        this.newWords = ko.observableArray();
        ko.observable;
    }
    BoardViewModel.prototype.getNewWords = function () {
        return this.newWords;
    };
    BoardViewModel.prototype.setNewWords = function (newWords) {
        var _this = this;
        this.newWords.removeAll();
        newWords.forEach(function (word) { return _this.newWords.push(word); });
    };
    BoardViewModel.prototype.getPlayers = function (start, end) {
        return this.game.getPlayers().slice(start, end);
    };
    BoardViewModel.prototype.getPlayersRow = function () {
        return this.game.getPlayers().length > 2 ? [0, 1] : [0];
    };
    BoardViewModel.prototype.refreshBoard = function () {
        this.board.clearBoard();
        this.board.drawGameState(this.game);
    };
    BoardViewModel.prototype.runState = function (state) {
        viewModel.game.runState(state);
        viewModel.board.drawGameState(viewModel.game);
    };
    BoardViewModel.prototype.init = function () {
        var _this = this;
        $.ajax({
            type: "GET",
            url: "/games/new",
            dataType: "json",
            success: function (result) {
                _this.game = new Literki.GameRun();
                _this.refreshModel(result);
                ko.applyBindings(_this);
            }
        });
    };
    BoardViewModel.prototype.refreshClick = function () {
        var _this = this;
        $.ajax({
            type: "GET",
            url: "/game/get",
            data: { gameId: this.game.getState().gameId },
            dataType: "json",
            success: function (result) {
                _this.refreshModel(result);
                _this.refreshBoard();
            }
        });
    };
    BoardViewModel.prototype.moveClick = function () {
        var _this = this;
        var move = this.game.getActualMove();
        $.ajax({
            type: "POST",
            url: "/game/move",
            contentType: 'application/json',
            data: JSON.stringify(move),
            dataType: "json",
            success: function (result) {
                _this.refreshClick();
            }
        });
    };
    BoardViewModel.prototype.refreshModel = function (result) {
        if (result.state != null) {
            var state = Literki.GameState.fromJSON(result.state);
            this.game.runState(state);
        }
        this.errorMessage = result.errorMessage;
    };
    return BoardViewModel;
})();
var viewModel;
window.onload = function () {
    var boardDiv = document.getElementById("boardDiv");
    boardDiv.style.width = screen.availWidth / 2 + "px";
    boardDiv.style.height = screen.availHeight * 0.9 + "px";
    var infoDiv = document.getElementById("infoDiv");
    infoDiv.style.width = screen.availWidth / 2 + "px";
    infoDiv.style.height = screen.availHeight * 0.9 + "px";
    var debugLabel = document.getElementById("debugLabel");
    setInterval(function () {
        debugLabel.textContent = screen.availWidth + " X " + screen.availHeight + " " + new Date().toLocaleTimeString();
    }, 1000);
    setupDisplay(screen.availHeight / 20);
    viewModel = new BoardViewModel();
    viewModel.setNewWords([
        { word: "Jako", points: 10 },
        { word: "Dam", points: 6 }
    ]);
    viewModel.board = new Board("boardDiv");
    viewModel.init();
};
window.onresize = function () {
    viewModel.refreshBoard();
};
//# sourceMappingURL=board.js.map