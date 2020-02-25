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
      let newsRaw = await getNewsG(title, titleKeyword, content, contentKeyword);
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
  // getAll: function() {
  //   return new Promise(function(resolve, reject) {
  //     let sql = `SELECT * FROM news WHERE intent = "politician_say" ORDER BY pubTime DESC;`
  //     mysql.con.query(sql, async function(error, results, fields) {
  //       if(error) {
  //         reject(error);
  //       }
  //       // 新聞加上所含標籤
  //       let data = await formTagNews(results);
  //       resolve(data);
  //     });
  //   });
  // },
  // getNoIssNews: function(pol) {
  //   return new Promise(async function(resolve, reject) {
  //
  //     // 取得人物的 Tag Id
  //     let polTagId = await getTagId(pol);
  //     // 取得人物 Tag Id 對應的 news_id
  //     let newsId = await getNewsId(polTagId);
  //
  //     let sql = `SELECT * FROM news WHERE id IN (?) AND intent = "politician_say" ORDER BY pubTime DESC;`
  //     mysql.con.query(sql, [newsId], async function(error, results, fields) {
  //       if(error) {
  //         reject(error);
  //       }
  //       // 新聞加上所含標籤
  //       let data = await formTagNews(results);
  //       resolve(data);
  //     });
  //   });
  // },
  // getNoPolNews: function(issue) {
  //   return new Promise(async function(resolve, reject) {
  //
  //     // 取得議題的 Tag Id
  //     let issueTagId = await getTagId(issue);
  //     // 取得議題 Tag Id 對應的 news_id
  //     let newsId = await getNewsId(issueTagId);
  //     console.log(newsId);
  //     let sql = `SELECT * FROM news WHERE id IN (?) AND intent = "politician_say" ORDER BY pubTime DESC;`
  //     mysql.con.query(sql, [newsId], async function(error, results, fields) {
  //       if(error) {
  //         reject(error);
  //       }
  //       // 新聞加上所含標籤
  //       let data = await formTagNews(results);
  //       resolve(data);
  //     });
  //   });
  // },
  // getPolIssNews: function(pol, issue) {
  //   return new Promise(async function(resolve, reject) {
  //
  //     let tagName = [pol, issue];
  //     console.log(tagName);
  //     // 取得人物及議題的 Tag Id
  //     let tagId = await getTagId(tagName);
  //     // 取得人物及議題 Tag Id 對應的 news_id
  //     let newsId = await getBothNewsId(tagId, 1);
  //     let data;
  //
  //     let sql = `SELECT * FROM news WHERE id IN (?) AND intent = "politician_say" ORDER BY pubTime DESC;`
  //     if(newsId.length > 0) { // 判斷是否有此人此議題之新聞
  //       mysql.con.query(sql, [newsId], async function(error, results, fields) {
  //         if(error) {
  //           reject(error);
  //         }
  //         // 新聞加上所含標籤
  //         data = await formTagNews(results);
  //         resolve(data);
  //       });
  //     } else {
  //       resolve(data);
  //     }
  //   });
  // },
  // getCompare: function(pol, issue) {
  //   return new Promise(async function(resolve, reject) {
  //     let id1 = await getTagId([pol[0], issue]);
  //     let id2 = await getTagId([pol[1], issue]);
  //     let new1 = await getBothNewsId(id1, 1);
  //     let new2 = await getBothNewsId(id2, 1);
  //     let newsArray = new1.concat(new2);
  //     let body = [];
  //     let sql = `SELECT * FROM news WHERE id IN (?) AND intent = "politician_say" ORDER BY pubTime DESC;`
  //
  //     if(newsArray.length > 0) { // 判斷是否有此兩人同一議題之新聞
  //       mysql.con.query(sql, [newsArray], async function(error, results, fields) {
  //         if(error) {
  //           reject(error);
  //         }
  //         // 新聞加上所含標籤
  //         let data = await formTagNews(results);
  //
  //         for(let i = 0; i < data.length; i++) {
  //           if(new1.indexOf(data[i].id) > -1 && new2.indexOf(data[i].id) > -1) {
  //             data[i].tag_id = "both";
  //           } else if (new1.indexOf(data[i].id) > -1 && new2.indexOf(data[i].id) < 0) {
  //             data[i].tag_id = pol[0];
  //           } else if (new1.indexOf(data[i].id) < 0 && new2.indexOf(data[i].id) > -1) {
  //             data[i].tag_id = pol[1];
  //           } else {
  //             console.log("none");
  //           }
  //           body.push(data[i]);
  //         }
  //         resolve(body);
  //       });
  //     } else {
  //       resolve(body);
  //     }
  //   });
  // },
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
  },
  getCompareLess: function(pol, issue) {
    return new Promise(async function(resolve, reject) {
      let id1 = await getTagId([pol[0], issue]);
      let id2 = await getTagId([pol[1], issue]);
      let new1 = await getBothNewsId(id1, 1);
      let new2 = await getBothNewsId(id2, 1);
      let newsArray = new1.concat(new2);

      // 取得人物對應的 news_id
      let newsId = await formPolIntent2(pol, newsArray);

      let body = [];
      let sql = `SELECT * FROM news WHERE id IN (?) ORDER BY pubTime DESC;`

      if(newsArray.length > 0) { // 判斷是否有此兩人同一議題之新聞
        mysql.con.query(sql, [newsId], async function(error, results, fields) {
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
  get: function(param, size, paging) {
    return new Promise(async function(resolve, reject) {
      let sql;
      let tag_id;
      let news_id;
      let news_Data;
      // 人、題分流
      if(param.pol.length === 2 && param.issue.length === 1) { // compare
        let param1 = {pol: [param.pol[0]], issue: [param.issue[0]]};
        let param2 = {pol: [param.pol[1]], issue: [param.issue[0]]};
        let tag_id1 = await getTagId(param1);
        let tag_id2 = await getTagId(param2);
        let news_id1 = await getNewsId(tag_id1);
        let news_id2 = await getNewsId(tag_id2);
        let news_id = news_id1.concat(news_id2);
        news_Data = await getNews(news_id, size, paging, "comp", news_id1, news_id2, param);
      } else if(param.pol.length === 0 && param.issue.length === 0) { // All
        news_Data = await getNews(news_id, size, paging);　// 以 news_id 取得新聞詳細內容
      } else {
        tag_id = await getTagId(param); // 取得人物、議題 tag_id
        news_id = await getNewsId(tag_id);　// 取得 tag_id 對應之 news_id
        news_Data = await getNews(news_id, size, paging);　// 以 news_id 取得新聞詳細內容
      }
      resolve(news_Data);
    });
  },
  getStrict: function(param, size, paging) {
    return new Promise(async function(resolve, reject) {
      let sql;
      let tag_id;
      let news_id;
      let rawNews_id;
      let news_Data;
      // 人、題分流
      if(param.pol.length === 2 && param.issue.length === 1) { // compare
        let param1 = {pol: [param.pol[0]], issue: [param.issue[0]]};
        let param2 = {pol: [param.pol[1]], issue: [param.issue[0]]};
        let tag_id1 = await getTagId(param1);
        let tag_id2 = await getTagId(param2);
        let rawNews_id1 = await getNewsId(tag_id1);
        let rawNews_id2 = await getNewsId(tag_id2);
        rawNews_id = rawNews_id1.concat(rawNews_id2);
        news_id = await formPolIntent(param, rawNews_id); // 取得 tag_id 對應之 polIntent
        news_Data = await getNewsStrict(news_id, size, paging, param, "comp", rawNews_id1, rawNews_id2);
      } else if(param.pol.length === 0 && param.issue.length === 0) { // All
        news_Data = await getNewsStrict(news_id, size, paging, param);　// 以 news_id 取得新聞詳細內容
      } else {
        tag_id = await getTagId(param); // 取得人物、議題 tag_id
        rawNews_id = await getNewsId(tag_id);　// 取得 tag_id 對應之 news_id
        news_id = await formPolIntent(param, rawNews_id); // 取得 tag_id 對應之 polIntent
        news_Data = await getNewsStrict(news_id, size, paging);　// 以 news_id 取得新聞詳細內容
      }
      resolve(news_Data);
    });
  }
}






function getNewsG(title, titleKeyword, content, contentKeyword) {
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
      // sql = `select * from news where intent = "politician_say" order by pubTime desc;`
      sql = `select * from news where intent = "politician_say" order by pubTime desc LIMIT 0,20;`
    }
    mysql.con.query(sql, function(error, results, fields) {
      if(error) {
        reject(error);
      }
      resolve(results);
    });
  });
}

// 以 news_id 取得新聞詳細內容
function getNews(news_id, size, paging, type, news_id1, news_id2, param) {
  return new Promise(function(resolve, reject) {
    let sql;
    let body = {};
    let news;
    let offset = paging * size;
    if(!news_id) { // All
      sql = `SELECT count(*) AS total FROM news WHERE intent = "politician_say";`;
      mysql.con.query(sql, async function(error, results, fields) {
        if(error) {
          reject(error);
        } else {
          let maxPage = Math.floor((results[0].total - 1) / size);
					if(paging < maxPage) {
						body.next_paging = paging + 1;
					}
          sql = `SELECT * FROM news WHERE intent = "politician_say" ORDER BY pubTime DESC LIMIT ?,?;`;
          mysql.con.query(sql, [offset, size],async function(error, results, fields) {
            if(error) {
              reject(error);
            } else {
              news = await formTagNews(results);　// 新聞加上所含標籤
              body.news = news;
              resolve(body);
            }
          });
        }
      });
    } else if (news_id.length > 0) {
      sql = `SELECT count(*) AS total FROM news WHERE id IN (?) AND intent = "politician_say";`;
      mysql.con.query(sql, [news_id], async function(error, results, fields) {
        if(error) {
          reject(error);
        } else {
          let maxPage = Math.floor((results[0].total - 1) / size);
					if(paging < maxPage) {
						body.next_paging = paging + 1;
					}
          sql = `SELECT * FROM news WHERE id IN (?) AND intent = "politician_say" ORDER BY pubTime DESC LIMIT ?,?;`;
          mysql.con.query(sql, [news_id, offset, size], async function(error, results, fields) {
            if(error) {
              reject(error);
            } else {
              news = await formTagNews(results);　// 新聞加上所含標籤

              if(type === "comp") { // 比較
                for(let i = 0; i < news.length; i++) {
                  if(news_id1.indexOf(news[i].id) > -1 && news_id2.indexOf(news[i].id) > -1) {
                    news[i].tag_id = "both";
                  } else if (news_id1.indexOf(news[i].id) > -1 && news_id2.indexOf(news[i].id) < 0) {
                    news[i].tag_id = param.pol[0];
                  } else if (news_id1.indexOf(news[i].id) < 0 && news_id2.indexOf(news[i].id) > -1) {
                    news[i].tag_id = param.pol[1];
                  } else {
                    console.log("none");
                  }
                }
              }
              body.news = news;
              resolve(body);
            }
          });
        }
      });
    } else {
      body.news = [];
      resolve(body);
    }
  });
}

// 以 news_id 取得新聞詳細內容 - Strict
function getNewsStrict(news_id, size, paging, param, type, news_id1, news_id2) {
  return new Promise(async function(resolve, reject) {
    let sql;
    let body = {};
    let news;
    let offset = paging * size;
    if(!news_id) { // All
      let news_id = await formPolIntent(param);
      sql = `SELECT count(*) AS total FROM news WHERE id IN (?)`;
      mysql.con.query(sql, [news_id], async function(error, results, fields) {
        if(error) {
          reject(error);
        } else {
          let maxPage = Math.floor((results[0].total - 1) / size);
					if(paging < maxPage) {
						body.next_paging = paging + 1;
					}
          sql = `SELECT * FROM news WHERE id IN (?) ORDER BY pubTime DESC LIMIT ?,?;`;
          mysql.con.query(sql, [news_id, offset, size],async function(error, results, fields) {
            if(error) {
              reject(error);
            } else {
              news = await formTagNews(results);　// 新聞加上所含標籤
              body.news = news;
              resolve(body);
            }
          });
        }
      });
    } else if (news_id.length > 0) {
      sql = `SELECT count(*) AS total FROM news WHERE id IN (?);`;
      mysql.con.query(sql, [news_id], async function(error, results, fields) {
        if(error) {
          reject(error);
        } else {
          let maxPage = Math.floor((results[0].total - 1) / size);
					if(paging < maxPage) {
						body.next_paging = paging + 1;
					}
          sql = `SELECT * FROM news WHERE id IN (?) ORDER BY pubTime DESC LIMIT ?,?;`;
          mysql.con.query(sql, [news_id, offset, size], async function(error, results, fields) {
            if(error) {
              reject(error);
            } else {
              news = await formTagNews(results);　// 新聞加上所含標籤

              if(type === "comp") { // 比較
                for(let i = 0; i < news.length; i++) {
                  if(news_id1.indexOf(news[i].id) > -1 && news_id2.indexOf(news[i].id) > -1) {
                    news[i].tag_id = "both";
                  } else if (news_id1.indexOf(news[i].id) > -1 && news_id2.indexOf(news[i].id) < 0) {
                    news[i].tag_id = param.pol[0];
                  } else if (news_id1.indexOf(news[i].id) < 0 && news_id2.indexOf(news[i].id) > -1) {
                    news[i].tag_id = param.pol[1];
                  } else {
                    console.log("none");
                  }
                }
              }
              body.news = news;
              resolve(body);
            }
          });
        }
      });
    } else {
      body.news = [];
      resolve(body);
    }
  });
}

// 取得人物、議題 tag_id
function getTagId(tagName) {
  return new Promise(function(resolve, reject) {
    let tagNameArr = [];
    if(tagName.pol.length > 0) {
      for(let h = 0; h < tagName.pol.length; h++) {
        tagNameArr.push(tagName.pol[h]);
      }
    }
    if(tagName.issue.length > 0) {
      tagNameArr.push(tagName.issue[0]);
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
function getNewsId(tagId) {
  return new Promise(function(resolve, reject) {
    let sql;
    if(tagId.length < 2) {
      sql = `SELECT news_id FROM newstag WHERE tag_id IN (?);`;
    } else {
      sql = `SELECT news_id FROM newstag WHERE tag_id IN (?) GROUP BY news_id HAVING count(*) > 1;`;
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





// 可廢棄
function getBothNewsId(param, limit) {
  return new Promise(function(resolve, reject) {

    let sql = `SELECT news_id FROM newstag WHERE tag_id IN (?) GROUP BY news_id HAVING count(*) > ?;`;
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
    let sql = `SELECT a.news_id, a.tag_id, b.name, b.type FROM newstag as a LEFT JOIN filtercount as b ON a.tag_id = b.id WHERE a.news_id = ${news_id};`;
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

function formPolIntent(param, rawNewsId) {
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
    }

    // sql = "SELECT * FROM news";
    //
    // mysql.con.query(sql, function(error, results, fields) {
    //   if(error) {
    //     console.log(error);
    //   }
    //   for(let i = 0; i < results.length; i++) {
    //     for(let j = 0; j < intentModel.length; j++) {
    //       if(results[i].title.indexOf(intentModel[j]) != -1) {
    //         data.push(results[i].id);
    //         j = intentModel.length;
    //       }
    //     }
    //   }
    //   console.log(data);
    //   resolve(data);
    // });
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
