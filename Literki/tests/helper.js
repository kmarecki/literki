var server = require('../server');
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
//# sourceMappingURL=helper.js.map