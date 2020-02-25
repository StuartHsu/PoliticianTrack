const mysql = require("../../util/mysqlcon.js");
const nodejieba = require('nodejieba');

nodejieba.load({userDict: './util/dict.txt'});

module.exports={
  getTag: function() {
    return new Promise(async function(resolve, reject) {

      let sql = 'SELECT id, content FROM news;';
      mysql.con.query(sql, async function(error, result1, fields) {
        if(error) {
          reject(error);
        }
        let totalCount = result1.length
        for(let j = 0; j < result1.length; j++) { // news error: 960
          console.log("處理中：" + j + "/" + totalCount + " New_id：" + result1[j].id);
          let jieba = nodejieba.tag(result1[j].content);
          for(let i = 0; i < jieba.length; i++) {
            if(jieba[i].tag === "NRP" || jieba[i].tag === "NI") {
              let tagId = await getTagId(jieba[i].word);
              let data = {
                news_id: result1[j].id,
                tag_id: tagId
              }
              await checkNewsId(data).then(async function(result) {
                await saveTagInfo(data, result);
              });
            }
          }
        }
        console.log("處理完成");
        resolve("All tags update!");
      });
    });
  }
}


function getTagId(tagName) {

  return new Promise(async function(resolve, reject) {
    mysql.con.query(`SELECT id FROM filterCount WHERE name = ?`, tagName, async function(error, checkResult, fields) {
      if(error){
        reject("Database Query Error");
      }
      resolve(checkResult[0].id);
    });
  });
}

function checkNewsId(data) {
  return new Promise(async function(resolve, reject) {
    mysql.con.query(`SELECT * FROM newsTag WHERE news_id = ? AND tag_id = ?;`, [data.news_id, data.tag_id], async function(error, checkResult, fields) {
      if(error){
        reject("Database Query Error");
      }
      resolve(checkResult);
    });
  });
}

function saveTagInfo(data, checkResult) {

  return new Promise(async function(resolve, reject) {
    if(checkResult.length < 1) {
      mysql.con.query(`INSERT newsTag SET ?`, data, async function(error, result, fields) {
        if(error) {
          reject("Data Insert Error");
        }
        resolve("Insert ok");
      });
    } else {
      mysql.con.query(`UPDATE newsTag SET ? WHERE news_id = ${data.news_id} AND tag_id = ${data.tag_id}`, data, async function(error, result, fields) {
        if(error){
          reject("Data Update Error");
        }
        resolve("Update ok");
      });
    }
  });
}
