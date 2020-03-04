const mysql = require("../util/mysqlcon.js");

module.exports = {
  getParties: function(party) {
    return new Promise(function(resolve, reject) {
      let sql = `SELECT party, count(*) FROM politician group by party HAVING count(*)>3 ORDER BY count(*) DESC;`;
      mysql.con.query(sql, function(error, results, fields) {
        if(error) {
          reject(error);
        }
        resolve(results);
      });
    });
  },
  getPoliticians: function(party) {
    return new Promise(function(resolve, reject) {
      let sql = `
        SELECT filtercount.name, politician.party
        FROM filtercount LEFT JOIN politician ON (filtercount.name = politician.name)
        WHERE filtercount.type = "NRP"
      `;
      let filter;
      if(party.length > 0) {
        filter = ` AND politician.party IN (?) ORDER BY count DESC;`
      } else {
        filter = ` ORDER BY count DESC;`
      }
      mysql.con.query(sql+filter, [party], function(error, results, fields) {
        if(error) {
          reject(error);
        }
        resolve(results);
      });
    });
  }
}
