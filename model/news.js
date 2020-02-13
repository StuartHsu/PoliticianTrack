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
  },
  listTag: function(title, titleKeyword, content, contentKeyword) {
    let data = [];
    return new Promise(async function(resolve, reject) {
      let newsRaw = await getNews(title, titleKeyword, content, contentKeyword);
      let newsData = {};
      for(let i = 0; i < newsRaw.length; i++) {
        var tagsRaw = await getTags(newsRaw[i].id);
        let tagsData = [];
        for(let j = 0; j < tagsRaw.length; j++) {
          let body = {
            tagName: tagsRaw[j].name,
            tagType: tagsRaw[j].type
          }
          tagsData.push(body);
        }
        newsData = {
          id: newsRaw[i].id,
          title: newsRaw[i].title,
          description: newsRaw[i].description,
          content: newsRaw[i].content,
          href: newsRaw[i].href,
          pubTime: newsRaw[i].pubTime,
          publisher: newsRaw[i].publisher,
          tag: tagsData
        }
        data.push(newsData);
      }
      resolve(data);
    });
  }
}

function getNews(title, titleKeyword, content, contentKeyword) {
  return new Promise(function(resolve, reject) {
    let arrayWord = titleKeyword.split(",");
    let addSql = ")";
    if(arrayWord[1]) {
      addSql = `or ${title} like '%${arrayWord[1]}%') ` ;
    }

    let sql;
    if(titleKeyword && contentKeyword) {
      sql = `select * from news where (${title} like '%${arrayWord[0]}%' ${addSql}and ${content} like '%${contentKeyword}%' and intent = "politician_say" order by pubTime desc;`
    } else if (titleKeyword && !contentKeyword) {
      sql = `select * from news where (${title} like '%${arrayWord[0]}%' ${addSql}and intent = "politician_say" order by pubTime desc;`
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
}

function getTags(news_id) {
  return new Promise(function(resolve, reject) {
    let sql = `SELECT a.news_id, a.tag_id, b.name, b.type FROM newsTag as a LEFT JOIN filterCount as b ON a.tag_id = b.id WHERE a.news_id = ${news_id};`;
    mysql.con.query(sql, function(error, results, fields) {
      if(error) {
        reject(error);
      }
      resolve(results);
    });
  });
}
