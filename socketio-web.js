var sub, pub;
var IOSockets;

module.exports.setup = function(app, store, _sub,_pub){
	var io = require("socket.io");
	var sio = io.listen(app);
	var redis = require("redis");
	var connect = require('express/node_modules/connect');
	var parseCookie = connect.utils.parseCookie;
	var express = require("express");

	var RedisStore = require('socket.io/lib/stores/redis')	
	var RedisStoreExpress = require('connect-redis')(express);

	sub = _sub;
	pub = _pub;
	IOSockets = [];

	sio.set('store', 
		new RedisStore({
		  	redisPub : redis.createClient(),
		    redisSub : redis.createClient(),
		    redisClient : redis.createClient()
		})
	);

	sio.set('authorization', function (data, accept) {
		if (!data.headers.cookie) 
			return accept('No cookie transmitted.', false);
		data.cookie = parseCookie(data.headers.cookie);
		data.sessionID = data.cookie['express.sid'];
		store.load(data.sessionID, function (err, session) {
			if (err || !session){
				return accept('Error', false);				
			} 
			data.session = session;
			return accept(null, true);
		});
	});
	
	sio.set("log level", 1);

	sio.on('connection', function (socket) {
		function handler(sess,socket){
			IOSockets[sess.user] = socket;
			sub.subscribe(sess.user + ":video-frame");
			
			socket.on("movement", function(data){
				console.log(data);
				pub.publish(sess.user + ":movement-command", data);
			});

			socket.on("camera", function(data){
				pub.publish(sess.user + ":camera-command", data);
			});

			socket.on("detection", function(data){

			});

			socket.on("notify", function(data){

			});
		}

		// Multi-core issues
		var sess = socket.handshake.session;
		if ( sess.reload){
			sess.reload(function(){
				handler(sess,socket);
			});				
		} else {				
			handler(sess,socket);
		}
	});
};

module.exports.notify = function(username, direction, message){
	IOSockets[username].emit(direction, message);
}

module.exports.toString = function(){ return "socket-io web"};