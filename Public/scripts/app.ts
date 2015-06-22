module App {
    export function urlParam(name: string): string {
        var results = new RegExp('[\?&]' + name + '=([^&#]*)').exec(window.location.href);
        return results != null  ? results[1] : null;
    }
}