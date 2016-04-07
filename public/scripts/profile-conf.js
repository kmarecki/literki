require.config({
    baseUrl: "",
    paths: {
        knockout: "components/knockout/dist/knockout.debug",
        jquery: "components/jquery/dist/jquery",
        moment: "components/moment/moment",
        underscore: "components/underscore/underscore",
        master: "scripts/master",
        profile: "scripts/profile"
    }
});

define(["require", "exports", 'profile'], function (require, exports, profile) {
    profile.init();
});