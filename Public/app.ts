export class BaseViewModel {

    protected setErrorMessage(errorMessage: string): void {
        var winW = window.innerWidth;
        var winH = window.innerHeight;
        var dialogoverlay = document.getElementById('dialogoverlay');
        var dialogbox = document.getElementById('dialogbox');

        dialogoverlay.style.height = winH + "px";
        dialogbox.style.left = (winW / 2) - (550 * .5) + "px";
        dialogbox.style.top = "100px";
        dialogbox.style.display = "block";
        document.getElementById('dialogboxhead').innerHTML = "Wystąpił błąd";
        document.getElementById('dialogboxbody').innerHTML = errorMessage;
        dialogoverlay.style.display = "block";
    }

    private closeMessageBoxClick(): void {
        document.getElementById('dialogbox').style.display = "none";
        document.getElementById('dialogoverlay').style.display = "none";

    }
} 