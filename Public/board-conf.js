require.config({
    baseUrl: "",
    paths: {
        knockout: "./scripts/knockout-3.2.0.debug",
        jquery: "./scripts/jquery",
        jqueryui: "./scripts/jquery-ui",
        moment: "./scripts/moment",
        underscore: "./scripts/underscore",
        Kinetic: "./scripts/kinetic-v5.1.0",
        board: "board"
    },
    shim: {
        jqueryui: ["jquery"]
    }
});

define(["require", "exports", "board"], function (require, exports, board) {
    board.init();
});
