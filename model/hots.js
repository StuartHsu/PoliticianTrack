const promiseSql = require("../util/promiseSql.js");

module.exports =
{
  get: function(type, size, paging)
  {
    return new Promise(async function(resolve, reject)
    {
      let body = {};
      let hotPol;
      let tagType;
      let offset = paging * size;

      if (type === "pol")
      {
        tagType = "NRP";
      }
      else
      {
        tagType = "NI";
      }

      let sql = `
        SELECT count(*) AS total
        FROM (
          SELECT newstag.tag_id, filtercount.name,count(newstag.tag_id) AS count
          FROM newstag
          LEFT JOIN filtercount ON (newstag.tag_id = filtercount.id)
          WHERE filtercount.type = ?
          GROUP BY tag_id ORDER BY count DESC
        ) AS a;
      `;
      let queryHotsListSql = `
        SELECT a.parent_id AS tag_id, d.name, d.type, count(a.parent_id) AS count
        FROM filtercount AS a
        LEFT JOIN newstag AS b ON (a.id = b.tag_id)
        LEFT JOIN news AS c ON (b.news_id = c.id)
        LEFT JOIN filtercount AS d ON (a.parent_id = d.id)
        WHERE c.intent = "politician_say" AND d.type = ?
        GROUP BY a.parent_id ORDER BY count DESC LIMIT ?,?;
      `;

      try
      {
        let hotCounts = await promiseSql.query(sql, tagType);
        let maxPage = Math.floor((hotCounts[0].total - 1) / size);

        if (paging < maxPage)
        {
          body.next_paging = paging + 1;
        }

        let data = await promiseSql.query(queryHotsListSql, [tagType, offset, size]);
        body.list = data;

        resolve(body);
      }
      catch(error)
      {
        reject(error);
      }
    });
  },
  getSub: function(type, tagId)
  {
    return new Promise(async function(resolve, reject)
    {
      if (type === "pol")
      {
        tagType = "NI";
      }
      else
      {
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

      try
      {
        let data = await promiseSql.query(sql, [tagId, tagType]);

        resolve(data);
      }
      catch(error)
      {
        reject(error);
      }
    });
  }
}
