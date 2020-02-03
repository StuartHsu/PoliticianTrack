const mysql = require("../../util/mysqlcon.js");
const nodejieba = require('nodejieba');

nodejieba.load({userDict: './nlp/jieba/dict.txt'},);

module.exports={
  test: function() {
    return new Promise(function(resolve, reject) {
      mysql.con.query('select content from news', async function(error, result1, fields) {
        if(error) {
          reject(error);
        }
        for(let j = 527; j < 550; j++) { // result1.length
          console.log("j: " + j);
          let jieba = nodejieba.tag(result1[j].content);
          for(let i = 0; i < jieba.length; i++) {
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
        resolve("All tags update!");
      });
    });
  }
}


// function updateTagDB(jieba) {
//   return new Promise(async function(resolve, reject) {
//     let body = [];
//     for(let i = 0; i < jieba.length; i++) {
//       let data = {
//         name: jieba[i].word,
//         type: jieba[i].tag,
//         count: 1
//       }
//       body.push(data);
//       // console.log(data);
//       await db(data);
//       // resolve("ok");
//     }
//
//     resolve(body);
//     // resolve("ok");
//   });
// }

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
