const promiseSql = require("../../util/promiseSql.js");
const nodejieba = require('nodejieba');

nodejieba.load({userDict: '../PolsTrackCrawler/util/dict.txt'});

module.exports =
{
  getTag: function()
  {
    return new Promise(async function(resolve, reject)
    {
      try
      {
        let news = await promiseSql.query("SELECT id, content FROM news;", null);
        let totalCount = news.length;

        for (let j = 0; j < totalCount; j++)
        {
          console.log("處理中：" + j + "/" + totalCount + ", news_id：" + news[j].id);
          let jieba = nodejieba.tag(news[j].content);

          for (let i = 0; i < jieba.length; i++)
          {
            if (jieba[i].tag === "NRP" || jieba[i].tag === "NI")
            {
              let tagId = await getTagId(jieba[i].word);
              let data =
              {
                news_id: news[j].id,
                tag_id: tagId
              }
              let checkResult = await checkNewsId(data);

              await saveTagInfo(data, checkResult);
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


function getTagId(tagName)
{
  return new Promise(async function(resolve, reject)
  {
    try
    {
      let data = await promiseSql.query("SELECT parent_id FROM filtercount WHERE name = ?", tagName);

      if (data.length > 0)
      {
        resolve(data[0].parent_id);
      }
      else
      {
        resolve();
      }
    }
    catch(error)
    {
      reject(error);
    }
  });
}

function checkNewsId(data)
{
  return new Promise(async function(resolve, reject)
  {
    try
    {
      let results = await promiseSql.query("SELECT * FROM newstag WHERE news_id = ? AND tag_id = ?;", [data.news_id, data.tag_id]);

      resolve(results);
    }
    catch(error)
    {
      reject(error);
    }
  });
}

function saveTagInfo(data, checkResult)
{
  return new Promise(async function(resolve, reject)
  {
    try
    {
      if (checkResult.length < 1)
      {
        await promiseSql.query("INSERT newstag SET ?;", [data]);

        resolve("Insert Ok");
      }
      else
      {
        await promiseSql.query("UPDATE newstag SET ? WHERE news_id = ? AND tag_id = ?;", [data, data.news_id, data.tag_id]);

        resolve("Update ok");
      }
    }
    catch(error)
    {
      reject(error);
    }
  });
}
