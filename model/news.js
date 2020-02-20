const mysql = require("../util/mysqlcon.js");

module.exports = {
  getPeriod: function(start, end) { // Admin use
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
  listTag: function(title, titleKeyword, content, contentKeyword) { // politician oncoming render
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
  getAll: function() {
    return new Promise(function(resolve, reject) {
      let sql = `SELECT * FROM news WHERE intent = "politician_say" ORDER BY pubTime DESC;`
      mysql.con.query(sql, async function(error, results, fields) {
        if(error) {
          reject(error);
        }
        // 新聞加上所含標籤
        let data = await formTagNews(results);
        resolve(data);
      });
    });
  },
  getNoIssNews: function(pol) {
    return new Promise(async function(resolve, reject) {

      // 取得人物的 Tag Id
      let polTagId = await getTagId(pol);
      // 取得人物 Tag Id 對應的 news_id
      let newsId = await getNewsId(polTagId);

      let sql = `SELECT * FROM news WHERE id IN (?) AND intent = "politician_say" ORDER BY pubTime DESC;`
      mysql.con.query(sql, [newsId], async function(error, results, fields) {
        if(error) {
          reject(error);
        }
        // 新聞加上所含標籤
        let data = await formTagNews(results);
        resolve(data);
      });
    });
  },
  getNoPolNews: function(issue) {
    return new Promise(async function(resolve, reject) {

      // 取得議題的 Tag Id
      let issueTagId = await getTagId(issue);
      // 取得議題 Tag Id 對應的 news_id
      let newsId = await getNewsId(issueTagId);

      let sql = `SELECT * FROM news WHERE id IN (?) AND intent = "politician_say" ORDER BY pubTime DESC;`
      mysql.con.query(sql, [newsId], async function(error, results, fields) {
        if(error) {
          reject(error);
        }
        // 新聞加上所含標籤
        let data = await formTagNews(results);
        resolve(data);
      });
    });
  },
  getPolIssNews: function(pol, issue) {
    return new Promise(async function(resolve, reject) {

      let tagName = [pol, issue];
      // 取得人物及議題的 Tag Id
      let tagId = await getTagId(tagName);
      // 取得人物及議題 Tag Id 對應的 news_id
      let newsId = await getBothNewsId(tagId, 1);
      let data;

      let sql = `SELECT * FROM news WHERE id IN (?) AND intent = "politician_say" ORDER BY pubTime DESC;`
      if(newsId.length > 0) { // 判斷是否有此人此議題之新聞
        mysql.con.query(sql, [newsId], async function(error, results, fields) {
          if(error) {
            reject(error);
          }
          // 新聞加上所含標籤
          data = await formTagNews(results);
          resolve(data);
        });
      } else {
        resolve(data);
      }
    });
  },
  getCompare: function(pol, issue) {
    return new Promise(async function(resolve, reject) {
      let id1 = await getTagId([pol[0], issue]);
      let id2 = await getTagId([pol[1], issue]);
      let new1 = await getBothNewsId(id1, 1);
      let new2 = await getBothNewsId(id2, 1);
      let newsArray = new1.concat(new2);
      let body = [];
      let sql = `SELECT * FROM news WHERE id IN (?) AND intent = "politician_say" ORDER BY pubTime DESC;`

      if(newsArray.length > 0) { // 判斷是否有此兩人同一議題之新聞
        mysql.con.query(sql, [newsArray], async function(error, results, fields) {
          if(error) {
            reject(error);
          }
          // 新聞加上所含標籤
          let data = await formTagNews(results);

          for(let i = 0; i < data.length; i++) {
            if(new1.indexOf(data[i].id) > -1 && new2.indexOf(data[i].id) > -1) {
              data[i].tag_id = "both";
            } else if (new1.indexOf(data[i].id) > -1 && new2.indexOf(data[i].id) < 0) {
              data[i].tag_id = pol[0];
            } else if (new1.indexOf(data[i].id) < 0 && new2.indexOf(data[i].id) > -1) {
              data[i].tag_id = pol[1];
            } else {
              console.log("none");
            }
            body.push(data[i]);
          }
          resolve(body);
        });
      } else {
        resolve(body);
      }
    });
  },
  getAllLess: function(pol) {
    return new Promise(async function(resolve, reject) {

      // 取得人物對應的 news_id
      let newsId = await formPolIntent(pol);

      let sql = `SELECT * FROM news WHERE id IN (?) ORDER BY pubTime DESC;`
      if(newsId.length > 0) { // 判斷是否有此人此議題之新聞
        mysql.con.query(sql, [newsId], async function(error, results, fields) {
          if(error) {
            reject(error);
          }
          let data = await formTagNews(results);
          resolve(data);
        });
      } else {
        resolve();
      }
    });
  },
  getNoIssNewsLess: function(pol) {
    return new Promise(async function(resolve, reject) {

      // 取得人物對應的 news_id
      let newsId = await formPolIntent(pol);

      let sql = `SELECT * FROM news WHERE id IN (?) ORDER BY pubTime DESC;`
      if(newsId.length > 0) { // 判斷是否有此人此議題之新聞
        mysql.con.query(sql, [newsId], async function(error, results, fields) {
          if(error) {
            reject(error);
          }
          // 新聞加上所含標籤
          let data = await formTagNews(results);
          resolve(data);
        });
      } else {
        resolve();
      }
    });
  },
  getPolIssNewsLess: function(pol, issue) {
    return new Promise(async function(resolve, reject) {

      let tagName = [pol, issue];
      // 取得人物及議題的 Tag Id
      let tagId = await getTagId(tagName);
      // 取得人物及議題 Tag Id 對應的 news_id
      let rawNewsId = await getBothNewsId(tagId, 1);

      // 取得人物對應的 news_id
      let newsId = await formPolIntent2(pol, rawNewsId);

      let sql = `SELECT * FROM news WHERE id IN (?) ORDER BY pubTime DESC;`
      if(newsId.length > 0) { // 判斷是否有此人此議題之新聞
        mysql.con.query(sql, [newsId], async function(error, results, fields) {
          if(error) {
            reject(error);
          }
          data = await formTagNews(results);
          resolve(data);
        });
      } else {
        resolve();
      }
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


function getTagId(tagName) {
  return new Promise(function(resolve, reject) {
    let sql = `SELECT id FROM filterCount WHERE name IN (?);`;
    let data = [];
    mysql.con.query(sql, [tagName], function(error, results, fields) {
      if(error) {
        reject(error);
      }
      let data = [];
      for(let i = 0; i < results.length; i++) {
        data.push(results[i].id);
      }
      resolve(data);
    });
  });
}

function getNewsId(tagId) {
  return new Promise(function(resolve, reject) {
    let sql = `SELECT news_id FROM newsTag WHERE tag_id IN (?);`;
    mysql.con.query(sql, [tagId],function(error, results, fields) {
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

function getBothNewsId(param, limit) {
  return new Promise(function(resolve, reject) {

    let sql = `SELECT news_id FROM newsTag WHERE tag_id IN (?) GROUP BY news_id HAVING count(*) > ?;`;
    // let sql = `SELECT news_id FROM newsTag WHERE tag_id IN (${param[0].id},${param[1].id}) GROUP BY news_id HAVING count(*) > ${limit};`;

    mysql.con.query(sql, [param, limit],function(error, results, fields) {
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

function formTagNews(news) {
  return new Promise(async function(resolve, reject) {
    let data = [];
    let newsData = {};
    for(let i = 0; i < news.length; i++) {
      var tagsRaw = await getTags(news[i].id);
      let tagsData = [];
      for(let j = 0; j < tagsRaw.length; j++) {
        let body = {
          tagName: tagsRaw[j].name,
          tagType: tagsRaw[j].type
        }
        tagsData.push(body);
      }
      newsData = {
        id: news[i].id,
        title: news[i].title,
        description: news[i].description,
        content: news[i].content,
        href: news[i].href,
        pubTime: news[i].pubTime,
        publisher: news[i].publisher,
        tag: tagsData
      }
      data.push(newsData);
    }
    resolve(data);
  });
}

function formPolIntent(pol) {
  return new Promise(async function(resolve, reject) {
    let intent = [
      "表示",
      "認為",
      "說",
      "覺得",
      "痛批",
      "批",
      "嗆",
      "嗆爆",
      "一句話",
      "呼籲",
      "表態",
      "自爆",
      "稱",
      "聲稱",
      "反稱",
      "估",
      "籲",
      "呼籲",
      "轟",
      "砲轟",
      "酸",
      "酸爆",
      "回",
      ":",
      "：",
      "喊話",
      "感慨",
      "重申",
      "下令",
      "令",
      "拍板",
      "駁斥"];

    // 生成比對 model
    let intentModel = [];
    for(let i = 0; i < pol.length; i++) {
      for(let j = 0; j < intent.length; j++) {
        intentModel.push(pol[i]+intent[j])
      }
    }

    let sql = "SELECT * FROM news";
    let data = [];
    mysql.con.query(sql, function(error, results, fields) {
      if(error) {
        console.log(error);
      }
      for(let i = 0; i < results.length; i++) {
        for(let j = 0; j < intentModel.length; j++) {
          if(results[i].title.indexOf(intentModel[j]) != -1) {
            data.push(results[i].id);
            j = intentModel.length;
          }
        }
      }
      resolve(data);
    });
  });
}

function formPolIntent2(pol, rawNewsId) {
  return new Promise(async function(resolve, reject) {
    let intent = [
      "表示",
      "認為",
      "說",
      "覺得",
      "痛批",
      "批",
      "嗆",
      "嗆爆",
      "一句話",
      "呼籲",
      "表態",
      "自爆",
      "稱",
      "聲稱",
      "反稱",
      "估",
      "籲",
      "呼籲",
      "轟",
      "砲轟",
      "酸",
      "酸爆",
      "回",
      ":",
      "：",
      "喊話",
      "感慨",
      "重申",
      "下令",
      "令",
      "拍板",
      "駁斥"];
    let data = [];
    if(rawNewsId.length > 0) {
      // 生成比對 model
      let intentModel = [];
      for(let i = 0; i < pol.length; i++) {
        for(let j = 0; j < intent.length; j++) {
          intentModel.push(pol[i]+intent[j])
        }
      }
      let sql = `SELECT * FROM news WHERE id IN (?) ORDER BY pubTime DESC;`
      mysql.con.query(sql, [rawNewsId], function(error, results, fields) {
        if(error) {
          console.log(error);
        }
        if(results.length > 0) {
          for(let i = 0; i < results.length; i++) {
            for(let j = 0; j < intentModel.length; j++) {
              if(results[i].title.indexOf(intentModel[j]) != -1) {
                data.push(results[i].id);
                j = intentModel.length;
              }
            }
          }
          resolve(data);
        }
      });
    } else {
      resolve(data);
    }
  });
}
