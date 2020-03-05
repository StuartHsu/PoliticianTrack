const mysql = require("../../util/mysqlcon.js");
const promiseSql = require("../../util/promiseSql.js");
const nodejieba = require('nodejieba');
const fs = require("fs");

nodejieba.load({userDict: '../PolsTrackCrawler/util/dict.txt'});

module.exports =
{
  seg: function(start, end)
  {
    return new Promise(async function(resolve, reject)
    {
      try
      {
        let sql = "SELECT content FROM news WHERE pubTime > ? AND pubTime < ?;";
        let results = await promiseSql.query(sql, [start, end]);
        let totalCount = results.length;

        for (let j = 0; j < totalCount; j++)
        {
          console.log("處理中：" + j + "/" + totalCount);
          let jieba = nodejieba.tag(results[j].content);
          for (let i = 0; i < jieba.length; i++)
          {
            if (jieba[i].tag === "N")
            {
              let data =
              {
                name: jieba[i].word,
                type: jieba[i].tag,
                count: 1
              }
              await saveSegmentationResult(data);
            }
          }
        }
        console.log("斷詞處理完成");

        resolve("Segmentation done");
      }
      catch(error)
      {
        reject(error);
      }
    });
  },
  get: function()
  {
    return new Promise(async function(resolve, reject)
    {
      let sql = `SELECT * FROM tagverify WHERE status is null AND count > ? ORDER BY count DESC;`;
      let count = 20;

      try
      {
        let results = await promiseSql.query(sql, count);
        let data = [];
        let totalCount = results.length;

        console.log("待處理標籤數量：" + totalCount);
        for (let i = 0; i < totalCount; i++)
        {
          let body =
          {
            tagName: results[i].name,
            count: results[i].count
          }
          data.push(body);
        }

        resolve(data);
      }
      catch(error)
      {
        reject(error);
      }
    });
  },
  updateDic: function(updateData)
  {
    return new Promise(function(resolve, reject)
    {
      for (let i = 0; i < updateData.length; i++)
      {
        if (updateData[i].inputTag)
        {
          let newTag = `${updateData[i].tagName} 1 ${updateData[i].inputTag}\n`;

          fs.appendFile('../PolsTrackCrawler/util/dict.txt', newTag, (err) =>
          {
            if (err)
            {
              reject(err);
            }

            resolve("Update dict.txt ok");
          });
        }
        else
        {
          resolve("No need to update");
        }
      }
    });
  },
  updateDB: function(updateData)
  {
    return new Promise(async function(resolve, reject)
    {
      let newTag = {};

      for (let i = 0; i < updateData.length; i++)
      {
        newTag.name = updateData[i].tagName;

        if (updateData[i].inputTag)
        {
          newTag.type = updateData[i].inputTag;
          newTag.status = "Done";
        }
        else
        {
          newTag.type = "N";
          newTag.status = "Unused";
        }

        await updateTagStatus(newTag);
      }
      resolve("All tag status update ok");
    });
  },
  setSynonyms: function(param)
  {
    return new Promise(async function(resolve, reject)
    {
      let tagName = [param.parentTag, param.childTag];
      sql = `
        SELECT id FROM filtercount
        WHERE name IN (?)
        ORDER BY CASE
        WHEN name = ? THEN 1 END DESC;
      `;

      try
      {
        await updateSynonyms(param);

        resolve();
      }
      catch(error)
      {
        reject(error);
      }
    });
  }
}


function saveSegmentationResult(data)
{
  return new Promise(async function(resolve, reject)
  {
    mysql.con.getConnection(function(err, connection)
    {
      connection.beginTransaction(async function(error)
      {
        if (error)
        {
    			reject("Transaction Error: " + error);
    		}

        try
        {
          let checkResult = await promiseSql.query("SELECT * FROM tagverify WHERE name = ?", data.name);

          if (checkResult.length < 1)
          {
            await promiseSql.query("INSERT into tagverify SET ?", data);
            await promiseSql.commit(connection);
          }
          else
          {
            await promiseSql.query("UPDATE tagverify SET count = count + 1 WHERE name = ?", data.name);
            await promiseSql.commit(connection);
          }

          resolve();
        }
        catch(error)
        {
          mysql.con.rollback(function()
          {
            connection.release();

            reject("Database Segmentation Error: " + error);
          });
        }
      });
    });
  });
}

function updateTagStatus(newTag)
{
  return new Promise(async function(resolve, reject)
  {
    let sql = `UPDATE tagverify SET type = ?, status = ? WHERE name = ?;`;

    try
    {
      let data = await promiseSql.query(sql, [newTag.type, newTag.status, newTag.name]);

      resolve()
    }
    catch(error)
    {
      reject(error);
    }
  });
}

function updateSynonyms(param)
{
  return new Promise(async function(resolve, reject)
  {
    let getTagIdSql = `
      SELECT id FROM filtercount
      WHERE name IN (?)
      ORDER BY CASE
      WHEN name = ? THEN 1 END DESC;
    `;

    try
    {
      let result = await promiseSql.query(getTagIdSql, [[param.parentTag, param.childTag], param.parentTag]);

      if (result.length < 2)
      {
        resolve("One of tagName which you input dosen's in database");
      }
      else
      {
        let updateParentSql = `UPDATE filtercount SET parent_name = ?, parent_id = ? WHERE name = ?;`;

        await promiseSql.query(updateParentSql, [param.parentTag, result[0].id, param.childTag]);

        resolve("Set Synonyms Ok");
      }
    }
    catch(error)
    {
      reject(error);
    }
  });
}
