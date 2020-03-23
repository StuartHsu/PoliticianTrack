const promiseSql = require('../util/promiseSql.js');
const {getIntentNewsIds} = require('./intentModel.js');

module.exports = {
  get: async function(param, size, paging) {
    let tagId;
    let tagsNewsIds;
    let newsData;

    if (param.politician.length === 2 && param.issue.length === 1) { // compare
      const param1 = {politician: [param.politician[0]], issue: [param.issue[0]]};
      const param2 = {politician: [param.politician[1]], issue: [param.issue[0]]};
      const tag1Id = await getTagId(param1);
      const tag2Id = await getTagId(param2);
      const tag1NewsIds = await getTagNewsId(tag1Id);
      const tag2NewsIds = await getTagNewsId(tag2Id);
      newsData = await getCompareNews(tag1NewsIds, tag2NewsIds, size, paging, param, null);
    } else if (param.politician.length === 0 && param.issue.length === 0) { // All
      newsData = await getAllNews(size, paging);
    } else {
      tagId = await getTagId(param);
      tagsNewsIds = await getTagNewsId(tagId);
      newsData = await getNews(tagsNewsIds, size, paging);
    }

    return newsData;
  },
  getAccurate: async function(param, size, paging) {
    let tagId;
    let rawTagNewsIds;
    let tagsNewsIds;
    let newsData;

    if (param.politician.length === 2 && param.issue.length === 1) { // compare
      const param1 = {politician: [param.politician[0]], issue: [param.issue[0]]};
      const param2 = {politician: [param.politician[1]], issue: [param.issue[0]]};
      const tag1Id = await getTagId(param1);
      const tag2Id = await getTagId(param2);
      const rawTag1NewsIds = await getTagNewsId(tag1Id);
      const rawTag2NewsIds = await getTagNewsId(tag2Id);
      const tag1NewsIds = await getIntentNewsIds(param, rawTag1NewsIds);
      const tag2NewsIds = await getIntentNewsIds(param, rawTag2NewsIds);
      newsData = await getCompareNews(tag1NewsIds, tag2NewsIds, size, paging, param, 'accurate');
    } else if (param.politician.length === 0 && param.issue.length === 0) { // All
      const intentNewsIds = await getIntentNewsIds(param);
      newsData = await getAllNews(size, paging, intentNewsIds);
    } else {
      tagId = await getTagId(param);
      rawTagNewsIds = await getTagNewsId(tagId);
      tagsNewsIds = await getIntentNewsIds(param, rawTagNewsIds);
      newsData = await getNews(tagsNewsIds, size, paging);
    }

    return newsData;
  },
  getPeriod: async function(start, end) { // Admin NLP use
    let sql;

    if (!start && !end) {
      sql = `SELECT * FROM news WHERE intent = '';`;
    } else {
      sql = 'SELECT * FROM news WHERE pubTime > ? AND pubTime < ?';
    }

    try {
      const data = await promiseSql.query(sql, [start, end]);

      return data;
    } catch (error) {
      return error;
    }
  }
};


// get News route
async function getAllNews(size, paging, intentNewsIds) {
  let newsQuantity;
  let filter;
  let dataSet = [];
  const body = {};
  const offset = paging * size;

  try {
    if (intentNewsIds) {
      newsQuantity = await getNewsQuantity(intentNewsIds, 'accurate');
      filter = ` id IN (?)`;
      dataSet = [intentNewsIds, offset, size];
    } else {
      newsQuantity = await getNewsQuantity();
      filter = ` intent = 'politician_say'`;
      dataSet = [offset, size];
    }

    const maxPage = Math.floor((newsQuantity - 1) / size);

    if (paging < maxPage) {
      body.next_paging = paging + 1;
    }

    const sql = `SELECT * FROM news WHERE`;
    const data = await promiseSql.query(sql + filter + ` ORDER BY pubTime DESC LIMIT ?,?;`, dataSet);
    const news = await formNews(data); // 新聞加上所含標籤
    body.news = news;

    return body;
  } catch (error) {
    return error;
  }
}

async function getNews(tagNewsIds, size, paging, mode) {
  let filter;
  const body = {};
  const offset = paging * size;

  try {
    const newsQuantity = await getNewsQuantity(tagNewsIds);

    if (newsQuantity === 0) {
      body.news = [];

      return body;
    } else {
      const maxPage = Math.floor((newsQuantity - 1) / size);

      if (paging < maxPage) {
        body.next_paging = paging + 1;
      }
    }

    if (mode === 'accurate') {
      filter = ` AND intent = 'politician_say'`;
    } else {
      filter = '';
    }

    const sql = `SELECT * FROM news WHERE id IN (?)`;
    const data = await promiseSql.query(sql + filter + ` ORDER BY pubTime DESC LIMIT ?,?;`, [tagNewsIds, offset, size]);
    const news = await formNews(data); // 新聞加上所含標籤
    body.news = news;

    return body;
  } catch (error) {
    return error;
  }
}

