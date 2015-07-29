require.config({
    baseUrl: "",
    paths: {
        knockout: "./scripts/knockout-3.2.0.debug",
        jquery: "./scripts/jquery-1.11.2",
        underscore: "./scripts/underscore",
        main: "main"
    }
});

define(["require", "exports", 'main'], function (require, exports, main) {
    main.init();
});
