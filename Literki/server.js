/// <reference path="typings\express\express.d.ts"/>
var express = require('express');
var port = process.env.port || 1337;
var app = express();
app.use(express.static(__dirname + '/public'));
app.listen(port);
//# sourceMappingURL=server.js.map