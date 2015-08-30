var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
define(["require", "exports", './master', 'knockout', 'jquery'], function (require, exports, master, ko, $) {
    var ProfileModel = (function (_super) {
        __extends(ProfileModel, _super);
        function ProfileModel() {
            _super.apply(this, arguments);
        }
        return ProfileModel;
    })(master.MasterModel);
    var ProfileController = (function (_super) {
        __extends(ProfileController, _super);
        function ProfileController() {
            _super.apply(this, arguments);
        }
        ProfileController.prototype.init = function () {
            var _this = this;
            $.ajax({
                type: "GET",
                url: "/player/get",
                dataType: "json",
                success: function (result) {
                    _this.refreshModel(result);
                    ko.applyBindings(_this);
                }
            });
        };
        ProfileController.prototype.refreshModel = function (result) {
            _super.prototype.refreshModel.call(this, result);
        };
        return ProfileController;
    })(master.MasterControler);
    var controller = new ProfileController();
    function init() {
        master.init();
        master.hideBoardDiv();
        var model = new ProfileModel();
        controller.model = model;
        controller.init();
    }
    exports.init = init;
});
//# sourceMappingURL=profile.js.map