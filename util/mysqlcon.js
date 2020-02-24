// MySQL Initialization
const mysql=require("mysql");
const config = require('./config.js');
const mysqlCon=mysql.createPool({
	host: config.mysql.host,
	user: config.mysql.user,
	password: config.mysql.password,
	database: config.mysql.database,
	// insecureAuth: true,
	connectionLimit : 10,
  port: 3306
});
module.exports={
	core:mysql,
	con:mysqlCon
};
