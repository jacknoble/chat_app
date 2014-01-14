$(function() {
	var socket = io.connect();

	var chat = new ChatApp.Chat(socket);

	$("#room_name").text(chat.room);

	var getMessage = function() {
		$("#new_message_form").on("submit", function(event) {
			event.preventDefault();

			var message_text = $(event.currentTarget).find("#message_text").val();
			chat.sendMessage(message_text);
			$(event.currentTarget).find("#message_text").val("");
		});
	};

	getMessage();
	chat.listenForMessages();
	chat.listenForNameChange();
	chat.listenForRoomUpdate();
	chat.listenForNewRoom();
})


