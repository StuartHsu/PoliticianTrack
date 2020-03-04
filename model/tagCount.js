const mysql = require("../util/mysqlcon.js");


module.exports = {
  get: function(cond) {
    return new Promise(async function(resolve, reject) {
      let sql;
      let filter;
      if(cond === "pol") {
        filter = ` AND d.type = "NRP"`;
      } else if(cond === "issue") {
        filter = ` AND d.type = "NI"`;
      } else {
        filter = "";
      }
      sql = `
        SELECT a.parent_id AS tag_id, d.name, d.type, count(a.parent_id) AS count
        FROM filtercount AS a
        LEFT JOIN newstag AS b ON (a.id = b.tag_id)
        LEFT JOIN news AS c ON (b.news_id = c.id)
        LEFT JOIN filtercount AS d ON (a.parent_id = d.id)
        WHERE c.intent = "politician_say"
      `;
      mysql.con.query(sql+filter+` GROUP BY a.parent_id ORDER BY count DESC;`, function(error, results, fields) {
        if(error) {
          reject(error);
        }
        resolve(results);
      });
    });
  }
}
