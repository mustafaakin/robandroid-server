module.exports.setup = function(config, db, sub, pub){
	var net     = require('net');
	var carrier = require('carrier');

	var server = net.createServer(function(sock) {
		console.log("New Video TCP client");
		var chunks = [];
		sock.on("data", function(data){
			chunks.push(data);
			if ( data[data.length - 1] == 0){
				var a = Buffer.concat(chunks);
				pub.publish("mustafa:video-frame", a.slice(0,a.length - 1).toString());
				chunks = [];
			}
		});
	});
	server.listen(5000);  
}

module.exports.toString = function(){ return "video server"};