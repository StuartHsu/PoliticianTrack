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
  },
  listTag2: function(title, titleKeyword, content, contentKeyword) {
    let data = [];
    return new Promise(async function(resolve, reject) {
      let newsRaw = await getNews2(title, titleKeyword, content, contentKeyword);
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
          tag_id: newsRaw[i].tag_id,
          tag_name: newsRaw[i].tag_name,
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
  },
  listTag3: function(data) {
    return new Promise(async function(resolve, reject) {
      let id1 = await getTagId(data[0], data[2]);
      let id2 = await getTagId(data[1], data[2]);
      let new1 = await getNewsId(id1, 1);
      let new2 = await getNewsId(id2, 1);
      let newsArray = new1.concat(new2);
      let body = [];
      let sql;
      if(data) {
        sql = `SELECT * FROM news WHERE id IN (?) AND intent = "politician_say" ORDER BY pubTime DESC;`
      } else {
        sql = `SELECT * FROM news WHERE intent = "politician_say" ORDER BY pubTime DESC;`
      }
      // let sql = `SELECT * FROM news WHERE id IN (?) AND intent = "politician_say" ORDER BY pubTime DESC;`
      mysql.con.query(sql, [newsArray], function(error, results, fields) {
        if(error) {
          reject(error);
        }
        for(let i = 0; i < results.length; i++) {
          if(new1.indexOf(results[i].id) > -1 && new2.indexOf(results[i].id) > -1) {
            results[i].tag_id = "both";
          } else if (new1.indexOf(results[i].id) > -1 && new2.indexOf(results[i].id) < 0) {
            results[i].tag_id = data[0];
          } else if (new1.indexOf(results[i].id) < 0 && new2.indexOf(results[i].id) > -1) {
            results[i].tag_id = data[1];
          } else {
            console.log("none");
          }
          body.push(results[i]);
        }
        resolve(body);
      });
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

function getNews2(data) {
  return new Promise(function(resolve, reject) {
    let addSql;
    if(data[2]) {
      addSql = ` AND a.name = '${data[2]}'`;
    }

    let sql =
    `SELECT a.id AS tag_id, a.name AS tag_name, c.* FROM filterCount AS a
    LEFT JOIN newsTag AS b ON (a.id = b.tag_id)
    LEFT JOIN news AS c ON (b.news_id = c.id)
    WHERE a.name in ('${data[0]}', '${data[1]}')${addSql} AND c.intent = "politician_say"
    ORDER BY c.pubTime DESC;`;

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


function getTagId(param1, param2) {
  return new Promise(function(resolve, reject) {
    let sql = `SELECT id FROM filterCount WHERE name IN ('${param1}','${param2}');`;
    let data = [];
    mysql.con.query(sql, function(error, results, fields) {
      if(error) {
        reject(error);
      }
      resolve(results);
    });
  });
}

function getNewsId(param, limit) {
  return new Promise(function(resolve, reject) {
    let sql = `SELECT news_id FROM newsTag WHERE tag_id IN (${param[0].id},${param[1].id}) GROUP BY news_id HAVING count(*) > ${limit};`;
    mysql.con.query(sql,function(error, results, fields) {
      if(error) {
        reject(error);
      }
      let data = [];
      for(let i = 0; i < results.length; i++) {
        data.push(results[i].news_id);
      }
      resolve(data);
    });
  });
}
