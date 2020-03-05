const promiseSql = require("../util/promiseSql.js");

module.exports =
{
  get: function(cond)
  {
    return new Promise(async function(resolve, reject)
    {
      let filter;

      if (cond === "politician")
      {
        filter = ` AND d.type = "NRP"`;
      }
      else if (cond === "issue")
      {
        filter = ` AND d.type = "NI"`;
      }
      else
      {
        filter = "";
      }

      let sql = `
        SELECT a.parent_id AS tag_id, d.name, d.type, count(a.parent_id) AS count
        FROM filtercount AS a
        LEFT JOIN newstag AS b ON (a.id = b.tag_id)
        LEFT JOIN news AS c ON (b.news_id = c.id)
        LEFT JOIN filtercount AS d ON (a.parent_id = d.id)
        WHERE c.intent = "politician_say"
      `;

      try
      {
        let data = await promiseSql.query(sql+filter+` GROUP BY a.parent_id ORDER BY count DESC;`, null);

        resolve(data);
      }
      catch(error)
      {
        reject(error);
      }
    });
  }
}
