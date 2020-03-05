const mysql = require("./mysqlcon.js");


module.exports =
{
	query: function(sql, bind)
  {
    return new Promise(function(resolve, reject)
    {
      mysql.con.query(sql, bind, function(error, results)
      {
        if (error)
        {
          reject("Database Query Error");
        }
        else
        {
          resolve(results);
        }
      });
    });
  },
  commit: function(connection)
  {
    return new Promise(function(resolve, reject)
    {
      connection.commit(function(error)
      {
        if (error)
        {
          return mysql.con.rollback(function()
          {
            connection.release();
            reject("Database Commit Error: " + error);
          });
        }
        connection.release();
        resolve("ok");
      });
    });
  }
};
