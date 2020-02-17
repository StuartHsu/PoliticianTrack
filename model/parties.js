const mysql = require("../util/mysqlcon.js");


module.exports = {
  get: function() {
    return new Promise(async function(resolve, reject) {
      let sql = 'SELECT party, count(party) AS count FROM politician GROUP BY party  HAVING count(party) > 3 ORDER BY count DESC;';
      mysql.con.query(sql, function(error, results, fields) {
        if(error) {
          reject(error);
        }
        let data = {};
        let body = [];
        let resultLength = results.length;
        for(let i = 0; i < resultLength; i++) {
          body.push(results[i].party);
        }
        data.party = body;
        resolve(data);
      });
    });
  }
}
