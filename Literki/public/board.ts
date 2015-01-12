/// <reference path="Scripts\typings\kineticjs\kineticjs.d.ts"/>
/// <reference path="Scripts\typings\knockout\knockout.d.ts"/>
/// <reference path="Scripts\literki.ts"/>

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
            var letter = game.getCurrentPlayer().freeLetters[x];
            var xpos = BOARD_MARGIN + x * FIELD_SIZE;

            foregroundLayer.add(this.getLetterGroup(xpos, lettersTop, letter, x, true));
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
            letterGroup.on('dragend', (e) => {
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

class BoardViewModel {

    private self = this;
    private newWords: KnockoutObservableArray<BoardViewModelWord>;

    constructor() {
        this.newWords = ko.observableArray<BoardViewModelWord>();
    }

    getNewWords() {
        return this.newWords;
    }

    setNewWords(newWords: BoardViewModelWord[]) {
        this.newWords.removeAll();
        newWords.forEach(word => this.newWords.push(word));
    }
}


var board: Board;
var game: Literki.GameRun;
var viewModel: BoardViewModel;


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

    setupDisplay(screen.availHeight / 20);

    board = new Board("boardDiv");

    var player1 = new Literki.GamePlayer();
    player1.playerName = "Krzyś";
    player1.freeLetters = ["h", "a", "j", "k", "b", "e", "z"]; 

    var word1 = new Literki.GameMoveWord("literki", 5, 7, Literki.GameMoveDirection.Horizontal, 10);
    var move1 = new Literki.GameMove();
    move1.words.push(word1);
    player1.moves.push(move1);

    var player2 = new Literki.GamePlayer();
    player2.playerName = "Irenka";

    var word2 = new Literki.GameMoveWord("piła", 6, 6, Literki.GameMoveDirection.Vertical, 6);
    var move2 = new Literki.GameMove();
    move2.words.push(word2);
    player2.moves.push(move2);

    var players = new Array<Literki.GamePlayer>();
    players.push(player1);
    players.push(player2);

    var state = Literki.GameRun.newGame(players);
    game = new Literki.GameRun();
    game.runState(state);

    board.drawGameState(game);

    viewModel = new BoardViewModel();
    viewModel.setNewWords([
        { word: "Jako", points: 10 },
        { word: "Dam", points: 6 }
    ]);

    ko.applyBindings(viewModel);
}

window.onresize = () => {
    board.clearBoard();
    board.drawGameState(game);
}



   