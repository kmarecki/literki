var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
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
        ProfileModel.prototype.fromEntity = function (userProfile) {
            this.entity = userProfile;
            this.userName(userProfile.userName);
            this.email(userProfile.email);
        };
        ProfileModel.prototype.toEntity = function () {
            this.entity.email = this.email();
            this.entity.userName = this.userName();
            return this.entity;
        };
        return ProfileModel;
    })(master.MasterModel);
    var ProfileController = (function (_super) {
        __extends(ProfileController, _super);
        function ProfileController() {
            _super.apply(this, arguments);
        }
        ProfileController.prototype.init = function () {
            var _this = this;
            _super.prototype.callGETMethod.call(this, "/player/get", undefined, function (result) {
                _this.refreshModel(result);
                ko.applyBindings(_this);
            });
        };
        ProfileController.prototype.refreshModel = function (result) {
            _super.prototype.refreshModel.call(this, result);
            var userProfile = result.userProfile;
            this.model.fromEntity(userProfile);
        };
        ProfileController.prototype.cancelClick = function () {
            history.back();
        };
        ProfileController.prototype.okClick = function () {
            var _this = this;
            var userProfile = this.model.toEntity();
            _super.prototype.callPOSTMethod.call(this, "/player/update", userProfile, function (result) {
                _this.refreshModel(result);
                if (!result.errorMessage) {
                    history.back();
                }
            });
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