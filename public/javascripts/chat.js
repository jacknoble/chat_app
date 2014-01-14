(function(root) {
	var ChatApp = root.ChatApp = (root.ChatApp) || {};

	var Chat = ChatApp.Chat = function (socket) {
		this.socket = socket;
		this.room = "lobby"
	};

	Chat.prototype.sendMessage = function (message) {
		this.socket.emit("message", {message: message, room: this.room});
	};

	Chat.prototype.listenForMessages = function() {
		this.socket.on("message", function(data) {
			var $newMessage = $("<div>").text(data)

			$("#messages").append($newMessage);
		})
	};

	Chat.prototype.listenForNameChange = function() {
		this.socket.on("nicknameChangeResult", function(data) {
			var $newMessage = $("<div>").text(data.message);
			$("#messages").append($newMessage);

		})
	};

	Chat.prototype.listenForRoomUpdate = function() {
		this.socket.on("room update", function(data) {
			$("#users").empty();
			var users = data.nicknames;
			users.forEach( function(user) {
				if (user) {
					var $user = $("<li>").text(user)
					$("#users").append($user)
				}
			})
		})
	};

	Chat.prototype.listenForNewRoom = function () {
    this.socket.on("new room", function(data) {
      this.room = data;
      $("#room_name").text(this.room);
    })
	};

})(this)