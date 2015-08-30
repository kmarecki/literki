var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
define(["require", "exports", './master', 'knockout'], function (require, exports, master, ko) {
    var NewGameModel = (function (_super) {
        __extends(NewGameModel, _super);
        function NewGameModel() {
            _super.apply(this, arguments);
        }
        return NewGameModel;
    })(master.MasterModel);
    var NewGameController = (function (_super) {
        __extends(NewGameController, _super);
        function NewGameController() {
            _super.apply(this, arguments);
        }
        NewGameController.prototype.init = function () {
            ko.applyBindings(this);
        };
        NewGameController.prototype.refreshModel = function (result) {
            _super.prototype.refreshModel.call(this, result);
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