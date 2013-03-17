var socks = [];

module.exports.setup = function(config, db, sub, pub){
	var net     = require('net');

	var server = net.createServer(function(sock) {
		console.log("New Data TCP client");
		var auth = false;
		var user = null;
		socks["mustafa"] = sock;
		sub.subscribe("mustafa:movement-command");
		sub.subscribe("mustafa:camera-command");
	});

	server.listen(6000);  
};


module.exports.notify = function(username, direction, message){
	var handle = {
		"movement-command": function(message){
			var directions = {
				"up" : 10, "down": 11, "left": 12, "right": 13, "stop": 14
			}
			return [ directions[message], 0];
		},
		"camera-command": function(message){
			var cmds = {
				"play" : 30, "stop": 31
			}
			return [ cmds[message], 0];
		}		
	}
	socks[username].write(new Buffer(handle[direction](message)));
}


module.exports.toString = function(){ return "data server"};