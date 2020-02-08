const mysql = require("../../util/mysqlcon.js");
const nodejieba = require('nodejieba');

nodejieba.load({userDict: './util/dict.txt'},);

module.exports={
  getPeriodCount: function(start, end) {
    return new Promise(async function(resolve, reject) {
      await clearCount();

      let sql = 'SELECT content FROM news WHERE pubTime > ? AND pubTime < ? AND intent = "politician_say"';
      mysql.con.query(sql, [start, end], async function(error, result1, fields) {
        if(error) {
          reject(error);
        }
        console.log("資料數：" + result1.length);
        for(let j = 0; j < result1.length; j++) {
          console.log("tagFreq j: " + j);
          let jieba = nodejieba.tag(result1[j].content);
          for(let i = 0; i < jieba.length; i++) {
            if(jieba[i].tag === "NRP" || jieba[i].tag === "NI") {
              let data = {
                name: jieba[i].word,
                type: jieba[i].tag,
                count: 1
              }
              await db(data).then(async function(result){
                await db2(data, result);
              });
            }
          }
        }
        resolve("All tags update!");
      });
    });
  }
}

function clearCount() {
  return new Promise(function(resolve, reject) {
    let sql = 'UPDATE filterCount SET count = 0;';
    mysql.con.query(sql, function(error, results, fields) {
      if(error) {
        reject(error);
      } else {
        resolve();
      }
    });
  });
}

function db(data) {

  return new Promise(async function(resolve, reject) {

    mysql.con.query(`select * from filterCount where name = "${data.name}"`, async function(error, checkResult, fields) {
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
      mysql.con.query('insert into filterCount set ?', data, function(error, results, fields) {
        if(error){
          reject("Database Insert Error");
        }
        resolve("ok");
      });
    } else {
      let query = `update filterCount set count = count + 1 where name = "${data.name}"`;
      mysql.con.query(query, function(error, results, fields){
        if(error){
          reject("Database Query Error");
        }
        resolve("ok");
      });
    }
  });
}
