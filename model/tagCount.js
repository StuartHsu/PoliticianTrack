const promiseSql = require('../util/promiseSql.js');

module.exports = {
  get: async function(cond) {
    let filter;

    if (cond === 'politician') {
      filter = ` AND d.type = 'NRP'`;
    } else if (cond === 'issue') {
      filter = ` AND d.type = 'NI'`;
    } else {
      filter = '';
    }

    const sql = `
      SELECT a.parent_id AS tag_id, d.name, d.type, count(a.parent_id) AS count
      FROM filtercount AS a
      LEFT JOIN newstag AS b ON (a.id = b.tag_id)
      LEFT JOIN news AS c ON (b.news_id = c.id)
      LEFT JOIN filtercount AS d ON (a.parent_id = d.id)
      WHERE c.intent = 'politician_say'
    `;

    try {
      const data = await promiseSql.query(sql+filter+` GROUP BY a.parent_id ORDER BY count DESC;`, null);

      return data;
    } catch (error) {
      return error;
    }
  }
};
