module.exports = function(web,sub,pub){
	var io = require("socket.io");
	var sio = io.listen(web.app);
	var redis = require("redis");
	var connect = require('express/node_modules/connect');
	var parseCookie = connect.utils.parseCookie;
	var express = require("express");

	var RedisStore = require('socket.io/lib/stores/redis')	
	var RedisStoreExpress = require('connect-redis')(express);
	var store = web.store;

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
			console.log(sess.user + " connected from browser.");
			
			socket.on("movement", function(data){
				console.log(data);
				pub.publish("movement", data);
			});
			socket.on("camera", function(data){
				console.log(data);
				pub.publish("camera", data);
			});

			socket.on("detection", function(data){
				console.log(data);
			});

			socket.on("notify", function(data){
				console.log(data);
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
}	