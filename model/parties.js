const mysql = require("../util/mysqlcon.js");

module.exports = {
  get: function(party) {
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
  filter: function(party) {
    return new Promise(function(resolve, reject) {
      let sql =
      `SELECT filterCount.name, politician.party
      FROM filterCount LEFT JOIN politician ON (filterCount.name = politician.name)
      WHERE filterCount.type = "NRP"`
      let addSql;
      if(party.length > 0) {
        addSql = ` AND politician.party IN (?) ORDER BY count DESC;`
      } else {
        addSql = ` ORDER BY count DESC;`
      }
      mysql.con.query(sql+addSql, [party],function(error, results, fields) {
        if(error) {
          reject(error);
        }
        resolve(results);
      });
    });
  }
}
