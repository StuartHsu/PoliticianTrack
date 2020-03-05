const promiseSql = require("../util/promiseSql.js");
const { getIntentNewsIds } = require("./intentModel.js");

module.exports =
{
  get: function(param, size, paging)
  {
    return new Promise(async function(resolve, reject)
    {
      let sql;
      let tagId;
      let tagsNewsIds;
      let newsData;

      if (param.politician.length === 2 && param.issue.length === 1) // compare
      {
        let param1 = {politician: [param.politician[0]], issue: [param.issue[0]]};
        let param2 = {politician: [param.politician[1]], issue: [param.issue[0]]};
        let tag1Id = await getTagId(param1);
        let tag2Id = await getTagId(param2);
        let tag1NewsIds = await getTagNewsId(tag1Id);
        let tag2NewsIds = await getTagNewsId(tag2Id);
        newsData = await getCompareNews(tag1NewsIds, tag2NewsIds, size, paging, param, null);
      }
      else if (param.politician.length === 0 && param.issue.length === 0) // All
      {
        newsData = await getAllNews(size, paging);
      }
      else
      {
        tagId = await getTagId(param);
        tagsNewsIds = await getTagNewsId(tagId);
        newsData = await getNews(tagsNewsIds, size, paging);
      }

      resolve(newsData);
    });
  },
  getAccurate: function(param, size, paging)
  {
    return new Promise(async function(resolve, reject)
    {
      let sql;
      let tagId;
      let rawTagNewsIds;
      let tagsNewsIds;
      let newsData;

      if (param.politician.length === 2 && param.issue.length === 1) // compare
      {
        let param1 = {politician: [param.politician[0]], issue: [param.issue[0]]};
        let param2 = {politician: [param.politician[1]], issue: [param.issue[0]]};
        let tag1Id = await getTagId(param1);
        let tag2Id = await getTagId(param2);
        let rawTag1NewsIds = await getTagNewsId(tag1Id);
        let rawTag2NewsIds = await getTagNewsId(tag2Id);
        let tag1NewsIds = await getIntentNewsIds(param, rawTag1NewsIds);
        let tag2NewsIds = await getIntentNewsIds(param, rawTag2NewsIds);
        newsData = await getCompareNews(tag1NewsIds, tag2NewsIds, size, paging, param, "accurate");
      }
      else if (param.politician.length === 0 && param.issue.length === 0) // All
      {
        let intentNewsIds = await getIntentNewsIds(param);
        newsData = await getAllNews(size, paging, intentNewsIds);
      }
      else
      {
        tagId = await getTagId(param);
        rawTagNewsIds = await getTagNewsId(tagId);
        tagsNewsIds = await getIntentNewsIds(param, rawTagNewsIds);
        newsData = await getNews(tagsNewsIds, size, paging);
      }

      resolve(newsData);
    });
  },
  getPeriod: function(start, end) // Admin NLP use
  {
    return new Promise(async function(resolve, reject)
    {
      let sql;

      if (!start && !end)
      {
        sql = `SELECT * FROM news WHERE intent = "";`
      }
      else
      {
        sql = 'SELECT * FROM news WHERE pubTime > ? AND pubTime < ?';
      }

      try
      {
        let data = await promiseSql.query(sql, [start, end]);

        resolve(data);
      }
      catch(error)
      {
        reject(error);
      }
    });
  }
}


// get News route
function getAllNews(size, paging, intentNewsIds)
{
  return new Promise(async function(resolve, reject)
  {
    let newsQuantity;
    let filter;
    let dataSet = [];
    let body = {};
    let offset = paging * size;

    try
    {
      if(intentNewsIds)
      {
        newsQuantity = await getNewsQuantity(intentNewsIds, "accurate");
        filter = ` id IN (?)`;
        dataSet = [intentNewsIds, offset, size]
      }
      else
      {
        newsQuantity = await getNewsQuantity();
        filter = ` intent = "politician_say"`;
        dataSet = [offset, size]
      }

      let maxPage = Math.floor((newsQuantity - 1) / size);

      if(paging < maxPage)
      {
        body.next_paging = paging + 1;
      }

      let sql = `SELECT * FROM news WHERE`;
      let data = await promiseSql.query(sql + filter + ` ORDER BY pubTime DESC LIMIT ?,?;`, dataSet);
      let news = await formNews(data); // 新聞加上所含標籤
      body.news = news;

      resolve(body);
    }
    catch(error)
    {
      reject(error);
    }
  });
}

function getNews(tagNewsIds, size, paging, mode)
{
  return new Promise(async function(resolve, reject)
  {
    let filter;
    let body = {};
    let offset = paging * size;

    try
    {
      let newsQuantity = await getNewsQuantity(tagNewsIds);

      if (newsQuantity === 0)
      {
        body.news = [];

        resolve(body);
      }
      else
      {
        let maxPage = Math.floor((newsQuantity - 1) / size);

        if (paging < maxPage)
        {
          body.next_paging = paging + 1;
        }
      }

      if (mode === "accurate")
      {
        filter = ` AND intent = "politician_say"`;
      }
      else
      {
        filter = "";
      }

      let sql = `SELECT * FROM news WHERE id IN (?)`;
      let data = await promiseSql.query(sql + filter + ` ORDER BY pubTime DESC LIMIT ?,?;`, [tagNewsIds, offset, size]);
      let news = await formNews(data);　// 新聞加上所含標籤
      body.news = news;

      resolve(body);
    }
    catch(error)
    {
      reject(error);
    }

  });
}

