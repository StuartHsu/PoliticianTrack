const { NlpManager } = require('node-nlp');
const fs = require('fs');
const promiseSql = require("../../util/promiseSql.js");
const news = require('../../model/news');
const tagCount = require('../tagCount');

const manager = new NlpManager({ languages: ['zh'], nlu: { log: false } });

fs.readFile('../PolsTrackCrawler/util/nlp_trained_model/politician.json', async (err, data) =>
{
  if(err) throw err;

  const country = JSON.parse(data).country;
  const agency = JSON.parse(data).agency;
  const politicianInfos = await tagCount.get("politician");
  const politicianList = [];

  politicianInfos.forEach(politicianInfo =>
  {
    politicianList.push(politicianInfo.name);
  });

  manager.addNamedEntityText(
    'politician',
    '人物',
    ['zh'],
    politicianList
  );

  manager.addNamedEntityText(
    'country',
    '國家',
    ['zh'],
    country
  );

  manager.addNamedEntityText(
    'say',
    '表示',
    ['zh'],
    ["表示","認為","說","覺得","痛批","批","嗆","嗆爆","一句話","呼籲","表態","自爆","稱","聲稱","反稱","估","籲","呼籲","轟","砲轟","酸","酸爆","回"]
  );

  manager.addNamedEntityText(
    'agency',
    '機關',
    ['zh'],
    agency
  );

  manager.addNamedEntityText(
    'medical',
    '醫療',
    ['zh'],
    ['WHO']
  );

  manager.addDocument('zh', '%country%', 'country');
  manager.addDocument('zh', '%country%%say%', 'country_say');

  manager.addDocument('zh', '%politician%', 'politician');
  manager.addDocument('zh', '%politician%%say%', 'politician_say');

  manager.addDocument('zh', '%agency%', 'agency');
  manager.addDocument('zh', '%agency%%say%', 'agency_say');

  manager.addDocument('zh', '%say%', 'someone_say');
  manager.addDocument('zh', '%medical%：', 'issue_medical');


  manager.addAnswer('zh', 'politician', '政治人物');
  manager.addAnswer('zh', 'politician_say', '政治人物表示');

  manager.addAnswer('zh', 'agency', '機關');
  manager.addAnswer('zh', 'agency_say', '機關表示');

  manager.addAnswer('zh', 'country', '國家');
  manager.addAnswer('zh', 'country_say', '國家表示');

  manager.addAnswer('zh', 'someone_say', '某人表示');
  manager.addAnswer('zh', 'issue_medical', '醫療議題');
});


module.exports =
{
  train: async function(start, end)
  {
    return new Promise(async function(resolve, reject)
    {
      await manager.train();
      manager.save('../PolsTrackCrawler/util/nlp_trained_model/train.nlp');

      const data = await news.getPeriod(start, end);
      const totalCount = data.length;

      for (let i = 0; i < totalCount; i++)
      {
        console.log("Training：" + i + "/" + totalCount + ", news_id：" + data[i].id);
        const content = data[i].title.replace('：', '表示').replace(/[A-Za-z]+/, '');

        try
        {
          await manager.process('zh', content);
        }
        catch(error)
        {
          reject(error);
        }
      }

      console.log("處理完成");
      resolve("NLP training finished");
    });
  },
  process: async function(start, end)
  {
    return new Promise(async function(resolve, reject)
    {
      manager.load('../PolsTrackCrawler/util/nlp_trained_model/train.nlp');

      const data = await news.getPeriod(start, end);
      const totalCount = data.length;

      for (let i = 0; i < totalCount; i++)
      {
        console.log("Processing：" + i + "/" + totalCount + ", news_id：" + data[i].id);
        const content = data[i].title.replace('：', '表示').replace(/[A-Za-z]+/, '');
        const response = await manager.process('zh', content);
        const intent = response.nluAnswer.classifications[0].intent;
        const intent_score = response.nluAnswer.classifications[0].score;

        try
        {
          await updateIntens(intent, intent_score, data[i].id);
        }
        catch(error)
        {
          reject(error);
        }
      }

      console.log("處理完成");
      resolve("News intent update ok");
    });
  },
  test: async function()
  {
    return new Promise(async function(resolve, reject)
    {
      manager.load('../PolsTrackCrawler/util/nlp_trained_model/train.nlp');

      const content = '黨籍案引爭議  郝龍斌：支持傅崐萁回到黨內'.replace('：', '表示').replace(/[A-Za-z]+/, '');
      const response = await manager.process('zh', content);

      resolve (JSON.stringify(response));
    });
  }
}


function updateIntens(intent, intent_score, id)
{
  return new Promise(async function(resolve, reject)
  {
    try
    {
      await promiseSql.query("UPDATE news SET intent = ?, intent_score = ? WHERE id = ?;", [intent, intent_score, id]);

      resolve();
    }
    catch(error)
    {
      reject(error);
    }
  });
}
