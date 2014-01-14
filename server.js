var http = require("http");
// var fs = require("fs");
var path = require("path");
var mime = require("mime");
var createChat = require('./lib/chat_server.js').createChat
var Router = require("./router.js").Router

var server = http.createServer(function (request, response) {
  Router.router(request, response)
}).listen(8080);

createChat(server);

console.log('Server running at http://127.0.0.1:8080/');