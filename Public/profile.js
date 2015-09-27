var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
define(["require", "exports", './master', 'knockout'], function (require, exports, master, ko) {
    var LanguageModel = (function () {
        function LanguageModel(description, shortcut) {
            this.description = description;
            this.shortcut = shortcut;
        }
        return LanguageModel;
    })();
    var ProfileModel = (function (_super) {
        __extends(ProfileModel, _super);
        function ProfileModel() {
            _super.call(this);
            this.userName = ko.observable("");
            this.email = ko.observable("");
            this.defaultLanguage = ko.observable();
            this.availableLanguages = ko.observableArray([
                new LanguageModel("polski", "pl"),
                new LanguageModel("english", "en"),
                new LanguageModel("deutsch", "de")
            ]);
            this.defaultLanguage(this.availableLanguages()[1]);
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
            //$.ajax({
            //    type: "GET",
            //    url: "/player/get",
            //    dataType: "json",
            //    success: (result) => {
            //        this.refreshModel(result);
            //        ko.applyBindings(this);
            //    }
            //});
            _super.prototype.callGETMethod.call(this, "/player/get", undefined, function (result) {
                _this.refreshModel(result);
                ko.applyBindings(_this);
            });
        };
        ProfileController.prototype.refreshModel = function (result) {
            _super.prototype.refreshModel.call(this, result);
            var userProfile = result.userProfile;
            this.model.userName(userProfile.userName);
            this.model.email(userProfile.email);
        };
        ProfileController.prototype.cancelClick = function () {
            history.back();
        };
        ProfileController.prototype.okClick = function () {
            history.back();
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