﻿require.config({
    baseUrl: "",
    paths: {
        knockout: "./scripts/knockout-3.2.0.debug",
        jquery: "./scripts/jquery",
        moment: "./scripts/moment",
        underscore: "./scripts/underscore",
        profile: "profile"
    }
});

define(["require", "exports", 'profile'], function (require, exports, profile) {
    profile.init();
});