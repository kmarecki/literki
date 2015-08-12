/// <reference path=".\typings\kineticjs\kineticjs.d.ts"/>
/// <reference path=".\typings\jqueryui\jqueryui.d.ts" />
/// <amd-dependency path="./scripts/jquery-ui" />

import App = require('./app');
import Literki = require('./scripts/literki');
import System = require('./scripts/system');
import ko = require('knockout');
import $ = require('jquery');
import Kinetic = require('Kinetic');



var game: Literki.GameRun;
var viewModel: BoardViewModel;

class Board {
    private stage: Kinetic.IStage;
    private bonusColors: { [id: number]: string; } = {};
    private container: string;

    private FIELD_SIZE: number;
    private LINE_WIDTH: number;
    private BOARD_MARGIN: number;
    private BOARD_SIZE: number; 
    private MAX_LINES: number; 
    private LETTERS_TOP: number; 
    private CHANGE_LETTERS_LEFT: number;

    constructor(container: string) {
        this.container = container;
        
        this.stage = new Kinetic.Stage({
            container: container,
            width: 0,
            height: 0
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

    private setupDisplay(): void {
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
    }

    drawGameState(): void {
        if (!game  || !game.state) {
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
                    if (bonus == Literki.BoardFieldBonus.Start) {
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
        context.rect(this.BOARD_MARGIN, this.LETTERS_TOP, this.FIELD_SIZE * Literki.MAX_LETTERS, this.FIELD_SIZE);
        context.fillStyle = "silver";
        context.fill();
        context.strokeStyle = "black";
        context.stroke();

        //letters field lines
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

        //change letters field lines
        for (var x = 1; x < Literki.MAX_LETTERS; x++) {
            context.beginPath();
            context.moveTo(this.CHANGE_LETTERS_LEFT + x * this.FIELD_SIZE, this.LETTERS_TOP);
            context.lineTo(this.CHANGE_LETTERS_LEFT + x * this.FIELD_SIZE, this.LETTERS_TOP + this.FIELD_SIZE);
            context.strokeStyle = "black";
            context.stroke();
        }

        //letter fields
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
            move.freeLetters.forEach(l => {
                var xpos = this.BOARD_MARGIN + l.x * this.FIELD_SIZE;
                var ypos = this.BOARD_MARGIN + l.y * this.FIELD_SIZE;
                var backgroundColor = game.isNextPlayer() ? "silver" : "#FFFFCC";
                var letterGroup = this.getLetterGroup(xpos, ypos, l.letter, -1, false, backgroundColor);
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
                    var movable = game.isCurrentPlayer() && game.state.playState == Literki.GamePlayState.PlayerMove;
                    var letterGroup = this.getLetterGroup(xpos, this.LETTERS_TOP, letter, x, movable);
                    foregroundLayer.add(letterGroup);
                }
            }

            this.stage.add(foregroundLayer);
        }
    }

    private getLetterGroup(x: number, y: number, letter: string, index: number, foreground: boolean, backgroundColor: string = "#FFFFCC"): Kinetic.IGroup {
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

            letterGroup.on('dragstart',(e) => {
                letterGroup.moveToTop();
            });

            letterGroup.on('dragend',(e) => {
                var dragEnd = this.getDragEnd(letterGroup);

                var tween = new Kinetic.Tween({
                    node: letterGroup,
                    x: dragEnd.x,
                    y: dragEnd.y,
                    duration: 0.1
                });
                tween.play();

                switch (dragEnd.endType) {
                    case Literki.LetterPositionType.BoardField: {
                        game.putLetterOnBoard(letter, index, dragEnd.fieldX, dragEnd.fieldY);
                        viewModel.refreshBindings();
                        break;
                    }
                    case Literki.LetterPositionType.ExchangeLetter: 
                        game.addLetterToExchange(letter, index);
                        viewModel.refreshBindings();
                        break;
                    case Literki.LetterPositionType.FreeLetter: 
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
    }

        
        
    private getDragEnd(letterGroup: Kinetic.IGroup): { x: number; y: number; fieldX: number; fieldY: number; endType: Literki.LetterPositionType; } {
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
        } else {
            //free letters fields
            if (fieldX == Literki.ROW_SIZE / 2) {
                fieldX++;
                floorX += this.FIELD_SIZE;
            }
            x = x <= floorX + this.FIELD_SIZE / 3 * 2 ? floorX : floorX + this.FIELD_SIZE;
            x += this.BOARD_MARGIN;
            y = this.LETTERS_TOP;
        }

        var endType = Literki.LetterPositionType.BoardField;
        if (fieldY >= Literki.ROW_SIZE) {
            endType = fieldX > Literki.ROW_SIZE / 2 ? Literki.LetterPositionType.ExchangeLetter : Literki.LetterPositionType.FreeLetter;
        }

        return { x: x, y: y, fieldX: fieldX, fieldY: fieldY, endType: endType }
    }

    private normalizeDragEndPositionX(x: number): number {
        var lastTileX = (Literki.ROW_SIZE - 1) * this.FIELD_SIZE;
        return x >= 0 ?
            (x >= lastTileX ?  lastTileX : x) :
            0;
    }

    private normalizeDragEndPositionY(y: number): number {
        return y >= 0 ? y : 0;
    }


    clearBoard(): void {
        this.stage.clear();
    }
}

var game: Literki.GameRun

class BoardViewModelWord {
    word: string;
    points: number;
}

class PlayerViewModel {
    isCurrentPlayer = ko.observable(false);
    isCurrentUser = ko.observable(false);
    isAlive = ko.observable(false);
    playerName = ko.observable("");
    points = ko.observable(0);
    remainingTime = ko.observable('');
    parentModel: BoardViewModel;

    constructor(parent: BoardViewModel) {
        this.parentModel = parent;
    }

    findAndRefresh(players: Literki.GamePlayer[], currentPlayer: Literki.IGamePlayer): void {
        players.forEach(p => {
            if (p.playerName == this.playerName()) {
                this.refresh(p, currentPlayer);
            }
        });
    }

    refresh(player: Literki.GamePlayer, currentPlayer: Literki.IGamePlayer): void {
        this.playerName(player.playerName);
        this.points((<Literki.GamePlayer>player).getPoints());
        this.remainingTime(System.formatSeconds(player.remainingTime, "mm:ss"));
        this.isCurrentPlayer(player.userId == game.getCurrentPlayer().userId);
        this.isCurrentUser(player.userId == game.currentUserId);
        this.isAlive(player.isAlive());
    }

}

class MoveHistoryViewModel {

    playerMoves = ko.observableArray();

    constructor(moves: string[]) {
        moves.forEach(m => this.playerMoves.push(m));
    }
}

class BoardViewModel extends App.BaseViewModel {

    private self = this;
    private newWords = ko.observableArray<BoardViewModelWord>();
    private changeLetters = ko.observable("");
    private allPlayers = new Array<PlayerViewModel>();

    board: Board;
    errorMessage = ko.observable("");
    historyMoves = ko.observableArray<MoveHistoryViewModel>();


    setNewWords(newWords: BoardViewModelWord[]): void {
        this.cleanNewWords();
        newWords.forEach(word => this.newWords.push(word));
    }

    private cleanNewWords(): void {
        this.newWords.removeAll();
    }

    setChangeLetters(changeLetters: string[]): void {
        this.cleanChangeLetters()
        this.changeLetters(changeLetters.join(" "));
    }
    private cleanChangeLetters(): void {
        this.changeLetters("");
    }

    getAllPlayers(): PlayerViewModel[]{
        return this.getPlayers(0, game.getPlayers().length);
    }
        
    getPlayers(start: number, end: number): PlayerViewModel[] {
        var players = new Array<PlayerViewModel>();

        game.getPlayers().slice(start, end).forEach(p => {
            var playerModel = new PlayerViewModel(this);
            playerModel.refresh(<Literki.GamePlayer>p, game.getCurrentPlayer());
            players.push(playerModel);
            this.allPlayers.push(playerModel);
        });

        return players;
    }

    getPlayersRow(): Number[] {
        return game.getPlayers().length > 2 ? [0, 1] : [0];
    }

    refreshBoard(): void {
        this.board.clearBoard();
        this.board.drawGameState();
    }

    runState(state: Literki.GameState): void {
        game.runState(state);
        viewModel.board.drawGameState();
    }

    init(): void {
        var gameId = System.urlParam("gameId");
        var join = System.urlParam("join");

        if (join) {
            $.ajax({
                type: "GET",
                url: "/game/join",
                data: { gameId: gameId },
                dataType: "json",
                success: result => this.initRefresh(result)
            });
        } else {
            if (gameId != null) {
                $.ajax({
                    type: "GET",
                    url: "/game/get",
                    data: { gameId: gameId },
                    dataType: "json",
                    success: result => this.initRefresh(result)
                });
            } else {
                $.ajax({
                    type: "GET",
                    url: "/game/new",
                    dataType: "json",
                    success: result => this.initRefresh(result)
                });
            }
        }
    }

    private initRefresh(result: any): void {
        game = new Literki.GameRun(result.userId);
        this.refreshModel(result);
        this.refreshBoard();
        ko.applyBindings(this);
    }

    //alive(): void {
    //    $.ajax({
    //        type: "POST",
    //        url: "/game/alive",
    //        contentType: 'application/json',
    //        data: JSON.stringify({
    //            gameId: game.getState().gameId,
    //            currentPlayerId: game.getCurrentPlayer().userId,
    //            playState: game.getState().playState
    //        }),
    //        dataType: "json",
    //        success: (result) => {
    //            //To refresh errorMessage
    //            super.refreshModel(result);

    //            if (!result.forceRefresh) {
    //                if (result.remainingTime != null) {
    //                    game.getCurrentPlayer().remainingTime = result.remainingTime;
    //                }
    //                this.refreshPlayerModels();
    //            } else {
    //                this.refreshClick();
    //            }
    //        }
    //    });
    //}


    refreshClick(): void {
        this.callGETMethod("/game/get");
    }

    startClick(): void {
        this.callGETMethod("/game/start");
    }

    pauseClick(): void {
        this.callGETMethod("/game/pause");
    }

    foldClick(): void {
        this.callGETMethod("/game/fold");
    }

    exchangeClick(): void {
        this.callGETMethod("/game/exchange", true, {
            gameId: game.state.gameId,
            exchangeLetters: game.getExchangeLetters()
        });
    }

    alive(): void {
        this.callPOSTMethod("/player/alive", false,{
            gameId: game.state.gameId,
            currentPlayerId: game.getCurrentPlayer().userId,
            playState: game.state.playState
        });
    }


    private callGETMethod(name: string,  refreshBoard: boolean = true, data: any = { gameId: game.state.gameId } ): void {
        $.ajax({
            type: "GET",
            url: name,
            data: data,
            dataType: "json",
            success: (result) => this.refreshAfterHTMLMethodCall(result, refreshBoard)
        });
    }

    private callPOSTMethod(name: string, refreshBoard: boolean = true, data: any = { gameId: game.state.gameId }): void {
        $.ajax({
            type: "POST",
            url: name,
            contentType: "application/json",
            data: JSON.stringify(data),
            dataType: "json",
            success: (result) => this.refreshAfterHTMLMethodCall(result, refreshBoard)
        });
    }

    private refreshAfterHTMLMethodCall(result: any, refreshBoard: boolean): void  {
        var refresh = refreshBoard || result.forceRefresh;
        this.refreshModel(result, refresh);
        if (refresh) {
            this.refreshBoard();
        }
    }


    moveClick(): void {
        var move = game.getActualMove();
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

    refreshBindings(): void {
        var newWords = game.getNewWords();
        this.setNewWords(newWords);

        var changeLetters = game.getExchangeLetters();
        this.setChangeLetters(changeLetters);
    }

    protected refreshModel(result: any, fullRefresh: boolean = true): void {
        super.refreshModel(result);

        if (result.state) {
            var state = Literki.GameState.fromJSON(<Literki.IGameState>result.state);
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
                        this.showAskDialogBox(`Czy akceptujesz ruch gracza ${game.getCurrentPlayer().playerName}?`, (result) => {
                            this.callGETMethod("/game/approve", true, { gameId: game.state.gameId, approve: result });
                        });
                    }

                    if (game.isWaitingForMoveApproval()) {
                        this.showPersistentInfoDialogBox(`Oczekiwanie na akceptację ruchu przez gracza ${game.getNextPlayer().playerName}.`);
                    }
                }
            }
        }
    }

    private refreshPlayerModels(): void {
        if (game != null) {
            this.allPlayers.forEach(p => p.findAndRefresh(<Literki.GamePlayer[]>game.getPlayers(), game.getCurrentPlayer()));
        }
    }

    private refreshHistoryMoves(): void {
        this.historyMoves.removeAll();
        var players = game.getPlayers();
        var moves = new Array<MoveHistoryViewModel>();
        var movesTotals: { [id: string]: number } = {};
        var moveIndex = 0;
        var lastMove = _.max(players, p => p.moves.length).moves.length;
        while (moveIndex < lastMove) {
            var playerMoves = new Array<string>();
            players.forEach(p => {
                var moveDesc = ""
                var move = p.moves.length > moveIndex ?
                    p.moves[moveIndex] :
                    null;
                if (move) {
                    var total = (p.userId in movesTotals) ? movesTotals[p.userId] : 0;
                    var sum = move.words.length > 0 ?
                        move.words.map(w => w.points).reduce((total, x) => total += x) :
                        0;
                    total += sum;
                    movesTotals[p.userId] = total;
                    switch (move.moveType) {
                        case Literki.MoveType.Exchange: moveDesc = `${total} (Wymiana)`; break;
                        case Literki.MoveType.Fold: moveDesc = `${total } (Pas)`; break;
                        case Literki.MoveType.WrongMove: moveDesc = `${total} (Błędny ruch)`; break;
                        case Literki.MoveType.CheckMoveFailed: moveDesc = `${total} (Błędne sprawdzenie)`; break;
                        case Literki.MoveType.Move: moveDesc = `${total} (${sum})`; break;
                    }
                }
                playerMoves.push(moveDesc);
            });
            var moveModel = new MoveHistoryViewModel(playerMoves);
            this.historyMoves.push(moveModel);
            moveIndex++;
        }
    }
}

export function init(): void {

    $.ajaxSetup({ cache: false });

    var debugLabel = <HTMLLabelElement>document.getElementById("debugLabel");

    viewModel = new BoardViewModel();
    viewModel.board = new Board("boardDiv");
    viewModel.init();

    setInterval(() => {
        debugLabel.textContent =
            `Screen: ${screen.availWidth} X ${screen.availHeight},  Window: ${window.innerWidth} X ${window.innerHeight} ${new Date().toLocaleTimeString() }`;
        viewModel.alive();
    }, 1000);
}

window.onresize = () => {
    viewModel.refreshBoard();
}






   