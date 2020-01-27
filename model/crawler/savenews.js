const mysql = require("../../util/mysqlcon.js");

module.exports={
  save: function(href, data) {
    return new Promise(function(resolve, reject) {
      mysql.con.query('select * from news where href = ?', href, function(error, result1, fields) {
        if(error) {
          reject(error);
        }
        if(result1.length < 1) {
          // save to db
          mysql.con.query('insert into news set ?', data, function(error, result2, fields) {
            if(error) {
              reject(error);
            } else {
              resolve("Finished saving to database");
            }
          });
        } else {
          resolve("No need to update database");
        }
      });
    });
  }
}
