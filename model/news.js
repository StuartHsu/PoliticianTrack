const mysql = require("../util/mysqlcon.js");

module.exports = {
  get: function(title, titleKeyword, content, contentKeyword) {
    return new Promise(function(resolve, reject) {
      let sql;
      if(titleKeyword && contentKeyword) {
        sql = `select * from news where ${title} like '%${titleKeyword}%' and ${content} like '%${contentKeyword}%' and intent = "politician_say" order by pubTime desc;`
      } else if (titleKeyword && !contentKeyword) {
        sql = `select * from news where ${title} like '%${titleKeyword}%' and intent = "politician_say" order by pubTime desc;`
      } else if (!titleKeyword && contentKeyword) {
        sql = `select * from news where ${content} like '%${contentKeyword}%' and intent = "politician_say" order by pubTime desc;`
      } else {
        sql = `select * from news where intent = "politician_say" order by pubTime desc;`
      }
      mysql.con.query(sql, function(error, results, fields) {
        if(error) {
          reject(error);
        }
        resolve(results);
      });
    });
  },
  getRaw: function() {
    return new Promise(function(resolve, reject) {
      let sql = `select * from news;`
      mysql.con.query(sql, function(error, results, fields) {
        if(error) {
          reject(error);
        }
        resolve(results);
      });
    });
  },
  getPeriod: function(start, end) {
    return new Promise(function(resolve, reject) {
      let sql;
      if(!start && !end) {
        sql = `SELECT * FROM news WHERE intent = "";`
      } else {
        sql = 'SELECT * FROM news WHERE pubTime > ? AND pubTime < ?';
      }
      mysql.con.query(sql, [start, end], function(error, results, fields) {
        if(error) {
          reject(error);
        }
        resolve(results);
      });
    });
  }
}
