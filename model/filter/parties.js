const promiseSql = require("../../util/promiseSql.js");

module.exports =
{
  getParties: function(party)
  {
    return new Promise(async function(resolve, reject)
    {
      let sql = `
        SELECT party, count(*)
        FROM politician
        GROUP BY party HAVING count(*) > 3 ORDER BY count(*) DESC;
      `;

      try
      {
        let data = await promiseSql.query(sql, null);

        resolve(data);
      }
      catch(error)
      {
        reject(error);
      }
    });
  },
  getPoliticians: function(party)
  {
    return new Promise(async function(resolve, reject)
    {
      let sql = `
        SELECT filtercount.name, politician.party
        FROM filtercount
        LEFT JOIN politician ON (filtercount.name = politician.name)
        WHERE filtercount.type = "NRP"
      `;
      let filter;

      if (party.length > 0)
      {
        filter = ` AND politician.party IN (?) ORDER BY count DESC;`
      }
      else
      {
        filter = ` ORDER BY count DESC;`
      }

      try
      {
        let data = await promiseSql.query(sql + filter, party);

        resolve(data);
      }
      catch(error)
      {
        reject(error);
      }
    });
  }
}
