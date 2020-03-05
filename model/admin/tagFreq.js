const mysql = require("../../util/mysqlcon.js");
const promiseSql = require("../../util/promiseSql.js");
const nodejieba = require('nodejieba');

nodejieba.load({userDict: '../PolsTrackCrawler/util/dict.txt'});

module.exports =
{
  getTagPeriodCount: function(start, end)
  {
    return new Promise(async function(resolve, reject)
    {
      let sql;
      let timeSet;

      try
      {
        await clearCount();

        if (start)
        {
          sql = "SELECT content FROM news WHERE pubTime > ? AND pubTime < ?;";
          timeSet = [start, end];
        }
        else
        {
          sql = "SELECT content FROM news WHERE pubTime < ?;";
          timeSet = [end];
        }

        let result = await promiseSql.query(sql, timeSet);
        let totalCount = result.length;

        for (let i = 0; i < totalCount; i++)
        {
          console.log("處理中：" + i + "/" + totalCount);
          let jieba = nodejieba.tag(result[i].content);
          let jiebaTotalCount = jieba.length;

          for (let j = 0; j < jiebaTotalCount; j++)
          {
            if (jieba[j].tag === "NRP" || jieba[j].tag === "NI")
            {
              let data =
              {
                name: jieba[j].word,
                type: jieba[j].tag,
                count: 1,
                parent_name: jieba[j].word,
                parent_id: 0
              }

              await updateTagCount(data);
            }
          }
        }

        console.log("處理完成");
        resolve("All tags update!");
      }
      catch(error)
      {
        reject(error);
      }
    });
  }
}


function updateTagCount(data)
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
          let checkResult = await promiseSql.query("SELECT * FROM filtercount WHERE name = ?;", data.name);

          if (checkResult.length < 1)
          {
            let insertSql = "INSERT INTO filtercount SET ?;";
            let updateParentIdSql = "UPDATE filtercount SET parent_id = id WHERE name = ?;";

            await promiseSql.query(insertSql, data);
            await promiseSql.query(updateParentIdSql, data.name);
            await promiseSql.commit(connection);

            resolve();
          }
          else
          {
            let updateCountSql = "UPDATE filtercount SET count = count + 1 WHERE name = ?;";

            await promiseSql.query(updateCountSql, data.name);
            await promiseSql.commit(connection);

            resolve();
          }
        }
        catch(error)
        {
          mysql.con.rollback(function()
          {
            connection.release();

            reject("Database TagCount Error: " + error);
          });
        }
      });
    });
  });
}

function clearCount()
{
  return new Promise(async function(resolve, reject)
  {
    let sql = 'UPDATE filtercount SET count = 0;';

    try
    {
      await promiseSql.query(sql, null);

      resolve();
    }
    catch(error)
    {
      reject(error);
    }
  });
}
