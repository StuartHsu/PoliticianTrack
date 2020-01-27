const mysql = require("../util/mysqlcon.js");

module.exports = {
  get: function(item, keyword) {
    return new Promise(function(resolve, reject) {
      mysql.con.query(`select * from news where ${item} like '%${keyword}%' order by pubTime desc;`,function(error, results, fields) {
        if(error) {
          reject(error);
        }
        resolve(results);
      });
    });
  }
}
