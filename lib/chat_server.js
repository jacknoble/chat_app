var _ = require('underscore')
var socketio = require('socket.io')
var createChat = function(server) {
	var io = socketio.listen(server)
	var guestNumber = 0;
	var nickNames = {};
	var namesUsed = [];
	var currentRooms = { lobby: [] };

	io.sockets.on('connection', function (socket) {
		var joinRoom = function(socket, room) {
			socket.join(room);
			currentRooms[room] = currentRooms[room] || [];
			currentRooms[room].push(socket);

			io.sockets.in(room).emit("message", newName + " joined " + room);
			io.sockets.in(room).emit("room update", {nicknames: usersInRoom(room)})
		};

		var usersInRoom = function (room) {
			var users = [];
			currentRooms[room].forEach(function(socket) {
				users.push(nickNames[socket.id]);
			})
			return users;
		};

		var leaveRoom = function(socket, room) {
			socket.leave(room);
			var index = currentRooms[room].indexOf(socket)
			currentRooms[room].splice(index, 1);
			io.sockets.in(room).emit("room update", {nicknames: usersInRoom(room)});
		};

		var handleRoomChangeRequest = function (data) {
			var oldRoom = data.room;
			var newRoom = data.message.slice(6);
			leaveRoom(this, oldRoom);
			joinRoom(this, newRoom);
			this.emit("update room", newRoom);
		};

		socket.emit('connected', {greeting: "Hello from a socket"})
		guestNumber += 1;

		var newName = "guest" + guestNumber;
		nickNames[socket.id] = newName;
		namesUsed.push(newName);
		joinRoom(socket, "lobby");

		socket.on("message", function(data) {
			if(data.message.match(/^\//)) {
				processCommand.bind(socket)(data);
			} else {
				var outMessage = nickNames[this.id] + ": " + data.message;
				io.sockets.in(data.room).emit("message", outMessage);
			}
		});

		socket.on("disconnect", function() {
			// decrement guestNumber
			var nick = nickNames[this.id]
			// var room = io.sockets.manager.roomClients[this.id]
// 			var index = currentRooms[room].indexOf(this)
// 			currentRooms[room].splice(index, 1)how t
			delete nickNames[this.id]
			var nameI = namesUsed.indexOf(nick)
			namesUsed.splice(nameI, 1);
			io.sockets.emit("message", nick + " has left the building.")
		})

		var processCommand = function(data) {
			if(data.message.match(/^\/nick/)) {
				var name = data.message.slice(6)
				nickNameChangeRequest(name, this, data.room)
			} else if (data.message.match(/^\/join/)) {
				handleRoomChangeRequest.bind(this)(data)
			}
		};

		var nickNameChangeRequest = function (name, socket, room) {
			if(_.contains(namesUsed, name)) {
				io.sockets.in(room).emit('nicknameChangeResult', {
					success: false,
					message: name + ' is already taken'
				});
			} else if(name.match(/^guest/)) {
				io.sockets.in(room).emit('nicknameChangeResult', {
					success: false,
					message: 'Names cannot begin with "Guest".'
				});
			} else {
				var oldName = nickNames[socket.id];
				nickNames[socket.id] = name;
				var nameI = namesUsed.indexOf(oldName)

				namesUsed.splice(nameI, 1)
				namesUsed.push(name);

				io.sockets.in(room).emit('nicknameChangeResult', {
					success: true,
					message: oldName + " is now known as " + name
				})

				io.sockets.in(room).emit("room update", {nicknames: usersInRoom(room)})
			}
		};
	})
}
exports.createChat = createChat;