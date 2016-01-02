/// <reference path="..\..\typings\mongoose\mongoose.d.ts"/>
var mongoose = require('mongoose');
var Repository = (function () {
    function Repository() {
        this.connected = false;
    }
    Repository.prototype.open = function (uri) {
        var _this = this;
        this.uri = uri;
        mongoose.connection.on('connected', function () {
            console.log('Mongoose default connection open to ' + _this.uri);
            _this.connected = true;
        });
        mongoose.connection.on('error', function (err) {
            console.log('Mongoose default connection error: ' + err);
        });
        mongoose.connection.on('disconnected', function () {
            console.log('Mongoose default connection disconnected');
            this.connected = false;
        });
        process.on('SIGINT', function () {
            mongoose.connection.close(function () {
                console.log('Mongoose default connection disconnected through app termination');
                process.exit(0);
            });
        });
    };
    Repository.prototype.connect = function () {
        if (this.connected) {
            return;
        }
        mongoose.connect(this.uri);
    };
    return Repository;
})();
exports.Repository = Repository;
//# sourceMappingURL=mongo.js.map