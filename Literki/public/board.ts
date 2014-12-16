/// <reference path="..\Scripts\typings\kineticjs\kineticjs.d.ts"/>

module Game {

    var FIELD_SIZE = 50;
    var ROW_SIZE = 15;
    var LINE_WIDTH = FIELD_SIZE / 15;
    var BOARD_MARGIN = 10;
    var MAX_LETTERS = 7;

    enum BoardFieldBonus {
        None,
        DoubleLetter,
        TripleLetter,
        DoubleWord,
        TripleWord,
        Start
    }

    class BoardFields {
        private fields: Array<Array<BoardFieldBonus>>;

        constructor() {
            this.fields = new Array(ROW_SIZE);
            for (var i = 0; i < ROW_SIZE; i++) {
                this.fields[i] = new Array(ROW_SIZE);
            }
        }

        addFieldBonus(fields: Array<{ x: number; y: number; }>, bonus: BoardFieldBonus): void {
            fields.forEach((field, index) => {
                this.fields[field.x][field.y] = bonus;
            });
        }

        getFieldBonus(x: number, y: number): BoardFieldBonus {
            return this.fields[x][y] != null ? this.fields[x][y] : BoardFieldBonus.None;
        }
    }

    export class Board {
        private stage: Kinetic.IStage;
        private fields: BoardFields;
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
            this.fields = new BoardFields();
            this.fields.addFieldBonus([
                { x: 3, y: 0 }, { x: 11, y: 0 }, { x: 6, y: 2 }, { x: 8, y: 2 },
                { x: 0, y: 3 }, { x: 7, y: 3 }, { x: 14, y: 3 },
                { x: 2, y: 6 }, { x: 6, y: 6 }, { x: 8, y: 6 }, { x: 12, y: 6 },
                { x: 3, y: 7 }, { x: 11, y: 7 },
                { x: 2, y: 8 }, { x: 6, y: 8 }, { x: 8, y: 8 }, { x: 12, y: 8 },
                { x: 0, y: 11 }, { x: 7, y: 11 }, { x: 14, y: 11 },
                { x: 3, y: 14 }, { x: 11, y: 14 }, { x: 6, y: 12 }, { x: 8, y: 12 }
            ], BoardFieldBonus.DoubleLetter);
            this.fields.addFieldBonus([
                { x: 5, y: 1 }, { x: 9, y: 1 },
                { x: 1, y: 5 }, { x: 5, y: 5 }, { x: 9, y: 5 }, { x: 13, y: 5 },
                { x: 1, y: 9 }, { x: 5, y: 9 }, { x: 9, y: 9 }, { x: 13, y: 9 },
                { x: 5, y: 13 }, { x: 9, y: 13 },
            ], BoardFieldBonus.TripleLetter);
            this.fields.addFieldBonus([
                { x: 1, y: 1 }, { x: 13, y: 1 }, { x: 2, y: 2 }, { x: 12, y: 2 },
                { x: 3, y: 3 }, { x: 11, y: 3 }, { x: 4, y: 4 }, { x: 10, y: 4 },
                { x: 4, y: 10 }, { x: 10, y: 10 }, { x: 3, y: 11 }, { x: 11, y: 11 },
                { x: 2, y: 12 }, { x: 12, y: 12 }, { x: 1, y: 13 }, { x: 13, y: 13 }
            ], BoardFieldBonus.DoubleWord);
            this.fields.addFieldBonus([
                { x: 0, y: 0 }, { x: 7, y: 0 }, { x: 14, y: 0 },
                { x: 0, y: 7 }, { x: 14, y: 7 },
                { x: 0, y: 14 }, { x: 7, y: 14 }, { x: 14, y: 14 }
            ], BoardFieldBonus.TripleWord);
            this.fields.addFieldBonus([
                { x: 7, y: 7 }
            ], BoardFieldBonus.Start);

