var _ = require('underscore')
var socketio = require('socket.io')
var createChat = function(server) {
	var io = socketio.listen(server)
	var guestNumber = 0;
	var nickNames = {};
	var namesUsed = [];

	io.sockets.on('connection', function (socket) {
		socket.emit('connected', {greeting: "Hello from a socket"})
		guestNumber += 1;

		var newName = "guest" + guestNumber;
		nickNames[socket.id] = newName;
		namesUsed.push(newName);

		io.sockets.emit("message", newName + " joined!");

		io.sockets.emit("room update", {nicknames: namesUsed})

		socket.on("message", function(data) {
			if(data.match(/^\//)) {
				processCommand.bind(socket)(data);
			} else {
				var outMessage = nickNames[this.id] + ": " + data;
				io.sockets.emit("message", outMessage);
			}
		});

		socket.on("disconnect", function() {
			var nick = nickNames[this.id]
			delete nickNames[this.id]
			var nameI = namesUsed.indexOf(nick)
			namesUsed.splice(nameI, 1);
			io.sockets.emit("message", nick + " has left the building.")
		})

		var processCommand = function(data) {
			if(data.match(/^\/nick/)) {
				var name = data.slice(6)
				nickNameChangeRequest(name, this)
			}
		};

		var nickNameChangeRequest = function (name, socket) {
			if(_.contains(namesUsed, name)) {
				io.sockets.emit('nicknameChangeResult', {
					success: false,
					message: name + ' is already taken'
				});
			} else if(name.match(/^guest/)) {
				io.sockets.emit('nicknameChangeResult', {
					success: false,
					message: 'Names cannot begin with "Guest".'
				});
			} else {
				var oldName = nickNames[socket.id];
				nickNames[socket.id] = name;
				var nameI = namesUsed.indexOf(oldName)

				namesUsed.splice(nameI, 1)
				namesUsed.push(name);

				io.sockets.emit('nicknameChangeResult', {
					success: true,
					message: oldName + " is now known as " + name
				})

				io.sockets.emit("room update", {nicknames: namesUsed})
			}
		};
	})
}
exports.createChat = createChat;