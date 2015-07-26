﻿/// <reference path=".\typings\kineticjs\kineticjs.d.ts"/>

import Literki = require('./scripts/literki');
import System = require('./scripts/system');
import ko = require('knockout');
import $ = require('jquery');
import Kinetic = require('Kinetic');


    var FIELD_SIZE: number;
    var LINE_WIDTH: number;
    var BOARD_MARGIN: number;

    function setupDisplay(fieldSize: number): void {
        FIELD_SIZE = fieldSize;
        LINE_WIDTH = fieldSize / 15;
        BOARD_MARGIN = fieldSize / 4;
    }

    var game: Literki.GameRun;
    var viewModel: BoardViewModel;

    class Board {
        private stage: Kinetic.IStage;
        private bonusColors: { [id: number]: string; } = {};
        private container: string;

        private max = FIELD_SIZE * Literki.ROW_SIZE;
        private maxlines = BOARD_MARGIN + this.max;
        private lettersTop = BOARD_MARGIN + this.maxlines + BOARD_MARGIN;
        private changeLettersLeft = BOARD_MARGIN + (Literki.MAX_LETTERS + 1) * FIELD_SIZE;

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

        drawGameState(): void {
            if (game == null || game.getState() == null) {
                return;
            }

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
            for (var x = BOARD_MARGIN; x <= this.maxlines; x += FIELD_SIZE) {
                context.beginPath();
                context.moveTo(x, BOARD_MARGIN);
                context.lineTo(x, this.maxlines);
                context.lineWidth = LINE_WIDTH;
                context.strokeStyle = "black";
                context.stroke();
            }

            //horizontal lines
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

            //letters field lines
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

            //change letters field lines
            for (var x = 1; x < Literki.MAX_LETTERS; x++) {
                context.beginPath();
                context.moveTo(this.changeLettersLeft + x * FIELD_SIZE, this.lettersTop);
                context.lineTo(this.changeLettersLeft + x * FIELD_SIZE, this.lettersTop + FIELD_SIZE);
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
            } else {
                //free letters fields
                x = x <= floorX + FIELD_SIZE / 2 ? floorX : floorX + FIELD_SIZE;
                x += BOARD_MARGIN;
                y = this.lettersTop;
            }

            var endType = Literki.LetterPositionType.BoardField;
            if (fieldY >= Literki.ROW_SIZE) {
                endType = fieldX > Literki.ROW_SIZE / 2 ? Literki.LetterPositionType.ExchangeLetter : Literki.LetterPositionType.FreeLetter;
            }

            return { x: x, y: y, fieldX: fieldX, fieldY: fieldY, endType: endType }
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
        playerName = ko.observable("");
        points = ko.observable(0);
        remainingTime = ko.observable('');
        parentModel: BoardViewModel;

        constructor(parent: BoardViewModel) {
            this.parentModel = parent;
        }

        findAndRefresh(players: Literki.IGamePlayer[], currentPlayer: Literki.IGamePlayer): void {
            players.forEach(p => {
                if (p.playerName == this.playerName()) {
                    this.refresh(p, currentPlayer);
                }
            });
        }

        refresh(player: Literki.IGamePlayer, currentPlayer: Literki.IGamePlayer): void {
            this.playerName(player.playerName);
            this.points((<Literki.GamePlayer>player).getPoints());
            this.remainingTime(System.formatSeconds(player.remainingTime, "mm:ss"));
            this.isCurrentPlayer(player.userId == game.currentUserId);
        }

    }

    class BoardViewModel {

        private self = this;
        private newWords = ko.observableArray<BoardViewModelWord>();
        private changeLetters = ko.observableArray<string>();
        private allPlayers = new Array<PlayerViewModel>();

        board: Board;
        errorMessage = ko.observable("");


        setNewWords(newWords: BoardViewModelWord[]): void {
            this.cleanNewWords();
            newWords.forEach(word => this.newWords.push(word));
        }

        private cleanNewWords(): void {
            this.newWords.removeAll();
        }

        setChangeLetters(changeLetters: string[]): void {
            this.cleanChangeLetters()
            changeLetters.forEach(letter => this.changeLetters.push(letter));
        }
        private cleanChangeLetters(): void {
            this.changeLetters.removeAll();
        }
        

        getPlayers(start: number, end: number): PlayerViewModel[] {
            var players = new Array<PlayerViewModel>();

            game.getPlayers().slice(start, end).forEach(p => {
                var playerModel = new PlayerViewModel(this);
                playerModel.refresh(p, game.getCurrentPlayer());
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

        alive(): void {
            $.ajax({
                type: "POST",
                url: "/game/alive",
                contentType: 'application/json',
                data: JSON.stringify({
                    gameId: game.getState().gameId,
                    currentPlayerId: game.getCurrentPlayer().userId
                }),
                dataType: "json",
                success: (result) => {
                    this.errorMessage(result.errorMessage);

                    if (!result.forceRefresh) {
                        if (result.remainingTime != null) {
                            game.getCurrentPlayer().remainingTime = result.remainingTime;
                        }
                        this.refreshPlayerModels();
                    } else {
                        this.refreshClick();
                    }
                }
            });
        }


        refreshClick(): void {
            this.callGameMethod("get");
        }

        startClick(): void {
            this.callGameMethod("start");
        }

        pauseClick(): void {
            this.callGameMethod("pause");
        }

        foldClick(): void {
            this.callGameMethod("fold");
        }

        private callGameMethod(name: string): void {
            $.ajax({
                type: "GET",
                url: "/game/" + name,
                data: { gameId: game.getState().gameId },
                dataType: "json",
                success: (result) => {
                    this.refreshModel(result);
                    this.refreshBoard();
                }
            });
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

            var changeLetters = game.getChangeLetters();
            this.setChangeLetters(changeLetters);
        }

        private refreshModel(result: any): void {
            this.errorMessage(result.errorMessage);

            if (result.state != null) {
                var state = Literki.GameState.fromJSON(<Literki.IGameState>result.state);
                game.runState(state);
                this.cleanNewWords();
                this.cleanChangeLetters();
            }
            this.refreshPlayerModels();
        }

        private refreshPlayerModels(): void {
            if (game != null) {
                this.allPlayers.forEach(p => p.findAndRefresh(game.getPlayers(), game.getCurrentPlayer()));
            }
        }
    }

   export function init(): void {

        var boardDiv = <HTMLElement>document.getElementById("boardDiv");
        boardDiv.style.width = screen.availWidth / 2 + "px";
        boardDiv.style.height = screen.availHeight * 0.85 + "px";

        var infoDiv = <HTMLElement>document.getElementById("infoDiv");
        infoDiv.style.width = screen.availWidth / 2 - 50 + "px";
        infoDiv.style.height = boardDiv.style.height;

        var debugLabel = <HTMLLabelElement>document.getElementById("debugLabel");

        setupDisplay(screen.availHeight / 20);

        viewModel = new BoardViewModel();
        viewModel.board = new Board("boardDiv");
        viewModel.init();

        setInterval(() => {
            debugLabel.textContent = screen.availWidth + " X " + screen.availHeight + " " + new Date().toLocaleTimeString();
            viewModel.alive();
        }, 1000);
    }

    window.onresize = () => {
        viewModel.refreshBoard();
    }






   