require.config({
    baseUrl: "",
    paths: {
        knockout: "components/knockout/dist/knockout.debug",
        jquery: "components/jquery/dist/jquery",
        moment: "components/moment/moment",
        underscore: "components/underscore/underscore",
        master: "scripts/master",
        newgame: "scripts/newgame"
    },
    shim: {
        jqueryui: ["jquery"]
    }
});

define(["require", "exports", "newgame"], function (require, exports, newgame) {
    newgame.init();
});