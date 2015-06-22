var App;
(function (App) {
    function urlParam(name) {
        var results = new RegExp('[\?&]' + name + '=([^&#]*)').exec(window.location.href);
        return results != null ? results[1] : null;
    }
    App.urlParam = urlParam;
})(App || (App = {}));
//# sourceMappingURL=app.js.map