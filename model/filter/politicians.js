const promiseSql = require("../../util/promiseSql.js");

module.exports =
{
  get: async function()
  {
    const sql = `
      SELECT b.parent_name AS name, count(*) AS count
      FROM newstag AS a
      LEFT JOIN filtercount AS b ON (a.tag_id = b.parent_id)
      LEFT JOIN news AS c ON (a.news_id = c.id)
      WHERE a.news_id IN (
        SELECT a.news_id
        FROM newstag AS a
        LEFT JOIN filtercount AS b ON (a.tag_id = b.parent_id)
        WHERE b.type = "NI"
      )
      AND b.type ="NRP" AND c.intent = "politician_say"
      GROUP BY b.parent_name ORDER BY count(*) DESC;
    `;

    try
    {
      const data = await promiseSql.query(sql, null);

      return data;
    }
    catch(error)
    {
      return error;
    }
  }
}
