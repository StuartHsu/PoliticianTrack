const mysql = require("../util/mysqlcon.js");

module.exports = {
  get: function() {
    return new Promise(function(resolve, reject) {
      let sql = 'select * from filterCount where type = "NI" order by count desc;';
      mysql.con.query(sql, function(error, results, fields) {
        if(error) {
          reject(error);
        }
        resolve(results);
      });
    });
  },
  getPolId: function(pol) {
    return new Promise(function(resolve, reject) {
      let sql = 'SELECT id FROM filterCount WHERE NAME = ?';
      mysql.con.query(sql, pol, function(error, results, fields) {
        if(error) {
          reject(error);
        }
        resolve(results[0].id);
      });
    });
  },
  getPolIssue: function(pol_id) { // 取得該人物相關議題
    return new Promise(function(resolve, reject) {
      let sql =
      `SELECT b.tag_id, d.name, count(b.tag_id) AS count
      FROM newsTag AS a
      LEFT JOIN newsTag AS b ON (a.news_id = b.news_id)
      LEFT JOIN news AS c ON (a.news_id = c.id)
      LEFT JOIN filterCount AS d ON (b.tag_id = d.id)
      WHERE a.tag_id = ? AND d.type = "NI" AND c.intent = "politician_say"
      GROUP BY b.tag_id ORDER BY count DESC;`
      mysql.con.query(sql, pol_id,function(error, results, fields) {
        if(error) {
          reject(error);
        }
        resolve(results);
      });
    });
  },
  getAllIssue: function() { // 若無選人則取全部
    return new Promise(function(resolve, reject) {
      let sql =
      `SELECT b.tag_id, d.name, count(b.tag_id) AS count
      FROM newsTag AS a
      LEFT JOIN newsTag AS b ON (a.news_id = b.news_id)
      LEFT JOIN news AS c ON (a.news_id = c.id)
      LEFT JOIN filterCount AS d ON (b.tag_id = d.id)
      WHERE d.type = "NI" AND c.intent = "politician_say"
      GROUP BY b.tag_id ORDER BY count DESC;`
      mysql.con.query(sql,function(error, results, fields) {
        if(error) {
          reject(error);
        }
        resolve(results);
      });
    });
  }
}
