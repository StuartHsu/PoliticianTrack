const mysql = require("../util/mysqlcon.js");

module.exports = {
  get: function(title, titleKeyword, content, contentKeyword) {
    return new Promise(function(resolve, reject) {
      let sql;
      if(titleKeyword && contentKeyword) {
        sql = `select * from news where ${title} like '%${titleKeyword}%' and ${content} like '%${contentKeyword}%' order by pubTime desc;`
      } else if (titleKeyword && !contentKeyword) {
        sql = `select * from news where ${title} like '%${titleKeyword}%' order by pubTime desc;`
      } else if (!titleKeyword && contentKeyword) {
        sql = `select * from news where ${content} like '%${contentKeyword}%' order by pubTime desc;`
      } else {
        sql = `select * from news order by pubTime desc;`
      }
      mysql.con.query(sql, function(error, results, fields) {
        if(error) {
          reject(error);
        }
        resolve(results);
      });
    });
  }
}
