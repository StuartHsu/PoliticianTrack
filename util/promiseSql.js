const mysql = require("./mysqlcon.js");


const query = function(sql, bind)
{
  return new Promise((resolve, reject) =>
  {
    mysql.con.query(sql, bind, function(error, results)
    {
      if(error)
      {
        reject("Database Query Error");
      }
      else
      {
        resolve(results);
      }      
    });
  });
}

module.exports = {
	query: query
};
