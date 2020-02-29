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
        SELECT newstag.tag_id, filtercount.name,count(newstag.tag_id) AS count
        FROM newstag LEFT JOIN filtercount ON (newstag.tag_id = filtercount.id)
        WHERE filtercount.type = ?
        GROUP BY tag_id ORDER BY count DESC)
        AS a;
      `;
      mysql.con.query(sql, [tagType], async function(error, results, fields) {
        if(error) {
          reject(error);
        } else {
          let maxPage = Math.floor((results[0].total - 1) / size);
					if(paging < maxPage) {
						body.next_paging = paging + 1;
					}
          sql = `
            SELECT a.parent_id AS tag_id, d.name, d.type, count(a.parent_id) AS count
            FROM filtercount AS a
            LEFT JOIN newstag AS b ON (a.id = b.tag_id)
            LEFT JOIN news AS c ON (b.news_id = c.id)
            LEFT JOIN filtercount AS d ON (a.parent_id = d.id)
            WHERE c.intent = "politician_say" AND d.type = ?
            GROUP BY a.parent_id ORDER BY count DESC LIMIT ?,?;
          `;
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
  getSub: function(type, tagId) {
    return new Promise(function(resolve, reject) {
      if (type === "pol") {
        tagType = "NI";
      } else {
        tagType = "NRP";
      }
      let sql = `
        SELECT a.parent_id AS tag_id, d.name, d.type, count(a.parent_id) AS count
        FROM filtercount AS a
        LEFT JOIN newstag AS b ON (a.id = b.tag_id)
        LEFT JOIN news AS c ON (b.news_id = c.id)
        LEFT JOIN filtercount AS d ON (a.parent_id = d.id)
        LEFT JOIN newstag AS e ON (b.news_id = e.news_id)
        WHERE e.tag_id = ? AND d.type = ? AND c.intent = "politician_say"
        GROUP BY a.parent_id ORDER BY count DESC;
      `;
      mysql.con.query(sql, [tagId, tagType], function(error, results, fields) {
        if(error) {
          reject(error);
        }
        resolve(results);
      });
    });
  }
}