async function getCompareNews(tag1NewsIds, tag2NewsIds, size, paging, param, mode) {
  const body = {
    id1Count: 0,
    id2Count: 0
  };
  const offset = paging * size;
  const tagsNewsIds = tag1NewsIds.concat(tag2NewsIds);

  try {
    const newsQuantity = await getNewsQuantity(tagsNewsIds);

    if (newsQuantity === 0) {
      body.news = [];

      return body;
    } else {
      const maxPage = Math.floor((newsQuantity - 1) / size);

      if (paging < maxPage) {
        body.next_paging = paging + 1;
      }
    }

    body.id1Count = await getNewsQuantity(tag1NewsIds, mode);
    body.id2Count = await getNewsQuantity(tag2NewsIds, mode);

    if (mode === 'accurate') {
      filter = '';
    } else {
      filter = ` AND intent = 'politician_say'`;
    }

    const sql = `SELECT * FROM news WHERE id IN (?)`;
    const data = await promiseSql.query(sql + filter + ` ORDER BY pubTime DESC LIMIT ?,?;`, [tagsNewsIds, offset, size]);
    const news = await formNews(data); // 新聞加上所含標籤

    for (let i = 0; i < news.length; i++) {
      if (tag1NewsIds.indexOf(news[i].id) > -1 && tag2NewsIds.indexOf(news[i].id) > -1) {
        news[i].tag_id = 'both';
      } else if (tag1NewsIds.indexOf(news[i].id) > -1 && tag2NewsIds.indexOf(news[i].id) < 0) {
        news[i].tag_id = param.politician[0];
      } else if (tag1NewsIds.indexOf(news[i].id) < 0 && tag2NewsIds.indexOf(news[i].id) > -1) {
        news[i].tag_id = param.politician[1];
      } else {
        console.log('none');
      }
    }
    body.news = news;

    return body;
  } catch (error) {
    return error;
  }
}


// toolkit
async function getNewsQuantity(newsIds, mode) {
  let filter;

  if (!newsIds) {
    filter = ` intent = 'politician_say';`;
  } else if (newsIds.length === 0) {
    return 0;
  } else {
    filter = ` id IN (?) AND intent = 'politician_say';`;
  }

  if (mode === 'accurate') {
    filter = ' id IN (?);';
  }

  try {
    const sql = `SELECT count(*) AS total FROM news WHERE`;
    const data = await promiseSql.query(sql+filter, [newsIds]);

    return data[0].total;
  } catch (error) {
    return error;
  }
}

async function formNews(news) {
  const data = [];
  let newsData = {};

  try {
    for (let i = 0; i < news.length; i++) {
      const tagsRaw = await getTags(news[i].id);
      const tagsData = [];

      for (let j = 0; j < tagsRaw.length; j++) {
        const body = {
          tagName: tagsRaw[j].name,
          tagType: tagsRaw[j].type
        };
        tagsData.push(body);
      }

      newsData = {
        id: news[i].id,
        title: news[i].title,
        description: news[i].description,
        content: news[i].content,
        href: news[i].href,
        pubTime: news[i].pubTime,
        publisher: news[i].publisher,
        tag: tagsData
      };
      data.push(newsData);
    }

    return data;
  } catch (error) {
    return error;
  }
}

// 取得人物、議題 tag_id
async function getTagId(param) {
  const tagNameArr = [];

  if (param.politician.length > 0) {
    for (let h = 0; h < param.politician.length; h++) {
      tagNameArr.push(param.politician[h]);
    }
  }

  if (param.issue.length > 0) {
    tagNameArr.push(param.issue[0]);
  }

  const data = [];
  const sql = `SELECT id FROM filtercount WHERE name IN (?);`;

  if (tagNameArr.length > 0) { // 人 or 題至少有其一
    try {
      const results = await promiseSql.query(sql, [tagNameArr]);

      for (let i = 0; i < results.length; i++) {
        data.push(results[i].id);
      }

      return data;
    } catch (error) {
      return error;
    }
  } else { // 無人、題
    return data;
  }
}

// 取得 tag_id 對應之 news_id
async function getTagNewsId(tagId) {
  let sql;

  if (tagId.length < 2) { // 單人
    sql = `SELECT news_id FROM newstag WHERE tag_id IN (?);`;
  } else { // 人與議題
    sql = `
      SELECT a.news_id, b.title
      FROM newstag AS a
      LEFT JOIN news as b ON (a.news_id = b.id)
      WHERE tag_id IN (?)
      GROUP BY news_id HAVING count(*) > 1;
    `;
  }

  const data = [];

  if (tagId.length > 0) { // 人 or 題至少有其一
    try {
      const results = await promiseSql.query(sql, [tagId]);

      for (let i = 0; i < results.length; i++) {
        data.push(results[i].news_id);
      }

      return data;
    } catch (error) {
      return error;
    }
  } else { // 無人、題
    return data;
  }
}

async function getTags(newsId) {
  const sql = `
    SELECT a.news_id, a.tag_id, b.name, b.type
    FROM newstag AS a
    LEFT JOIN filtercount AS b ON (a.tag_id = b.id)
    WHERE a.news_id = ?;
  `;

  try {
    const data = await promiseSql.query(sql, newsId);

    return data;
  } catch (error) {
    return error;
  }
}
