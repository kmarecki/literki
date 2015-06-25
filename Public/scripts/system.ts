/// <reference path="..\typings\moment\moment.d.ts"/>

module System {
    export function urlParam(name: string): string {
        var results = new RegExp('[\?&]' + name + '=([^&#]*)').exec(window.location.href);
        return results != null  ? results[1] : null;
    }

    export function formatSeconds(seconds: number, format: string): string {
            var hours = Math.floor(seconds / 60);
            var minutes = seconds % 60;
            return moment(hours + "" + minutes, "mmss").format("mm:ss");
        }
}