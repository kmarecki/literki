/// <reference path="Scripts\typings\kineticjs\kineticjs.d.ts"/>
/// <reference path="Scripts\literki.ts"/>
var Game;
(function (Game) {
    var FIELD_SIZE = 50;
    var LINE_WIDTH = FIELD_SIZE / 15;
    var BOARD_MARGIN = 10;

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
            this.fields = new Literki.BoardFields();

            this.bonusColors[1 /* DoubleLetter */] = "lightblue";
            this.bonusColors[3 /* DoubleWord */] = "lightpink";
            this.bonusColors[2 /* TripleLetter */] = "blue";
            this.bonusColors[4 /* TripleWord */] = "red";
            this.bonusColors[5 /* Start */] = "lightpink";
            this.bonusColors[0 /* None */] = "darkgreen";
        };

        Board.prototype.drawBoardState = function (state) {
            //var containerElem = document.getElementById(this.container);
            //var width = containerElem.clientWidth;
            //var height = containerElem.clientHeight;
            //this.stage.setWidth(width);
            //this.stage.setHeight(height);
            this.drawBoard();
            this.drawLetters(state);
        };

        Board.prototype.drawBoard = function () {
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
                    var bonus = this.fields.getFieldBonus(x, y);
                    var fieldColor = this.bonusColors[bonus];
                    var xpos = BOARD_MARGIN + x * FIELD_SIZE;
                    var ypos = BOARD_MARGIN + y * FIELD_SIZE;
                    context.beginPath();
                    context.rect(xpos, ypos, FIELD_SIZE, FIELD_SIZE);
                    context.fillStyle = fieldColor;
                    context.fill();
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
        };

        Board.prototype.drawLetters = function (state) {
            // add the shape to the layer
            var foregroundLayer = new Kinetic.Layer();

            foregroundLayer.add(this.getLetterGroup(100, 200, "Ą"));
            foregroundLayer.add(this.getLetterGroup(300, 300, "Ł"));
            foregroundLayer.add(this.getLetterGroup(100, 300, "Ń"));

            this.stage.add(foregroundLayer);
        };

        Board.prototype.getLetterGroup = function (x, y, letter) {
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
                text: letter,
                fontFamily: "Calibri",
                fontSize: 30,
                fontStyle: "bold",
                fill: "black"
            });

            var letterGroup = new Kinetic.Group({
                x: x,
                y: y,
                draggable: true
            });

            letterGroup.on('dragend', function (e) {
                var x = letterGroup.x() - BOARD_MARGIN;
                var y = letterGroup.y() - BOARD_MARGIN;
                var floorX = Math.floor(x / FIELD_SIZE) * FIELD_SIZE;
                ;
                var floorY = Math.floor(y / FIELD_SIZE) * FIELD_SIZE;
                ;

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
            });

            letterGroup.add(letterRect);
            letterGroup.add(letterText);
            return letterGroup;
        };

        Board.prototype.clearBoard = function () {
            this.stage.clear();
        };
        return Board;
    })();
    Game.Board = Board;

    var Info = (function () {
        function Info(container) {
            this.container = container;
        }
        Info.prototype.drawInfoState = function (state) {
            var infoDiv = document.getElementById(this.container);
        };
        return Info;
    })();
    Game.Info = Info;
})(Game || (Game = {}));

var board;
var info;
var state;

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

    board = new Game.Board("boardDiv");
    info = new Game.Info("infoDiv");
    state = new Literki.GameState();

    board.drawBoardState(state);
    info.drawInfoState(state);
};

window.onresize = function () {
    board.clearBoard();
    board.drawBoardState(state);
};
//# sourceMappingURL=board.js.map
