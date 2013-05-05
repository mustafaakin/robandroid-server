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
	});
} else {
	var pub = redis.createClient();
	var sub = redis.createClient();

	var db = require("./db");
	var web  = require("./web");
	var sioWeb = require("./socketio-web");
	var videoServer = require("./video-server");
	var dataServer = require("./data-server");

	// Needs to be done in this order
	db.setup(config.mysql);
	web.setup(config.http, db);
	sioWeb.setup(web.getApp(), web.getStore(), db, sub,pub);	
	videoServer.setup(config.videoserver,db, sub, pub);
	dataServer.setup(config.dataserver,db, sub, pub);

	// Handling Message Routing
	var messageHandler = {
		"video-frame": [sioWeb],
		"movement-command": [dataServer],
		"camera-command": [dataServer],
		"sensor-data-read": [sioWeb, db],
		"webcam": [videoServer]	
	};

	sub.on("message", function(channel, message){
		var t = channel.split(":");
		var username = t[0];
		var direction = t[1];
		var directions = messageHandler[direction];
		for ( var i in directions){
			directions[i].notify(username, direction, message);
		}
	});


	sub.on("subscribe", function(channel, count){
		console.log("Worker " + process.pid + " subscribed to: " + channel + ", " + count + " subscribers in total");
	});
}