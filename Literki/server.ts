import http = require('http');
var connect = require('connect');
var serveStatic = require('serve-static');
var port = process.env.port || 1337;

connect().use(serveStatic(__dirname)).listen(port);

//http.createServer(function (req, res) {
//    res.writeHead(200, { 'Content-Type': 'text/plain' });
//    res.end('Hello World\n');
//}).listen(port);