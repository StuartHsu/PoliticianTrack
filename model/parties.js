const mysql = require("../util/mysqlcon.js");


module.exports = {
  get: function(start, end) {
    return new Promise(async function(resolve, reject) {
      let sql = 'select * from filterCount where type = "NRP" order by count desc;';
      mysql.con.query(sql, function(error, results, fields) {
        if(error) {
          reject(error);
        }
        resolve(results);
      });
    });
  }
}
