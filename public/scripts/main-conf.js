require.config({
    baseUrl: "",
    paths: {
        knockout: "components/knockout/dist/knockout.debug",
        jquery: "components/jquery/dist/jquery",
        moment: "components/moment/moment",
        underscore: "components/underscore/underscore",
        master: "scripts/master",
        main: "scripts/main"
    }
});

define(["require", "exports", 'main'], function (require, exports, main) {
    main.init();
});