var socks = [];
var carrier = require('carrier');

module.exports.setup = function(config, db, sub, pub){
	var net     = require('net');

	var server = net.createServer(function(sock) {
		var my_carrier = carrier.carry(sock);
			my_carrier.on('line',  function(line) {
			console.log('got one line: ' + line);
		});		
		
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
	console.log(username + "-" + direction + "-" + message);

	var handle = {
		"movement-command" : {
			"up" : "FORWARD",
			"down" : "REVERSE",
			"left" : "LEFT",
			"right" : "RIGHT",
			"stop" : "STOP" 
		},
		"camera-command" : {
			"play" : "CAMERA_START",
			"stop" : "CAMERA_STOP",
			"up"   : "SERVO_UP",
			"down"   : "SERVO_DOWN",				 
		}
	}
	var msg = handle[direction][message];
	console.log("Writing message to TCP socket: " + msg);
	socks[username].write(msg + "\r\n");	
	// socks[username].write(new Buffer(handle[direction](message)));
}


module.exports.toString = function(){ return "data server"};
