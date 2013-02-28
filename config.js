var config = {};

config.http = {};
config.mysql = {};
config.redis = {};
config.robot = {};

config.http.port = 3000

config.redis.addr = "localhost";
config.redis.port = 6379;

config.mysql.addr = "localhost";
config.mysql.user = "robby";
config.mysql.pass = "1234";
config.mysql.port = 3306; 

config.robot.port = 9000;

module.exports = config;