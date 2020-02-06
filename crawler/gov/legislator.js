const request = require('request');
const mysql = require("../../util/mysqlcon.js");

module.exports={
  get: function() {

    let url = 'https://data.ly.gov.tw/odw/openDatasetJson.action?id=16&selectTerm=all&page=2';
    request(url, async function(err, resp, body) {
      body = JSON.parse(body);
      let data = [];

      for(let i = 0; i < body.jsonList.length; i++) {
        let info = {
          name: body.jsonList[i].name,
          party: body.jsonList[i].party,
          area: body.jsonList[i].areaName,
          type: '立法委員'
        }
        await saveDB(info);
        data.push(info);
      }
      return data;
    });
  }
}

async function saveDB(info) {

  return new Promise(function(resolve, reject) {

    mysql.con.query('select * from politician where name = ?', info.name, function(error, results, fields) {
      if(error) {
        reject(error);
      }
      if(results.length < 1) {
        // save to db
        mysql.con.query('insert into politician set ?', info, function(error, resp, fields) {
          if(error) {
            reject(error);
          } else {
            resolve("Finished saving to database");
          }
        });
      } else {
        resolve("No need to update database");
      }
    });
  });
}
