const mysql = require("../../util/mysqlcon.js");
const nodejieba = require('nodejieba');
const fs = require("fs");

nodejieba.load({userDict: '../PolsTrackCrawler/util/dict.txt'});

module.exports={
  seg: function(start, end) {
    return new Promise(function(resolve, reject) {
      let sql = 'SELECT content FROM news WHERE pubTime > ? AND pubTime < ?';
      mysql.con.query(sql, [start, end], async function(error, result1, fields) {
        if(error) {
          reject(error);
        }
        let totalCount = result1.length
        console.log("預計處理：" + result1.length);
        for(let j = 0; j < totalCount; j++) { // result1.length 800 1189
          console.log("j: " + j + "/" + totalCount);
          let jieba = nodejieba.tag(result1[j].content);
          for(let i = 0; i < jieba.length; i++) {
            if(jieba[i].tag === "N") {
              let data = {
                name: jieba[i].word,
                type: jieba[i].tag,
                count: 1
              }
              // await db(data).then(async function(result){
              //   await db2(data, result);
              // });
              await db3(data).catch(err => {
                reject(err);
              });
            }
          }
        }
        resolve("Segmentation done");
      });
    });
  },
  get: function() {
    return new Promise(function(resolve, reject) {
      mysql.con.query('SELECT * FROM tagverify WHERE status is null AND count > 20 ORDER BY count DESC;', async function(error, results, fields) {
        if(error) {
          reject(error);
        }
        let data = [];
        console.log("需處理標籤數量：" + results.length);
        for(let i = 0; i < results.length; i++) {
          let body = {
            tagName: results[i].name,
            count: results[i].count
          }
          data.push(body);
        }
        resolve(data);
      });
    });
  },
  updateDic: function(updateData) {
    return new Promise(function(resolve, reject) {
      let data;
      for(let i = 0; i < updateData.length; i++) {
        if(updateData[i].inputTag) {
          data = `${updateData[i].tagName} 1 ${updateData[i].inputTag}\n`
          fs.appendFile('../PolsTrackCrawler/util/dict.txt', data, (err) => {
            if (err) throw err;
            resolve("Update dict.txt ok");
          });
        } else {
          resolve("No need to update");
        }
      }
    });
  },
  updateDB: function(updateData) {
    return new Promise(async function(resolve, reject) {
      let data = {};
      for(let i = 0; i < updateData.length; i++) {
        data.name = updateData[i].tagName;
        if(updateData[i].inputTag) {
          data.type = updateData[i].inputTag;
          data.status = "Done";
        } else {
          data.type = "N";
          data.status = "Unused";
        }
        await updateTagStatus(data);
      }
      resolve("All tag status update ok");
    });
  },
  setSynonyms: function(param) {
    return new Promise(async function(resolve, reject) {
      let tagName = [param.parentTag, param.childTag];
      sql = `
        SELECT id FROM filtercount WHERE name IN (?)
        ORDER BY CASE
        WHEN name = ? THEN 1 END DESC;
      `;
      mysql.con.query(sql, [[param.parentTag, param.childTag], param.parentTag], async function(error, result, fields) {
        if(error){
          reject("Database Insert Error");
        } else {
          if(result.length < 2) {
            resolve("One of tagName which you input dosen's in database");
          } else {
            sql = `UPDATE filtercount SET parent_name = ?, parent_id = ? WHERE name = ?`;
            mysql.con.query(sql, [param.parentTag, result[0].id, param.childTag], async function(error, checkResult, fields) {
              if(error){
                reject("Database Insert Error");
              } else {
                resolve("Set ok");
              }
            });
          }
        }
      });
    });
  }
}

function db(data) {

  return new Promise(async function(resolve, reject) {

    mysql.con.query(`select * from tagverify where name = "${data.name}"`, async function(error, checkResult, fields) {
      if(error){
        reject("Database Insert Error");
      }
      resolve(checkResult);
    });
  });
}

function db2(data, checkResult) {

  return new Promise(async function(resolve, reject) {
    if(checkResult.length < 1) {
      mysql.con.query('insert into tagverify set ?', data, function(error, results, fields) {
        if(error){
          reject("Database Insert Error");
        }
        resolve("ok");
      });
    } else {
      let query = `update tagverify set count = count + 1 where name = "${data.name}"`;
      mysql.con.query(query, function(error, results, fields){
        if(error){
          reject("Database Query Error");
        }
        resolve("ok");
      });
    }
  });
}

function db3(data) {
  return new Promise(async function(resolve, reject) {
    mysql.con.getConnection(function(err, connection) {
      connection.beginTransaction(function(error) {
        if(error){
    			reject("Transaction Error: " + error);
    		}
        mysql.con.query("SELECT * FROM tagverify WHERE name = ?", data.name, async function(error, checkResult, fields) {
          if(error){
            return mysql.con.rollback(function() {
              connection.release();
              reject("Database Query Error: " + error);
            });
          } else {
            if(checkResult.length < 1) {
              mysql.con.query("INSERT into tagverify SET ?", data, function(error, results, fields) {
                if(error){
                  return mysql.con.rollback(function() {
                    connection.release();
                    reject("Database Insert Error: " + error);
                  });
                } else {
                  connection.commit(function(error) {
                    if(error) {
                      return mysql.con.rollback(function() {
                        connection.release();
                        reject("Database Commit Error: " + error);
                      });
                    }
                    connection.release();
                    resolve("OK");
                  });
                }
              });
            } else {
              mysql.con.query("UPDATE tagverify SET count = count + 1 WHERE name = ?", data.name, function(error, results, fields){
                if(error){
                  return mysql.con.rollback(function() {
                    connection.release();
                    reject("Database Update Error: " + error);
                  });
                }
                connection.commit(function(error) {
                  if(error) {
                    return mysql.con.rollback(function() {
                      connection.release();
                      reject("Database Commit Error: " + error);
                    });
                  }
                  connection.release();
                  resolve("OK");
                })
              });
            }
          }
        });
      });
    });
  });
}










function updateTagStatus(data) {

  return new Promise(async function(resolve, reject) {

    let query = `update tagverify set type = "${data.type}", status = "${data.status}" where name = "${data.name}";`;
    mysql.con.query(query, function(error, results, fields) {
      if(error) {
        reject("Database Update Error");
      } else {
        resolve();
      }
    });

  });
}
