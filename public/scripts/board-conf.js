require.config({
    baseUrl: "",
    paths: {
        knockout: "components/knockout/dist/knockout.debug",
        konva: "components/konva/konva",
        jquery: "components/jquery/dist/jquery",
        moment: "components/moment/moment",
        underscore: "components/underscore/underscore",
        master: "scripts/master",
        board: "scripts/board",
    },
    shim: {
        jqueryui: ["jquery"]
    }
});

define(["require", "exports", "board"], function (require, exports, board) {
    board.init();
});