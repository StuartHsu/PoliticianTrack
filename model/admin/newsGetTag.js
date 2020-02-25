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
        for(let j = 0; j < totalCount; j++) { // news error: 960
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
                await saveTagInfo(data, result).then(function(result) {
                  // nothing
                }).catch(err => {
                  console.log("saveTagInfo: " + err);
                });
              }).catch(err => {
                console.log("checkNewsId: " + err);
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
  // console.log(tagName);
  return new Promise(async function(resolve, reject) {
    mysql.con.query(`SELECT id FROM filtercount WHERE name = ?`, tagName, async function(error, checkResult, fields) {
      if(error){
        reject("Database Query Error");
      }
      // console.log(checkResult[0].id);
      resolve(checkResult[0].id);
    });
  });
}

function checkNewsId(data) {
  return new Promise(async function(resolve, reject) {
    mysql.con.query(`SELECT * FROM newstag WHERE news_id = ? AND tag_id = ?;`, [data.news_id, data.tag_id], async function(error, checkResult, fields) {
      if(error){
        reject("Database Query Error");
      }
      // console.log(checkResult);
      resolve(checkResult);
    });
  });
}

function saveTagInfo(data, checkResult) {
  // console.log(data);
  // console.log(checkResult);
  return new Promise(async function(resolve, reject) {
    if(checkResult.length < 1) {
      mysql.con.query(`INSERT newstag SET ?`, [data], async function(error, result, fields) {
        if(error) {
          // console.log(data);
          reject("Data Insert Error");
          // resolve("Data Insert Error");
        }
        resolve("Insert ok");
      });
    } else {
      mysql.con.query(`UPDATE newstag SET ? WHERE news_id = ${data.news_id} AND tag_id = ${data.tag_id}`, [data], async function(error, result, fields) {
        if(error){
          reject("Data Update Error");
        }
        resolve("Update ok");
      });
    }
  });
}
