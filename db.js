var conn;
module.exports = function(config){
	var mysql = require("mysql");
	conn = mysql.createConnection({
		host     : config.addr,
		user     : config.user,
		password : config.pass,
		database : 'robandroid'
	});
	this.login =  function(user,pass,cb){
		conn.query("SELECT * FROM users WHERE username = ? AND password = MD5(?)", 
			[user,pass],function(err,rows,fields){
				if ( err)
					throw err;
				var result = !err && rows.length > 0
				cb(result);
		});
	}
	// TODO: Improve for multi inserts
	this.addSensorData = function(username,type,value,occured,cb){
		conn.query("INSERT INTO sensors(username,type,value,occured) VALUES (?,?,?,?)", 
		[username,type,value,occured], function(err,rows,fields){
			if ( cb){
				cb();			
			}
		});
	}

	return this;
}