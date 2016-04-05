define(["require", "exports", 'moment'], function (require, exports, moment) {
    function urlParam(name) {
        var results = new RegExp('[\?&]' + name + '=([^&#]*)').exec(window.location.href);
        return results != null ? results[1] : null;
    }
    exports.urlParam = urlParam;
    function formatSeconds(seconds, format) {
        var minutes = Math.floor(seconds / 60);
        var rest = seconds % 60;
        return moment({ minutes: minutes, second: rest }).format(format);
    }
    exports.formatSeconds = formatSeconds;
});
//# sourceMappingURL=system2.js.map