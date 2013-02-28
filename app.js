var cluster = require("cluster");
var os = require("os");
var net = require("net");
var connections = require("./connections");

 if ( cluster.isMaster){	
	for ( var i = 0; i < 1; os.cpus().length; i++){
		var worker = cluster.fork();
	}

	cluster.on("death", function(worker){
  		console.log("worker " + worker.pid + " died");		  		
	});
} else {


	connections.setup(function(app,db,sio,sub,pub){
		var TCPSockets = {};
		var IOSockets = {};

		// HTML Routing
		app.get("/", function(req,res){
			res.render("index", {wrongLogin: req.query.nak != null});
		});

		app.post("/login", function(req,res){
			var user = req.param('user',null);
			var pass = req.param('pass',null);
			db.login(user,pass, function(login){
				if ( login){
					req.session.user = user;
					res.redirect("/panel");
				} else {
					res.redirect("/?nak");
				}
			});
		});

		app.get("/panel", function(req,res){
			if ( req.session.user){
				res.render("panel");
			} else {
				res.redirect("/?nak");
			}
		});

		app.get("/api/v1/login/:user/:pass", function(req,res){
			var user = req.params.user;
			var pass = req.params.pass;
			console.log("API: " + user + " & " + pass);			
			db.login(user,pass, function(login){
				console.log("Login: " + login);
				if ( login){
					// TO-DO: Send My IP
					res.send("192.168.1.100",200);
				} else {
					res.send("NOT OK",401);
				}
			});
		})

		app.get("/logout", function(req,res){
			req.session.destroy();
			res.redirect("/");
		});

		sub.on("subscribe", function(channel, count){
			console.log("Worker " + process.pid + " subscribed to: " + channel + ", " + count + " subscribers in total");
		});

		// Handling Cache
		sub.on("message", function(channel, message){
			var t = channel.split(":");
			var direction = t[0];
			var username = t[1];
			if ( t[0] == "video"){
				IOSockets[username].emit("video", message);
			} else {
				try {
					message = JSON.parse(message);
				} catch ( ex){
					throw ex;
				};
				if ( direction == "robot"){
					var buffer = new Buffer(new Array(5));
					if ( message.value == 'left'){
						buffer[0] = 1;
					} else if ( message.value == 'up'){
						buffer[1] = 2;
					} else if ( message.value == 'down'){
						buffer[2] = 3;
					} else if ( message.value == 'right'){
						buffer[3] = 4;
					} else if ( message.value == 'stop'){
						buffer[4] = 9;
					}
					if ( TCPSockets[username]){
						TCPSockets[username].write(buffer);
					}
				} else if ( direction == "browser"){
					// console.log(message.length);
					if ( IOSockets[username]){
						IOSockets[username].emit("robot",message);
					}
				} else {
					console.log(channel);
					console.log("This message should not have arrived");
				}
			}
		});


		// Handling SocketIO Connections
		sio.on('connection', function (socket) {
			function handler(sess,socket){
				console.log(sess.user + " connected from SocketIO.");
				sub.subscribe("browser:" + sess.user);	
				sub.subscribe("video:" + sess.user);

				IOSockets[sess.user] = socket;
				
				socket.on("setting", function(data){
					console.log(data);
				});

				socket.on("command", function(data){
					console.log(data);
					data = JSON.stringify(data);
					pub.publish("robot:" + sess.user, data);
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
	});	
}
