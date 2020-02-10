const mysql = require("../util/mysqlcon.js");

module.exports = {
  getPol: function() {
    return new Promise(function(resolve, reject) {
      let sql =
      `SELECT newsTag.tag_id, filterCount.name,count(newsTag.tag_id) AS count
      FROM newsTag LEFT JOIN filterCount ON (newsTag.tag_id = filterCount.id)
      WHERE filterCount.type = "NRP"
      GROUP BY tag_id ORDER BY count DESC;`
      mysql.con.query(sql, function(error, results, fields) {
        if(error) {
          reject(error);
        }
        resolve(results);
      });
    });
  },
  getIssue: function() {
    return new Promise(function(resolve, reject) {
      let sql =
      `SELECT newsTag.tag_id, filterCount.name,count(newsTag.tag_id) AS count
      FROM newsTag LEFT JOIN filterCount ON (newsTag.tag_id = filterCount.id)
      WHERE filterCount.type = "NI"
      GROUP BY tag_id ORDER BY count DESC;`
      mysql.con.query(sql, function(error, results, fields) {
        if(error) {
          reject(error);
        }
        resolve(results);
      });
    });
  },
  getSubIssue: function(pol_id) {
    return new Promise(function(resolve, reject) {
      let sql =
      `SELECT b.tag_id, c.name, count(b.tag_id) AS count
      FROM newsTag AS a
      LEFT JOIN newsTag AS b ON (a.news_id = b.news_id)
      LEFT JOIN filterCount AS c ON (b.tag_id = c.id)
      WHERE a.tag_id = ? AND c.type = "NI"
      GROUP BY b.tag_id ORDER BY count DESC;`
      mysql.con.query(sql, pol_id,function(error, results, fields) {
        if(error) {
          reject(error);
        }
        resolve(results);
      });
    });
  },
  getSubPol: function(issue_id) {
    return new Promise(function(resolve, reject) {
      let sql =
      `SELECT b.tag_id, c.name, count(b.tag_id) AS count
      FROM newsTag AS a
      LEFT JOIN newsTag AS b ON (a.news_id = b.news_id)
      LEFT JOIN filterCount AS c ON (b.tag_id = c.id)
      WHERE a.tag_id = ? AND c.type = "NRP"
      GROUP BY b.tag_id ORDER BY count DESC;`
      mysql.con.query(sql, issue_id,function(error, results, fields) {
        if(error) {
          reject(error);
        }
        resolve(results);
      });
    });
  }
}
