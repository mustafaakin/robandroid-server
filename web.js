var _app, _store;

module.exports.setup = function(config,db){
	var express = require('express');
	var connect = require('express/node_modules/connect');
	var parseCookie = connect.utils.parseCookie;
	var RedisStoreExpress = require('connect-redis')(express);
	var store = new RedisStoreExpress;


	var app = express.createServer();

	// Prepare express
	app.configure(function () {
	  app.set('view engine', 'jade');
	  app.set('view options', {layout: false});
	  app.use(express.bodyParser());
      app.use(express.cookieParser()); 
	  app.use(express.methodOverride());
	  app.use(express.static(__dirname + '/public'));
	  app.use(express.cookieParser());
	  app.use(express.session({
	      secret: 'secret'
	    , key: 'express.sid'
	    , store: store
	  }));
	});

	_app = app;
	_store = store;

	app.listen(config.port);

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

	app.get("/robotlogin/:user/:pass", function(req,res){
		var user = req.params.user;
		var pass = req.params.pass;
		console.log("API: " + user + " & " + pass);			
		db.login(user,pass, function(login){
			console.log("Login: " + login);
			if ( login){
				res.send("OK",200);
			} else {
				res.send("NOT OK",401);
			}
		});
	})

	app.get("/logout", function(req,res){
		req.session.destroy();
		res.redirect("/");
	});

	module.exports.app = app;
	module.exports.store
}

module.exports.getApp = function(){ return _app};
module.exports.getStore = function(){ return _store};
