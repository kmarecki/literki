/// <reference path="Scripts\typings\kineticjs\kineticjs.d.ts"/>
/// <reference path="Scripts\typings\knockout\knockout.d.ts"/>
/// <reference path="Scripts\literki.ts"/>

module Game {

    var FIELD_SIZE: number;
    var LINE_WIDTH: number;
    var BOARD_MARGIN: number;

    export function setupDisplay(fieldSize: number): void {
        FIELD_SIZE = fieldSize;
        LINE_WIDTH = fieldSize / 15;
        BOARD_MARGIN = fieldSize / 4;
    }

    export class Board {
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

        drawBoardState(state: Literki.GameState) {
            //var containerElem = document.getElementById(this.container);
            //var width = containerElem.clientWidth;
            //var height = containerElem.clientHeight;
            //this.stage.setWidth(width);
            //this.stage.setHeight(height);

            this.drawBoard(state);
        }

        private drawBoard(state: Literki.GameState): void {

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
                    var value = state.board.getFieldValue(x, y);
                    if (value == null || value.trim() != "") {
                        var bonus = state.board.getFieldBonus(x, y);
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
                    var value = state.board.getFieldValue(x, y);
                    if (value != null && value.trim() != "") {
                        letterLayer.add(this.getLetterGroup(xpos, ypos, value, false));
                    } 
                }
            }

            this.stage.add(letterLayer);

            // moving letters
            var foregroundLayer = new Kinetic.Layer();

            for (var x = 0; x < Literki.MAX_LETTERS; x++) {
                var letter = state.getCurrentPlayer().freeLetters[x];
                var xpos = BOARD_MARGIN + x * FIELD_SIZE;

                foregroundLayer.add(this.getLetterGroup(xpos, lettersTop, letter, true));
            }

            this.stage.add(foregroundLayer);
        }

        private getLetterGroup(x: number, y: number, letter: string, foreground: boolean): Kinetic.IGroup {
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
            }

            letterGroup.add(letterRect);
            letterGroup.add(letterText);
            return letterGroup;
        }

        clearBoard(): void {
            this.stage.clear();
        }
    }

    export class Info {
        private container: string;

        constructor(container: string) {
            this.container = container;
        }

        drawInfoState(state: Literki.GameState) {
            var infoDiv = <HTMLDivElement>document.getElementById(this.container);
          
        }
    }
}

var board: Game.Board;
var info: Game.Info;
var state: Literki.GameState;

window.onload = () => {

    var boardDiv = <HTMLElement>document.getElementById("boardDiv");
    boardDiv.style.width =  screen.availWidth / 2 + "px";
    boardDiv.style.height = screen.availHeight * 0.9 + "px";

    var infoDiv = <HTMLElement>document.getElementById("infoDiv");
    infoDiv.style.width = screen.availWidth / 2 + "px";
    infoDiv.style.height = screen.availHeight * 0.9 + "px";

    var debugLabel = <HTMLLabelElement>document.getElementById("debugLabel");
    
    setInterval(() => {
        debugLabel.textContent = screen.availWidth + " X " + screen.availHeight + " " + new Date().toLocaleTimeString();
    }, 1000);

    Game.setupDisplay(screen.availHeight / 20);

    board = new Game.Board("boardDiv");
    info = new Game.Info("infoDiv");

    var player1 = new Literki.GamePlayer();
    player1.playerName = "Krzyś";
    player1.freeLetters = ["h", "a", "j", "k", "b", "e", "z"]; 

    var move1 = new Literki.GameMove();
    move1.x = 5;
    move1.y = 7;
    move1.word = "literki";
    move1.direction = Literki.GameMoveDirection.Horizontal;
    player1.moves.push(move1);

    var player2 = new Literki.GamePlayer();
    player2.playerName = "Irenka";

    var move2 = new Literki.GameMove();
    move2.x = 6;
    move2.y = 6;
    move2.word = "piła";
    move2.direction = Literki.GameMoveDirection.Vertical;
    player2.moves.push(move2);

    var players = new Array<Literki.GamePlayer>();
    players.push(player1);
    players.push(player2);
    state = Literki.GameState.newGame(players);
    state.renderState();

    board.drawBoardState(state);
    info.drawInfoState(state);
}

window.onresize = () => {
    board.clearBoard();
    board.drawBoardState(state);
}



   