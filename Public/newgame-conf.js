require.config({
    baseUrl: "",
    paths: {
        knockout: "./scripts/knockout-3.2.0.debug",
        jquery: "./scripts/jquery",
        moment: "./scripts/moment",
        underscore: "./scripts/underscore",
        newgame: "newgame"
    }
});

define(["require", "exports", 'newgame'], function (require, exports, newgame) {
    newgame.init();
});
