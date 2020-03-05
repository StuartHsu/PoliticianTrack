const express = require("express");
const router = express.Router(); // create a router
const bodyParser = require('body-parser');

const adminTag = require('../../model/admin/adminTag');
const tagFreq = require('../../model/admin/tagFreq');
const nlp = require('../../model/admin/nlp');
const newsGetTag = require('../../model/admin/newsGetTag');

// 1. 執行新聞斷詞
router.post('/seg', async function(req, res)
{
  let period =
  {
    start: req.body.start.replace(/-/g, "/") + " 00:00",
    end:req.body.end.replace(/-/g, "/") + " 23:59"
  }
  let data = await adminTag.seg(period.start, period.end);

  res.send({data: data});
});

// 2. 撈出未處理標籤
router.get('/list', async function(req, res)
{
  let data = await adminTag.get();

  res.send({data: data});
});

// add or modify tag in dict
router.get('/updateDict', async function(req, res)
{
  let data = await adminTag.updateDic();

  res.send({data: data});
});

// 3. 更新標籤 & 字典
router.post('/updateDB', async function(req, res)
{
  let updateData = req.body
  let data = await adminTag.updateDB(updateData); // 更新 DB

  await adminTag.updateDic(updateData); // 更新 Dict

  res.send({data: data});
});

// 4-1. Tag count refresh (DB: filterCount)
router.get('/tagfreq', async function(req, res)
{
  let today = dateForm(new Date()); // YYYY/MM/DD
  let beginDay = startDayForm(today, 14);
  let period =
  {
    start: beginDay + " 00:00",
    end: today + " 23:59"
  }
  let data = await tagFreq.getTagPeriodCount(period.start, period.end);

  res.send(data);
});

// 4-2. Tag count refresh (DB: filterCount) All
router.get('/tagfreqall', async function(req, res)
{
  let today = dateForm(new Date()) + " 23:59"; // YYYY/MM/DD
  let data = await tagFreq.getTagPeriodCount(null, today);

  res.send(data);
});

// 5. NLP training
router.post('/nlp/train', async function(req, res)
{
  let period = {};
  let today = dateForm(new Date()); // YYYY/MM/DD

  if (req.body.start && req.body.end)
  {
    period.start = req.body.start.replace(/-/g, "/") + " 00:00";
    period.end = req.body.end.replace(/-/g, "/") + " 23:59";
  }
  else if (req.body.start)
  {
    period.start = req.body.start.replace(/-/g, "/") + " 00:00";
    period.end = today + " 23:59";
  }
  else
  {
    period.start = "";
    period.end = "";
  }

  let results = await nlp.train(period.start, period.end);

  res.send(results);
});

// 6. NLP process
router.post('/nlp/process', async function(req, res)
{
  let period = {};
  let today = dateForm(new Date()); // YYYY/MM/DD

  if (req.body.start && req.body.end)
  {
    period.start = req.body.start.replace(/-/g, "/") + " 00:00";
    period.end = req.body.end.replace(/-/g, "/") + " 23:59";
  }
  else if (req.body.start)
  {
    period.start = req.body.start.replace(/-/g, "/") + " 00:00";
    period.end = today + " 23:59";
  }
  else
  {
    period.start = "";
    period.end = "";
  }

  let results = await nlp.process(period.start, period.end);

  res.send(results);
});

// NLP test mode
router.get('/nlp/test', async function(req, res)
{
  let results = await nlp.test();

  res.send(results);
});

// 7. News get tag
router.get('/gettag', async function(req, res)
{
  let results = await newsGetTag.getTag();

  res.send(results);
});

// x-2. Set synonyms
router.post('/synonyms', async function(req, res)
{
  let param = req.body;
  let results = await adminTag.setSynonyms(param);

  res.send(results);
});

function dateForm(date)
{
  let year = date.getFullYear();
  let month = date.getMonth() + 1;
  let day = date.getDate();
  month = month < 10 ? ('0' + month) : month;
  day = day < 10 ? ('0' + day) : day;

  return year + '/' + month + '/' + day;
}

function startDayForm(today, days)
{
  today = new Date(today);
  let startDay = new Date(today.setDate(today.getDate() - days));

  return dateForm(startDay);
}


module.exports = router;
