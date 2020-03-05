const promiseSql = require("../../util/promiseSql.js");

module.exports =
{
  get: function(param)
  {
    return new Promise(async function(resolve, reject)
    {
      let issueList;
      let politicianIds;

      if (param.politician.length === 2 && param.issue.length === 0 || param.politician.length === 2 && param.issue.length === 1) // compare
      {
        politicianIds = await getTagId(param);
        issueList = await getIssues("twoPoliticians", politicianIds);
      }
      else if (param.politician.length === 0 && param.issue.length === 0 || param.politician.length === 0 && param.issue.length === 1) // All
      {
        issueList = await getIssues();
      }
      else
      {
        politicianIds = await getTagId(param);
        issueList = await getIssues("onePolitician", politicianIds);
      }

      resolve(issueList);
    });
  }
}

function getIssues(mode, politicianIds)
{
  return new Promise(async function(resolve, reject)
  {
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

    if (mode === "onePolitician")
    {
      filter = ` AND a.tag_id = ? AND b.tag_id != ?`;
      param = [politicianIds, politicianIds];
    }
    else if (mode === "twoPoliticians")
    {
      filter = ` AND a.tag_id IN (?)`;
      param = [politicianIds];
    }
    else
    {
      filter = "";
      param = [];
    }

    try
    {
      let data = await promiseSql.query(sql + filter + ` GROUP BY d.parent_name ORDER BY count(*) DESC;`, param);

      resolve(data);
    }
    catch(error)
    {
      reject(error);
    }
  });
}

// 取得人物 tagId
function getTagId(param)
{
  return new Promise(async function(resolve, reject)
  {
    let tagNameArr = [];

    if (param.politician.length > 0)
    {
      for (let h = 0; h < param.politician.length; h++)
      {
        tagNameArr.push(param.politician[h]);
      }
    }

    let data = [];
    let sql = `SELECT id FROM filtercount WHERE name IN (?);`;

    if (tagNameArr.length > 0) // 人 or 題至少有其一
    {
      try
      {
        let results = await promiseSql.query(sql, tagNameArr);

        for (let i = 0; i < results.length; i++)
        {
          data.push(results[i].id);
        }

        resolve(data);
      }
      catch(error)
      {
        reject(error);
      }
    }
    else // 無人、題
    {
      resolve(data);
    }
  });
}
