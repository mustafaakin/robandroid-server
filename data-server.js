var socks = [];

module.exports.setup = function(config, db, sub, pub){
	var net     = require('net');

	var server = net.createServer(function(sock) {
		console.log("New Data TCP client");
		var auth = false;
		var user = null;
		socks["mustafa"] = sock;
		sub.subscribe("mustafa:movement-command");
	});

	server.listen(6000);  
};

module.exports.notify = function(username, direction, message){
	var handle = {
		"movement-command": function(message){
			var directions = {
				"up" : 101, "down": 102, "left": 103, "right": 104, "stop": 105
			}
			return [ directions[message], 0];
		}
	}
	socks[username].write(new Buffer(handle[direction](message)));
}


module.exports.toString = function(){ return "data server"};