const mysql = require("../../util/mysqlcon.js");

module.exports = {
  get: function(param) {
    return new Promise(async function(resolve, reject) {
      let issueList;
      let politicianId;
      if(param.pol.length === 2 && param.issue.length === 0 || param.pol.length === 2 && param.issue.length === 1) { // compare
        politicianId = await getTagId(param);
        issueList = await getTwoPolIssue(politicianId);
      } else if(param.pol.length === 0 && param.issue.length === 0 || param.pol.length === 0 && param.issue.length === 1) { // All
        issueList = await getAllIssue();
      } else {
        politicianId = await getTagId(param);
        issueList = await getPolIssue(politicianId);
      }
      resolve(issueList);
    });
  }
}

function getAllIssue() {
  return new Promise(function(resolve, reject) {
    let sql = `
      SELECT b.tag_id, d.name, count(b.tag_id) AS count
      FROM newstag AS a
      LEFT JOIN newstag AS b ON (a.news_id = b.news_id)
      LEFT JOIN news AS c ON (a.news_id = c.id)
      LEFT JOIN filtercount AS d ON (b.tag_id = d.id)
      WHERE d.type = "NI" AND c.intent = "politician_say"
      GROUP BY b.tag_id ORDER BY count DESC;
    `;
    mysql.con.query(sql,function(error, results, fields) {
      if(error) {
        reject(error);
      }
      resolve(results);
    });
  });
}

function getPolIssue(politicianId) {
  return new Promise(function(resolve, reject) {
    let sql = `
      SELECT c.parent_name AS name, count(*)
      FROM newstag AS a
      LEFT JOIN newstag AS b ON (a.news_id = b.news_id)
      LEFT JOIN filtercount AS c ON (b.tag_id = c.id)
      LEFT JOIN news AS d ON (a.news_id = d.id)
      WHERE a.tag_id = ? AND b.tag_id != ? AND c.type = "NI" AND d.intent = "politician_say"
      GROUP BY c.parent_name ORDER BY count(*) DESC;
    `;
    mysql.con.query(sql, [politicianId, politicianId], function(error, results, fields) {
      if(error) {
        reject(error);
      }
      resolve(results);
    });
  });
}

function getTwoPolIssue(politicianId) { // 若無選人則取全部
  return new Promise(function(resolve, reject) {
    let sql = `
      SELECT b.tag_id, d.name, count(b.tag_id) AS count
      FROM newstag AS a
      LEFT JOIN newstag AS b ON (a.news_id = b.news_id)
      LEFT JOIN news AS c ON (a.news_id = c.id)
      LEFT JOIN filtercount AS d ON (b.tag_id = d.id)
      WHERE a.tag_id IN (?) AND d.type = "NI" AND c.intent = "politician_say"
      GROUP BY b.tag_id ORDER BY count DESC;
    `
    mysql.con.query(sql, [politicianId], function(error, results, fields) {
      if(error) {
        reject(error);
      }
      resolve(results);
    });
  });
}

// 取得人物 tagId
function getTagId(param) {
  return new Promise(function(resolve, reject) {
    let tagNameArr = [];
    if(param.pol.length > 0) {
      for(let h = 0; h < param.pol.length; h++) {
        tagNameArr.push(param.pol[h]);
      }
    }
    let data = [];
    let sql = `SELECT id FROM filtercount WHERE name IN (?);`;
    if(tagNameArr.length > 0) { // 人 or 題至少有其一
      mysql.con.query(sql, [tagNameArr], function(error, results, fields) {
        if(error) {
          reject(error);
        }
        for(let i = 0; i < results.length; i++) {
          data.push(results[i].id);
        }
        resolve(data);
      });
    } else { // 無人、題
      resolve(data);
    }
  });
}
