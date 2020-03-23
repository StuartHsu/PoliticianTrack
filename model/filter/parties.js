const promiseSql = require('../../util/promiseSql.js');

module.exports = {
  getParties: async function(party) {
    const sql = `
      SELECT party, count(*)
      FROM politician
      GROUP BY party HAVING count(*) > 3 ORDER BY count(*) DESC;
    `;

    try {
      const data = await promiseSql.query(sql, null);

      return data;
    } catch (error) {
      return error;
    }
  },
  getPoliticians: async function(party) {
    const sql = `
      SELECT filtercount.name, politician.party
      FROM filtercount
      LEFT JOIN politician ON (filtercount.name = politician.name)
      WHERE filtercount.type = "NRP"
    `;
    let filter;

    if (party.length > 0) {
      filter = ` AND politician.party IN (?) ORDER BY count DESC;`;
    } else {
      filter = ` ORDER BY count DESC;`;
    }

    try {
      const data = await promiseSql.query(sql + filter, party);

      return data;
    } catch (error) {
      return error;
    }
  }
};