function getCompareNews(tag1NewsIds, tag2NewsIds, size, paging, param, mode)
{
  return new Promise(async function(resolve, reject)
  {
    let body =
    {
      id1Count: 0,
      id2Count: 0
    }
    let offset = paging * size;
    let tagsNewsIds = tag1NewsIds.concat(tag2NewsIds);

    try
    {
      let newsQuantity = await getNewsQuantity(tagsNewsIds);

      if (newsQuantity === 0)
      {
        body.news = [];

        resolve(body);
      }
      else
      {
        let maxPage = Math.floor((newsQuantity - 1) / size);

        if (paging < maxPage)
        {
          body.next_paging = paging + 1;
        }
      }

      body.id1Count = await getNewsQuantity(tag1NewsIds, mode);
      body.id2Count = await getNewsQuantity(tag2NewsIds, mode);

      if (mode === "accurate")
      {
        filter = "";
      }
      else
      {
        filter = ` AND intent = "politician_say"`;
      }

      let sql = `SELECT * FROM news WHERE id IN (?)`;
      let data = await promiseSql.query(sql + filter + ` ORDER BY pubTime DESC LIMIT ?,?;`, [tagsNewsIds, offset, size]);
      let news = await formNews(data);　// 新聞加上所含標籤

      for (let i = 0; i < news.length; i++)
      {
        if (tag1NewsIds.indexOf(news[i].id) > -1 && tag2NewsIds.indexOf(news[i].id) > -1)
        {
          news[i].tag_id = "both";
        }
        else if (tag1NewsIds.indexOf(news[i].id) > -1 && tag2NewsIds.indexOf(news[i].id) < 0)
        {
          news[i].tag_id = param.politician[0];
        }
        else if (tag1NewsIds.indexOf(news[i].id) < 0 && tag2NewsIds.indexOf(news[i].id) > -1)
        {
          news[i].tag_id = param.politician[1];
        }
        else
        {
          console.log("none");
        }
      }
      body.news = news;

      resolve(body);
    }
    catch(error)
    {
      reject(error);
    }
  });
}


// toolkit
function getNewsQuantity(newsIds, mode)
{
  return new Promise(async function(resolve, reject)
  {
    let filter;

    if(!newsIds)
    {
      filter = ` intent = "politician_say";`;
    }
    else if (newsIds.length === 0)
    {
      resolve(0);
    }
    else
    {
      filter = ` id IN (?) AND intent = "politician_say";`;
    }

    if (mode === "accurate")
    {
      filter = " id IN (?);";
    }

    try
    {
      let sql = `SELECT count(*) AS total FROM news WHERE`;
      let data = await promiseSql.query(sql+filter, [newsIds]);

      resolve(data[0].total);
    }
    catch(error)
    {
      reject(error);
    }
  });
}

function formNews(news)
{
  return new Promise(async function(resolve, reject)
  {
    let data = [];
    let newsData = {};

    try
    {
      for (let i = 0; i < news.length; i++)
      {
        let tagsRaw = await getTags(news[i].id);
        let tagsData = [];

        for (let j = 0; j < tagsRaw.length; j++)
        {
          let body =
          {
            tagName: tagsRaw[j].name,
            tagType: tagsRaw[j].type
          }
          tagsData.push(body);
        }

        newsData =
        {
          id: news[i].id,
          title: news[i].title,
          description: news[i].description,
          content: news[i].content,
          href: news[i].href,
          pubTime: news[i].pubTime,
          publisher: news[i].publisher,
          tag: tagsData
        }
        data.push(newsData);
      }

      resolve(data);
    }
    catch(error)
    {
      reject(error);
    }
  });
}



// 取得人物、議題 tag_id
function getTagId(param)
{
  return new Promise(async function(resolve, reject)
  {
    let tagNameArr = [];

    if (param.politician.length > 0)
    {
      for (let h = 0; h < param.politician.length; h++)
      {
        tagNameArr.push(param.politician[h]);
      }
    }

    if (param.issue.length > 0)
    {
      tagNameArr.push(param.issue[0]);
    }

    let data = [];
    let sql = `SELECT id FROM filtercount WHERE name IN (?);`;

    if(tagNameArr.length > 0) // 人 or 題至少有其一
    {
      try
      {
        let results = await promiseSql.query(sql, [tagNameArr]);

        for (let i = 0; i < results.length; i++)
        {
          data.push(results[i].id);
        }

        resolve(data);
      }
      catch(error)
      {
        reject(error);
      }
    }
    else // 無人、題
    {
      resolve(data);
    }
  });
}

// 取得 tag_id 對應之 news_id
function getTagNewsId(tagId)
{
  return new Promise(async function(resolve, reject)
  {
    let sql;

    if(tagId.length < 2) // 單人
    {
      sql = `SELECT news_id FROM newstag WHERE tag_id IN (?);`;
    }
    else // 人與議題
    {
      sql = `
        SELECT a.news_id, b.title
        FROM newstag AS a
        LEFT JOIN news as b ON (a.news_id = b.id)
        WHERE tag_id IN (?)
        GROUP BY news_id HAVING count(*) > 1;
      `;
    }

    let data = [];

    if (tagId.length > 0) // 人 or 題至少有其一
    {
      try
      {
        let results = await promiseSql.query(sql, [tagId]);

        for (let i = 0; i < results.length; i++)
        {
          data.push(results[i].news_id);
        }

        resolve(data);
      }
      catch(error)
      {
        reject(error);
      }
    }
    else // 無人、題
    {
      resolve(data);
    }
  });
}

function getTags(news_id)
{
  return new Promise(async function(resolve, reject)
  {
    let sql = `
      SELECT a.news_id, a.tag_id, b.name, b.type
      FROM newstag AS a
      LEFT JOIN filtercount AS b ON (a.tag_id = b.id)
      WHERE a.news_id = ?;
    `;

    try
    {
      let data = await promiseSql.query(sql, news_id);

      resolve(data);
    }
    catch(error)
    {
      reject(error);
    }
  });
}
