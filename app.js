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
	var sioApp = require("./socketio-app")(sub,pub);	
	
	// Handling Message Routing
	// TODO: Alternative: Implement the functions there so this is only a routing mechanism
	var messageHandler = {
		"video-frame": [sioWeb, db],
		"movement-command": [sioApp],
		"robotic-command": [sioApp],
		"settings-change": [sioWeb],
		"sensor-data-read": [sioWeb, db]		
	}


	var messageHandler = {
		"browser":{
			"video-frame" : function(msg){
				// Show the video frame
			}
		},
		"robot": {
			"command": function(msg){
				// Forward commands to the robot so it can move stop etc
			}
		},
		"db": {
			"sensor": function(msg){
				// Write them to database for later viewing
			}
		},
		"setting": {
			"preference": function(msg){
				// Write them to db so that we notify properly in case of event
			}
		}
	}

	sub.on("message", function(channel, message){
		channel = channel.split(":");
		var destination = channel[0];
		var topic = channel[1];
		messageHandler[destination][topic](message);
	});


	sub.on("subscribe", function(channel, count){
		console.log("Worker " + process.pid + " subscribed to: " + channel + ", " + count + " subscribers in total");
	});
}