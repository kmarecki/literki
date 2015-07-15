require.config({
    baseUrl: "",
    paths: {
        knockout: "./scripts/knockout-3.2.0.debug",
        jquery: "./scripts/jquery-1.11.2",
        moment: "./scripts/moment",
        Kinetic: "./scripts/kinetic-v5.1.0",
        board: "board"
    }
});

define(["require", "exports", 'board'], function (require, exports, board) {
    board.init();
});
