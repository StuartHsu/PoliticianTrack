const XLSX = require('xlsx');
const mysql = require("../../util/mysqlcon.js");

const workbook = XLSX.readFile('./polList.xlsx'); // 開啟檔案 (工作表)
const sheetNames = workbook.SheetNames;  // 頁面陣列
const sheet = workbook.Sheets[sheetNames[4]]; // 取用頁面

module.exports={
  get: function() {
    return new Promise(async function(resolve, reject) {
      let headers = {};
      let data = [];
      let keys = Object.keys(sheet);
      keys
      .filter(k => k[0] !== '!') // 過濾以 ! 開頭的 key
      .forEach(k => { // 遍歷所有單元格
      let col = k.substring(0, 1); // 如 A11 中的 A
      let row = parseInt(k.substring(1)); // 如 A11 中的 11
      let value = sheet[k].v; // 當前單元格的值
      // 儲存欄位名
      if (row === 1) {
        headers[col] = value;
        return;
      }
      // 解析成 JSON
      if (!data[row]) {
        data[row] = {};
      }
        data[row][headers[col]] = value;
      });
      let dataLength = data.length
      for(let i = 2; i < dataLength; i++) {
        console.log("處理中：" + i + "/" + dataLength);
        await saveDB(data[i]);
      }
      console.log("處理完畢");
      resolve("Done");
    });
  }
}



async function saveDB(info) {

  return new Promise(function(resolve, reject) {
    mysql.con.query('SELECT * FROM politician WHERE name = ?;', info.name, function(error, results, fields) {
      if(error) {
        reject(error);
      }
      if(results.length < 1) {
        // save to db
        mysql.con.query('INSERT INTO politician SET ?', info, function(error, resp, fields) {
          if(error) {
            reject(error);
          } else {
            resolve("Finished saving to database");
          }
        });
      } else {
        // update db
        mysql.con.query('UPDATE politician SET ? WHERE name = ?', [info, info.name], function(error, resp, fields) {
          if(error) {
            reject(error);
          } else {
            resolve("Finished update database");
          }
        });
      }
    });
  });
}
