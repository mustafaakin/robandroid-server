var cluster = require("cluster");
var os = require("os");
var net = require("net");
var redis = require("redis");
var config = require("./config");

if ( cluster.isMaster){	
	for ( var i = 0; i < os.cpus().length; i++){
		var worker = cluster.fork();
	}
	cluster.on("death", function(worker){
  		console.log("worker " + worker.pid + " died");		
// 		var worker = cluster.fork();  		
	});
} else {
	var pub = redis.createClient();
	var sub = redis.createClient();


	var db = require("./db")(config.mysql);

	var web  = require("./web")(config.http, db);
	var sioWeb = require("./socketio-web")(web,sub,pub);	
	// var sioRobot = require("./socketio-robot")(config.robot, db, sub,pub);	
	var videoServer = require("./video-server")(config.videoserver, sub, pub);


	// Handling Message Routing
	// TODO: Alternative: Implement the functions there so this is only a routing mechanism
	var messageHandler = {
		"video-frame": [sioWeb],
//		"movement-command": [sioRobot],
//		"robotic-command": [sioRobot],
		"settings-change": [sioWeb],
		"sensor-data-read": [sioWeb, db]		
	}

	sub.on("message", function(channel, message){
		var t = channel.split(":");
		var username = t[0];
		var direction = t[1];
		console.log(channel);
		
		var directions = messageHandler[direction];
		for ( var i in directions){
			directions[i].notify(username, direction, message);
		}
	});


	sub.on("subscribe", function(channel, count){
		console.log("Worker " + process.pid + " subscribed to: " + channel + ", " + count + " subscribers in total");
	});
}