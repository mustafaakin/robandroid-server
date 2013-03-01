 module.exports = function(config,db, sub,pub){
	var io = require("socket.io");
	var sio = io.listen(config.port);
	
	sio.set("log level", 1);
	
	sio.sockets.on('connection', function (socket) {
		var auth = false;

		socket.on("login", function(data){		
			if ( data.username && data.password){
				db.login(data.username, data.password, function(login){
					if ( login){					
						console.log(data.username + " logged in from Android");
						auth = true;
					}
				});
			}
		});

		socket.on("sensor", function(data){
			if ( auth){
				
			}
		})
	});


 }