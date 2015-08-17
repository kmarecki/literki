var stream = require("stream");
function formatError(err) {
    return err.name + ": " + err.message;
}
exports.formatError = formatError;
function createLiner() {
    var _this = this;
    var liner = new stream.Transform({ objectMode: true });
    liner._transform = function (chunk, encoding, done) {
        var data = chunk.toString();
        if (_this._lastLineData)
            data = _this._lastLineData + data;
        var lines = data.split(/\r\n|\n/);
        _this._lastLineData = lines.splice(lines.length - 1, 1)[0];
        lines.forEach(_this.push.bind(_this));
        done();
    };
    liner._flush = function (done) {
        if (_this._lastLineData) {
            _this.push(_this._lastLineData);
        }
        _this._lastLineData = null;
        done();
    };
    return liner;
}
exports.createLiner = createLiner;
//# sourceMappingURL=util.js.map