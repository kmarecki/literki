require.config({
    baseUrl: "",
    paths: {
        knockout: "./scripts/knockout-3.2.0.debug",
        jquery: "./scripts/jquery-1.11.2",
        main: "main"
    }
});

define(["require", "exports", 'main'], function (require, exports, main) {
    var viewModel = new main.MainViewModel();
    viewModel.init();
});
