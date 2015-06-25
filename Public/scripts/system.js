/// <reference path="..\typings\moment\moment.d.ts"/>
var System;
(function (System) {
    function urlParam(name) {
        var results = new RegExp('[\?&]' + name + '=([^&#]*)').exec(window.location.href);
        return results != null ? results[1] : null;
    }
    System.urlParam = urlParam;
    function formatSeconds(seconds, format) {
        var hours = Math.floor(seconds / 60);
        var minutes = seconds % 60;
        return moment(hours + "" + minutes, "mmss").format("mm:ss");
    }
    System.formatSeconds = formatSeconds;
})(System || (System = {}));
//# sourceMappingURL=system.js.map