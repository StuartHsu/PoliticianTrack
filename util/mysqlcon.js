const mysql = require('mysql');
const config = require('./config.js');

// console.log(process.env.ENVIRONMENT);

// const mysqlCon = mysql.createPool({
// host: config.mysql.host,
// user: config.mysql.user,
// password: config.mysql.password,
// database: config.mysql.database,
// // insecureAuth: true,
// connectionLimit : 10,
// port: 3306
// });

let mysqlCon;

if (process.env.ENVIRONMENT === 'test') {
  mysqlCon = mysql.createPool({
    host: config.mysql.host_TEST,
    user: config.mysql.user_TEST,
    password: config.mysql.password_TEST,
    database: config.mysql.database_TEST,
    connectionLimit: 10,
    port: 3306
  });
} else {
  mysqlCon = mysql.createPool({
    host: config.mysql.host,
    user: config.mysql.user,
    password: config.mysql.password,
    database: config.mysql.database,
    connectionLimit: 10,
    port: 3306
  });
}

module.exports = {
  core: mysql,
  con: mysqlCon
};