            this.bonusColors[BoardFieldBonus.DoubleLetter] = "lightblue";
            this.bonusColors[BoardFieldBonus.DoubleWord] = "lightpink";
            this.bonusColors[BoardFieldBonus.TripleLetter] = "blue"
            this.bonusColors[BoardFieldBonus.TripleWord] = "red";
            this.bonusColors[BoardFieldBonus.Start] = "lightpink";
            this.bonusColors[BoardFieldBonus.None] = "darkgreen";
        }

        drawBoardState(state: GameState) {
            //var containerElem = document.getElementById(this.container);
            //var width = containerElem.clientWidth;
            //var height = containerElem.clientHeight;
            //this.stage.setWidth(width);
            //this.stage.setHeight(height);

            this.drawBoard();
            this.drawLetters(state);
        }

        private drawBoard(): void {

            var backgroundLayer = new Kinetic.Layer();
            this.stage.add(backgroundLayer);

            var canvas = backgroundLayer.getCanvas()._canvas;
            var context = canvas.getContext("2d");

            var max = FIELD_SIZE * ROW_SIZE;
            var maxlines = BOARD_MARGIN + max;

            //background
            context.beginPath(),
            context.rect(0, 0, canvas.width, canvas.height);
            context.fillStyle = "#FFFFCC";
            context.fill();

            //bonus fields
            for (var x = 0; x < ROW_SIZE; x++) {
                for (var y = 0; y < ROW_SIZE; y++) {
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
            context.rect(BOARD_MARGIN, lettersTop, FIELD_SIZE * MAX_LETTERS, FIELD_SIZE);
            context.fillStyle = "green";
            context.fill();
            context.strokeStyle = "black";
            context.stroke();

            //letters field lines
            for (var x = 1; x < MAX_LETTERS; x++) {
                context.beginPath();
                context.moveTo(BOARD_MARGIN + x * FIELD_SIZE, lettersTop);
                context.lineTo(BOARD_MARGIN + x * FIELD_SIZE, lettersTop + FIELD_SIZE);
                context.strokeStyle = "black";
                context.stroke();
            }
        }

        private drawLetters(state: GameState): void {

            // add the shape to the layer
            var foregroundLayer = new Kinetic.Layer();

            foregroundLayer.add(this.getLetterGroup(100, 200, "Ą"));
            foregroundLayer.add(this.getLetterGroup(300, 300, "Ł"));
            foregroundLayer.add(this.getLetterGroup(100, 300, "Ń"));

            this.stage.add(foregroundLayer);
        }

        private getLetterGroup(x: number, y: number, letter: string): Kinetic.IGroup {
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
                fill: "black",
            });

            var letterGroup = new Kinetic.Group({
                x: x,
                y: y,
                draggable: true
            });

            letterGroup.on('dragend', (e) => {
                var x = letterGroup.x() - BOARD_MARGIN;
                var y = letterGroup.y() - BOARD_MARGIN;
                var floorX = Math.floor(x / FIELD_SIZE) * FIELD_SIZE;;
                var floorY = Math.floor(y / FIELD_SIZE) * FIELD_SIZE;;

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
        }

        clearBoard(): void {
            this.stage.clear();
        }
    }

    export class GameState {

    }
}

var board: Game.Board;
var state: Game.GameState;

window.onload = () => {

    var boardCanvas = <HTMLElement>document.getElementById("boardDiv");
    boardCanvas.style.width =  screen.availWidth / 2 + "px";
    boardCanvas.style.height = screen.availHeight * 0.9 + "px";

    var labelCanvas = <HTMLLabelElement>document.getElementById("debugLabel");
    labelCanvas.textContent = screen.availWidth + " X " + screen.availHeight;

    board = new Game.Board("boardDiv");
    state = new Game.GameState();

    board.drawBoardState(state);

}

window.onresize = () => {
    board.clearBoard();
    board.drawBoardState(state);
}



   