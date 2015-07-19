import moment = require('moment');

export function urlParam(name: string): string {
    var results = new RegExp('[\?&]' + name + '=([^&#]*)').exec(window.location.href);
    return results != null  ? results[1] : null;
}

export function formatSeconds(seconds: number, format: string): string {
    var minutes = Math.floor(seconds / 60);
    var rest = seconds % 60;
    return moment({ minutes: minutes, second: rest }).format(format);
}
