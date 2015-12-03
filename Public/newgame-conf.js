require.config({
    baseUrl: "",
    paths: {
        knockout: "./scripts/knockout-3.2.0.debug",
        jquery: "./scripts/jquery",
        jqueryui: "./scripts/jquery-ui",
        moment: "./scripts/moment",
        underscore: "./scripts/underscore",
        Kinetic: "./scripts/kinetic-v5.1.0",
        newgame: "newgame"
    },
    shim: {
        jqueryui: ["jquery"]
    }
});

define(["require", "exports", "newgame"], function (require, exports, newgame) {
    newgame.init();
});
