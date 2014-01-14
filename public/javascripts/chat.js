(function(root) {
	var ChatApp = root.ChatApp = (root.ChatApp) || {};

	var Chat = ChatApp.Chat = function (socket) {
		this.socket = socket;
	};

	Chat.prototype.sendMessage = function (message) {
		this.socket.emit("message", message);
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
			console.log(data.nicknames)
			users.forEach( function(user) {
				var $user = $("<li>").text(user)
				$("#users").append($user)
			})
		})
	};

})(this)