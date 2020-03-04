const mysql = require("../util/mysqlcon.js");

module.exports = {
  get: function(param, size, paging) {
    return new Promise(async function(resolve, reject) {
      let sql;
      let tagId;
      let tagsNewsIds;
      let newsData;
      // 人、題分流
      if(param.pol.length === 2 && param.issue.length === 1) { // compare
        let param1 = {pol: [param.pol[0]], issue: [param.issue[0]]};
        let param2 = {pol: [param.pol[1]], issue: [param.issue[0]]};
        let tag1Id = await getTagId(param1);
        let tag2Id = await getTagId(param2);
        let tag1NewsIds = await getTagNewsId(tag1Id);
        let tag2NewsIds = await getTagNewsId(tag2Id);
        newsData = await getCompareNews(tag1NewsIds, tag2NewsIds, size, paging, param, null);
      } else if(param.pol.length === 0 && param.issue.length === 0) { // All
        newsData = await getAllNews(size, paging);　// 以 news_id 取得新聞詳細內容
      } else {
        tagId = await getTagId(param); // 取得人物、議題 tagId
        tagsNewsIds = await getTagNewsId(tagId);　// 取得 tagId 對應之 newsId
        newsData = await getNews(tagsNewsIds, size, paging);　// 以 newsId 取得新聞詳細內容
      }
      resolve(newsData);
    });
  },
  getAccurate: function(param, size, paging) {
    return new Promise(async function(resolve, reject) {
      let sql;
      let tagId;
      let rawTagNewsIds;
      let tagsNewsIds;
      let newsData;
      // 人、題分流
      if(param.pol.length === 2 && param.issue.length === 1) { // compare
        let param1 = {pol: [param.pol[0]], issue: [param.issue[0]]};
        let param2 = {pol: [param.pol[1]], issue: [param.issue[0]]};
        let tag1Id = await getTagId(param1);
        let tag2Id = await getTagId(param2);
        let rawTag1NewsIds = await getTagNewsId(tag1Id);
        let rawTag2NewsIds = await getTagNewsId(tag2Id);
        let tag1NewsIds = await getIntentNewsIds(param, rawTag1NewsIds); // 取得 tagId 對應之 polIntent
        let tag2NewsIds = await getIntentNewsIds(param, rawTag2NewsIds); // 取得 tagId 對應之 polIntent
        newsData = await getCompareNews(tag1NewsIds, tag2NewsIds, size, paging, param, "accurate");
      } else if(param.pol.length === 0 && param.issue.length === 0) { // All
        let intentNewsIds = await getIntentNewsIds(param);
        newsData = await getAllNews(size, paging, intentNewsIds);　// 以 tagNewsIds 取得新聞詳細內容
      } else {
        tagId = await getTagId(param); // 取得人物、議題 tagId
        rawTagNewsIds = await getTagNewsId(tagId);　// 取得 tagId 對應之 tagNewsIds
        tagsNewsIds = await getIntentNewsIds(param, rawTagNewsIds); // 取得 tagId 對應之 polIntent
        newsData = await getNews(tagsNewsIds, size, paging);　// 以 tagNewsIds 取得新聞詳細內容
      }
      resolve(newsData);
    });
  },
  getPeriod: function(start, end) { // Admin NLP use
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


// get News route
function getAllNews(size, paging, intentNewsIds) {
  return new Promise(async function(resolve, reject) {
    let sql;
    let filter;
    let body = {};
    let offset = paging * size;
    let dataSet = [];

    let newsQuantity;
    if(intentNewsIds) {
      newsQuantity = await getNewsQuantity(intentNewsIds, "accurate");
      filter = ` id IN (?)`;
      dataSet = [intentNewsIds, offset, size]
    } else {
      newsQuantity = await getNewsQuantity();
      filter = ` intent = "politician_say"`;
      dataSet = [offset, size]
    }
    let maxPage = Math.floor((newsQuantity - 1) / size);
    if(paging < maxPage) {
      body.next_paging = paging + 1;
    }

    sql = `SELECT * FROM news WHERE`;
    mysql.con.query(sql+filter+` ORDER BY pubTime DESC LIMIT ?,?;`, dataSet, async function(error, results, fields) {
      if(error) {
        reject(error);
      } else {
        let news = await formNews(results);　// 新聞加上所含標籤
        body.news = news;
        resolve(body);
      }
    });
  });
}

function getNews(tagNewsIds, size, paging, mode) {
  return new Promise(async function(resolve, reject) {
    let filter;
    let body = {};
    let offset = paging * size;

    let newsQuantity = await getNewsQuantity(tagNewsIds);
    if(newsQuantity === 0) {
      body.news = [];
      resolve(body);
    } else {
      let maxPage = Math.floor((newsQuantity - 1) / size);
      if(paging < maxPage) {
        body.next_paging = paging + 1;
      }
    }

    if(mode === "accurate") {
      filter = ` AND intent = "politician_say"`;
    } else {
      filter = "";
    }
    // sql = `SELECT * FROM news WHERE id IN (?) AND intent = "politician_say" ORDER BY pubTime DESC LIMIT ?,?;`;
    let sql = `SELECT * FROM news WHERE id IN (?)`;
    mysql.con.query(sql+filter+` ORDER BY pubTime DESC LIMIT ?,?;`, [tagNewsIds, offset, size], async function(error, results, fields) {
      if(error) {
        reject(error);
      } else {
        let news = await formNews(results);　// 新聞加上所含標籤
        body.news = news;
        resolve(body);
      }
    });
  });
}

function getCompareNews(tag1NewsIds, tag2NewsIds, size, paging, param, mode) {
  return new Promise(async function(resolve, reject) {
    let sql;
    let body = {};
    let id1Count = 0;
    let id2Count = 0;
    let offset = paging * size;
    let tagsNewsIds = tag1NewsIds.concat(tag2NewsIds);

    let newsQuantity = await getNewsQuantity(tagsNewsIds);
    if(newsQuantity === 0) {
      body.news = [];
      resolve(body);
    } else {
      let maxPage = Math.floor((newsQuantity - 1) / size);
      if(paging < maxPage) {
        body.next_paging = paging + 1;
      }
    }

    body.id1Count = await getNewsQuantity(tag1NewsIds, mode);
    body.id2Count = await getNewsQuantity(tag2NewsIds, mode);

    if(mode === "accurate") {
      filter = "";
    } else {
      filter = ` AND intent = "politician_say"`;
    }
    sql = `SELECT * FROM news WHERE id IN (?)`;
    mysql.con.query(sql+filter+` ORDER BY pubTime DESC LIMIT ?,?;`, [tagsNewsIds, offset, size], async function(error, results, fields) {
      if(error) {
        reject(error);
      } else {
        let news = await formNews(results);　// 新聞加上所含標籤
        for(let i = 0; i < news.length; i++) {
          if(tag1NewsIds.indexOf(news[i].id) > -1 && tag2NewsIds.indexOf(news[i].id) > -1) {
            news[i].tag_id = "both";
          } else if (tag1NewsIds.indexOf(news[i].id) > -1 && tag2NewsIds.indexOf(news[i].id) < 0) {
            news[i].tag_id = param.pol[0];
          } else if (tag1NewsIds.indexOf(news[i].id) < 0 && tag2NewsIds.indexOf(news[i].id) > -1) {
            news[i].tag_id = param.pol[1];
          } else {
            console.log("none");
          }
        }
        body.news = news;
        resolve(body);
      }
    });
  });
}


// toolkit
function getNewsQuantity(newsIds, mode) {
  return new Promise(function(resolve, reject) {
    let filter;
    if(!newsIds) {
      filter = ` intent = "politician_say";`;
    } else if(newsIds.length === 0) {
      resolve(0);
    } else {
      filter = ` id IN (?) AND intent = "politician_say";`;
    }

    if(mode === "accurate") {
      filter = " id IN (?);";
    }

    let sql = `SELECT count(*) AS total FROM news WHERE`
    mysql.con.query(sql+filter, [newsIds], async function(error, results, fields) {
      if(error) {
        reject(error);
      } else {
        resolve(results[0].total);
      }
    });
  });
}

function formNews(news) {
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

function getIntentNewsIds(param, rawNewsId) {
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
    let sql;
    let data = [];
    let polStatus = true;
    if(param.pol.length === 0) {
      param.pol = [""];
      polStatus = false;
    }
    // 生成比對 model
    let intentModel = [];
    for(let i = 0; i < param.pol.length; i++) {
      for(let j = 0; j < intent.length; j++) {
        intentModel.push(param.pol[i]+intent[j])
      }
    }
    if(polStatus == false && param.issue.length === 0) { // All
      sql = "SELECT * FROM news";
      mysql.con.query(sql, function(error, results, fields) {
        if(error) {
          reject(error);
        } else {
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
    } else {  // 人、人題、題
      sql = `SELECT * FROM news WHERE id IN (?) ORDER BY pubTime DESC;`
      if(rawNewsId.length > 0) {
        mysql.con.query(sql, [rawNewsId], function(error, results, fields) {
          if(error) {
            reject(error);
          } else {
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
          }
        });
      } else {
        resolve(data);
      }
    }
  });
}


// 取得人物、議題 tag_id
function getTagId(param) {
  return new Promise(function(resolve, reject) {
    let tagNameArr = [];
    if(param.pol.length > 0) {
      for(let h = 0; h < param.pol.length; h++) {
        tagNameArr.push(param.pol[h]);
      }
    }
    if(param.issue.length > 0) {
      tagNameArr.push(param.issue[0]);
    }
    let data = [];
    let sql = `SELECT id FROM filtercount WHERE name IN (?);`;
    if(tagNameArr.length > 0) { // 人 or 題至少有其一
      mysql.con.query(sql, [tagNameArr], function(error, results, fields) {
        if(error) {
          reject(error);
        }
        for(let i = 0; i < results.length; i++) {
          data.push(results[i].id);
        }
        resolve(data);
      });
    } else { // 無人、題
      resolve(data);
    }
  });
}

// 取得 tag_id 對應之 news_id
function getTagNewsId(tagId) {
  return new Promise(function(resolve, reject) {
    let sql;
    if(tagId.length < 2) { // 單人
      sql = `SELECT news_id FROM newstag WHERE tag_id IN (?);`;
    } else { // 人與議題
      sql = `
        SELECT a.news_id, b.title FROM newstag AS a
        LEFT JOIN news as b ON (a.news_id = b.id)
        WHERE tag_id IN (?) GROUP BY news_id HAVING count(*) > 1;
      `;
    }
    let data = [];
    if(tagId.length > 0) { // 人 or 題至少有其一
      mysql.con.query(sql, [tagId], function(error, results, fields) {
        if(error) {
          reject(error);
        }
        for(let i = 0; i < results.length; i++) {
          data.push(results[i].news_id);
        }
        resolve(data);
      });
    } else { // 無人、題
      resolve(data);
    }
  });
}



function getTags(news_id) {
  return new Promise(function(resolve, reject) {
    let sql = `
      SELECT a.news_id, a.tag_id, b.name, b.type
      FROM newstag AS a
      LEFT JOIN filtercount AS b ON (a.tag_id = b.id)
      WHERE a.news_id = ${news_id};
    `;
    mysql.con.query(sql, function(error, results, fields) {
      if(error) {
        reject(error);
      }
      resolve(results);
    });
  });
}
