const mysql = require("../util/mysqlcon.js");


module.exports = {
  get: function() {
    return new Promise(async function(resolve, reject) {
      // let sql = 'select * from filtercount order by count desc;';
      let sql = `
      SELECT a.id AS tag_id, a.name, a.type, count(a.name) AS count
      FROM filtercount AS a
      LEFT JOIN newstag AS b ON (a.id = b.tag_id)
      LEFT JOIN news AS c ON (b.news_id = c.id)
      WHERE c.intent = "politician_say"
      GROUP BY a.id ORDER BY count DESC;
      `;
      mysql.con.query(sql, function(error, results, fields) {
        if(error) {
          reject(error);
        }
        resolve(results);
      });
    });
  }
}
