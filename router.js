var fs = require("fs");

var Router = {
	router: function (request, response) {
		if(request.url === "/") {
			fs.readFile("public/index.html", 'utf8', function(error, data) {
 				response.write(data);
				response.end();
			})
		} else {
			fs.readFile("./public/" + request.url, 'utf8', function(error, data) {
				if (error) {
					response.statusCode = 404;
					response.write("invalid path");
				} else {
					response.write(data);
				}
				response.end();
			})
		}
	}
}

exports.Router = Router
