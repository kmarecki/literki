var fs = require('fs');
var path = require('path');
var server = require('../server');
var literki = require('../scripts/literki');
var repo = server.getGameRepository();
function beforeTestSuite(done, state) {
    server.start();
    state.players.forEach(function (p) { return p.lastSeen = new Date(); });
    repo.saveState(state, function (err) { return done(err); });
}
exports.beforeTestSuite = beforeTestSuite;
function afterTestSuite(done) {
    server.stop();
    repo.removeAllStates(function (err) { return done(err); });
}
exports.afterTestSuite = afterTestSuite;
function loadState(file) {
    var filePath = path.join('states', file + '.json');
    var stateJSON = fs.readFileSync(filePath, 'utf8');
    var initState = JSON.parse(stateJSON.replace(/^\uFEFF/, ''));
    return literki.GameState.fromJSON(initState);
}
exports.loadState = loadState;
//# sourceMappingURL=helper.js.map