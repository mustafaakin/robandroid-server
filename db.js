var conn;
module.exports.setup = function(config){
	var mysql = require("mysql");
	conn = mysql.createConnection({
		host     : config.addr,
		user     : config.user,
		password : config.pass,
		database : 'robandroid'
	});
};

module.exports.login =  function(user,pass,cb){
	conn.query("SELECT * FROM users WHERE username = ? AND password = MD5(?)", 
		[user,pass],function(err,rows,fields){
			if ( err)
				throw err;
			var result = !err && rows.length > 0
			cb(result);
	});
}

// TODO: Improve for multi inserts
module.exports.addSensorData = function(username,type,value,occured,cb){
	conn.query("INSERT INTO sensors(username,type,value,occured) VALUES (?,?,?,?)", 
	[username,type,value,occured], function(err,rows,fields){
		if ( cb){
			cb();			
		}
	});
}

module.exports.getTemperature = function(username, cb){
	conn.query("SELECT AVG(value) as avgTemp, MIN(value) as minTemp, MAX(value) as maxTemp FROM sensors WHERE username = ? AND type = 1 AND stamp >= DATE_SUB(NOW(), INTERVAL 1 day)", 
		[username], function(err,rows,fields){
			if ( !err && rows.length > 0){
				cb(rows[0]);
			} else {
				var data = {avgTemp: 0,minTemp: 0,maxTemp: 0};
				cb(data);
			}
	});
}

module.exports.setSetting = function(username, type, value){
	// TODO: Fix SQL injection
	conn.query("UPDATE users SET " + type + " = ?  WHERE username = ?",
		[value, username], function(err,rows,fields){
			if ( err){
				throw err;
			} 
	});
}

module.exports.getUserSettings = function(username, cb){
	conn.query("SELECT * FROM users WHERE username = ?", 
		[username],function(err,rows,fields){
			cb(rows[0]);
	});
}