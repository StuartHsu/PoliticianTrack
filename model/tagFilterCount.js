const mysql = require("../util/mysqlcon.js");


module.exports = {
  get: function() {
    return new Promise(async function(resolve, reject) {
      let sql = 'select * from filtercount order by count desc;';
      mysql.con.query(sql, function(error, results, fields) {
        if(error) {
          reject(error);
        }
        resolve(results);
      });
    });
  }
}
