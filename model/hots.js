const mysql = require("../util/mysqlcon.js");

module.exports = {
  get: function(type, size, paging) {
    return new Promise(function(resolve, reject) {
      let body = {};
      let hotPol;
      let tagType;
      let offset = paging * size;
      if (type === "pol") {
        tagType = "NRP";
      } else {
        tagType = "NI";
      }
      let sql = `
      SELECT count(*) AS total from (
        SELECT newsTag.tag_id, filterCount.name,count(newsTag.tag_id) AS count
        FROM newsTag LEFT JOIN filterCount ON (newsTag.tag_id = filterCount.id)
        WHERE filterCount.type = ?
        GROUP BY tag_id ORDER BY count DESC)
      AS a;`;
      mysql.con.query(sql, [tagType], async function(error, results, fields) {
        if(error) {
          reject(error);
        } else {
          let maxPage = Math.floor((results[0].total - 1) / size);
					if(paging < maxPage) {
						body.next_paging = paging + 1;
					}
          sql =
          `SELECT newsTag.tag_id, filterCount.name,count(newsTag.tag_id) AS count
          FROM newsTag LEFT JOIN filterCount ON (newsTag.tag_id = filterCount.id)
          WHERE filterCount.type = ?
          GROUP BY tag_id ORDER BY count DESC LIMIT ?,?;`;
          mysql.con.query(sql, [tagType, offset, size], async function(error, results, fields) {
            if(error) {
              reject(error);
            } else {
              body.list = results;
              resolve(body);
            }
          });
        }
      });
    });
  },
  // getIssue: function() {
  //   return new Promise(function(resolve, reject) {
  //     let sql =
  //     `SELECT newsTag.tag_id, filterCount.name,count(newsTag.tag_id) AS count
  //     FROM newsTag LEFT JOIN filterCount ON (newsTag.tag_id = filterCount.id)
  //     WHERE filterCount.type = "NI"
  //     GROUP BY tag_id ORDER BY count DESC;`
  //     mysql.con.query(sql, function(error, results, fields) {
  //       if(error) {
  //         reject(error);
  //       }
  //       resolve(results);
  //     });
  //   });
  // },
  // getSubIssue: function(pol_id) {
  //   return new Promise(function(resolve, reject) {
  //     let sql =
  //     `SELECT b.tag_id, d.name, count(b.tag_id) AS count
  //     FROM newsTag AS a
  //     LEFT JOIN newsTag AS b ON (a.news_id = b.news_id)
  //     LEFT JOIN news AS c ON (a.news_id = c.id)
  //     LEFT JOIN filterCount AS d ON (b.tag_id = d.id)
  //     WHERE a.tag_id = ? AND d.type = "NI" AND c.intent = "politician_say"
  //     GROUP BY b.tag_id ORDER BY count DESC;`
  //     mysql.con.query(sql, pol_id,function(error, results, fields) {
  //       if(error) {
  //         reject(error);
  //       }
  //       resolve(results);
  //     });
  //   });
  // },
  // getSubPol: function(issue_id) {
  //   return new Promise(function(resolve, reject) {
  //     let sql =
  //     `SELECT b.tag_id, d.name, count(b.tag_id) AS count
  //     FROM newsTag AS a
  //     LEFT JOIN newsTag AS b ON (a.news_id = b.news_id)
  //     LEFT JOIN news AS c ON (a.news_id = c.id)
  //     LEFT JOIN filterCount AS d ON (b.tag_id = d.id)
  //     WHERE a.tag_id = ? AND d.type = "NRP" AND c.intent = "politician_say"
  //     GROUP BY b.tag_id ORDER BY count DESC;`
  //     mysql.con.query(sql, issue_id,function(error, results, fields) {
  //       if(error) {
  //         reject(error);
  //       }
  //       resolve(results);
  //     });
  //   });
  // },
  getSub: function(type, tagId) {
    return new Promise(function(resolve, reject) {
      if (type === "pol") {
        tagType = "NI";
      } else {
        tagType = "NRP";
      }
      let sql =
      `SELECT b.tag_id, d.name, count(b.tag_id) AS count
      FROM newsTag AS a
      LEFT JOIN newsTag AS b ON (a.news_id = b.news_id)
      LEFT JOIN news AS c ON (a.news_id = c.id)
      LEFT JOIN filterCount AS d ON (b.tag_id = d.id)
      WHERE a.tag_id = ? AND d.type = ? AND c.intent = "politician_say"
      GROUP BY b.tag_id ORDER BY count DESC;`
      mysql.con.query(sql, [tagId, tagType], function(error, results, fields) {
        if(error) {
          reject(error);
        }
        resolve(results);
      });
    });
  }
}
