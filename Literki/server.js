var connect = require('connect');
var serveStatic = require('serve-static');
var port = process.env.port || 1337;
var app = connect();
app.use(serveStatic('public'));
app.listen(port);
//# sourceMappingURL=server.js.map