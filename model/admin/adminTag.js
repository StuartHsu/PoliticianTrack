const mysql = require("../../util/mysqlcon.js");
const nodejieba = require('nodejieba');
const fs = require("fs");

nodejieba.load({userDict: './nlp/jieba/dict.txt'});

module.exports={
  seg: function(start, end) {
    return new Promise(function(resolve, reject) {
      let sql = 'SELECT content FROM news WHERE pubTime > ? AND pubTime < ?';
      mysql.con.query(sql, [start, end], async function(error, result1, fields) {
        if(error) {
          reject(error);
        }
        for(let j = 0; j < result1.length; j++) { // result1.length 800 1189
          console.log("j: " + j);
          let jieba = nodejieba.tag(result1[j].content);
          for(let i = 0; i < jieba.length; i++) {
            if(jieba[i].tag === "N") {
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
  },
  get: function() {
    return new Promise(function(resolve, reject) {
      mysql.con.query('SELECT * FROM tagVerify WHERE status is null ORDER BY count DESC;', async function(error, results, fields) {
        if(error) {
          reject(error);
        }
        let data = [];
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
  updateDic: function() {
    return new Promise(function(resolve, reject) {
      let data = "測試用 1 NRP";
      fs.appendFile('./nlp/jieba/dict.txt', data, (err) => {
        if (err) throw err;
        resolve("Update dict.txt ok");
      });
    });
  },
  updateDB: function() {
    return new Promise(async function(resolve, reject) {
      let data = {
        name: "測試用",
        type: "NRP",
        status: "polTag"
      }
      let query = `update tagVerify set type = "${data.type}", status = "${data.status}" where name = "${data.name}";`;
      mysql.con.query(query, function(error, results, fields){
        if(error){
          reject("Database Query Error");
        }
        resolve("ok");
      });
    });
  }
}

function db(data) {

  return new Promise(async function(resolve, reject) {

    mysql.con.query(`select * from tagVerify where name = "${data.name}"`, async function(error, checkResult, fields) {
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
      mysql.con.query('insert into tagVerify set ?', data, function(error, results, fields) {
        if(error){
          reject("Database Insert Error");
        }
        resolve("ok");
      });
    } else {
      let query = `update tagVerify set count = count + 1 where name = "${data.name}"`;
      mysql.con.query(query, function(error, results, fields){
        if(error){
          reject("Database Query Error");
        }
        resolve("ok");
      });
    }
  });
}
