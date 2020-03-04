const mysql = require("../../util/mysqlcon.js");

module.exports = {
  get: function(param) {
    return new Promise(async function(resolve, reject) {
      let issueList;
      let politicianId;
      if(param.pol.length === 2 && param.issue.length === 0 || param.pol.length === 2 && param.issue.length === 1) { // compare
        politicianId = await getTagId(param);
        issueList = await getIssues("twoPoliticians", politicianId);
      } else if(param.pol.length === 0 && param.issue.length === 0 || param.pol.length === 0 && param.issue.length === 1) { // All
        issueList = await getIssues();
      } else {
        politicianId = await getTagId(param);
        issueList = await getIssues("onePolitician", politicianId);
      }
      resolve(issueList);
    });
  }
}

function getIssues(mode, politicianId) {
  return new Promise(function(resolve, reject) {
    let param;
    let sql = `
      SELECT d.parent_name AS name, count(*) AS count
      FROM newstag AS a
      LEFT JOIN newstag AS b ON (a.news_id = b.news_id)
      LEFT JOIN news AS c ON (a.news_id = c.id)
      LEFT JOIN filtercount AS d ON (b.tag_id = d.id)
      WHERE c.intent = "politician_say" AND d.type = "NI"
    `;
    let filter;

    if(mode === "onePolitician") {
      filter = ` AND a.tag_id = ? AND b.tag_id != ?`;
      param = [politicianId, politicianId];
    } else if(mode === "twoPoliticians") {
      filter = ` AND a.tag_id IN (?)`;
      param = [politicianId];
    } else { // all
      filter = "";
      param = [];
    }

    mysql.con.query(sql+filter+` GROUP BY d.parent_name ORDER BY count(*) DESC;`, param, function(error, results, fields) {
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
