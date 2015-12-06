/// <reference path="typings\underscore\underscore.d.ts"/>
/// <amd-dependency path="./scripts/jquery-ui" />
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
define(["require", "exports", './master', 'knockout', 'underscore', "./scripts/jquery-ui"], function (require, exports, master, ko, _) {
    var TimeLimitModel = (function () {
        function TimeLimitModel() {
        }
        return TimeLimitModel;
    })();
    var NewGameModel = (function (_super) {
        __extends(NewGameModel, _super);
        function NewGameModel() {
            _super.call(this);
            this.playersCount = ko.observable();
            this.timeLimit = ko.observable();
            this.timeLimits = ko.observableArray();
        }
        NewGameModel.prototype.initialize = function () {
            this.playersCount(2);
            for (var minutes = 5; minutes <= 30; minutes += 5) {
                var limit = {
                    description: minutes + " minut",
                    timeLimit: minutes
                };
                this.timeLimits().push(limit);
            }
            this.timeLimit(_.find(this.timeLimits(), function (limit) { return limit.timeLimit == 15; }));
        };
        NewGameModel.prototype.getNewGameRequest = function () {
            var request = {
                playerCount: this.playersCount(),
                timeLimit: this.timeLimit().timeLimit
            };
            return request;
        };
        return NewGameModel;
    })(master.MasterModel);
    var NewGameController = (function (_super) {
        __extends(NewGameController, _super);
        function NewGameController() {
            _super.apply(this, arguments);
        }
        NewGameController.prototype.init = function () {
            this.model.initialize();
            ko.applyBindings(this);
        };
        NewGameController.prototype.refreshModel = function (result) {
            _super.prototype.refreshModel.call(this, result);
        };
        NewGameController.prototype.cancelClick = function () {
            history.back();
        };
        NewGameController.prototype.newGameClick = function () {
            var _this = this;
            var data = this.model.getNewGameRequest();
            this.callPOSTMethod("/game/new", data, function (result) {
                if (result.state) {
                    var gameId = result.state.gameId;
                    var url = "board.html?gameId=" + gameId + "&join=1";
                    location.href = url;
                }
                else {
                    _this.showErrorDialogBox("Nie udało się utworzyć nowej gry");
                }
            });
        };
        return NewGameController;
    })(master.MasterControler);
    var controller = new NewGameController();
    function init() {
        master.init();
        master.hideBoardDiv();
        var model = new NewGameModel();
        controller.model = model;
        controller.init();
    }
    exports.init = init;
});
//# sourceMappingURL=newgame.js.map