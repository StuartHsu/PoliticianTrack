const express = require('express');
// eslint-disable-next-line
const router = express.Router();

const adminTag = require('../../model/admin/adminTag');
const tagFreq = require('../../model/admin/tagFreq');
const nlp = require('../../model/admin/nlp');
const newsGetTag = require('../../model/admin/newsGetTag');

// 1. 執行新聞斷詞
router.post('/segmentation', async function(req, res) {
  const period = {
    start: req.body.start.replace(/-/g, '/') + ' 00:00',
    end: req.body.end.replace(/-/g, '/') + ' 23:59'
  };
  const data = await adminTag.segmentation(period.start, period.end);

  res.send({data: data});
});

// 2. 撈出未處理標籤
router.get('/getPendingTags', async function(req, res) {
  const data = await adminTag.getPendingTags();

  res.send({data: data});
});

// add or modify tag in dict
router.get('/updateDict', async function(req, res) {
  const data = await adminTag.updateDic();

  res.send({data: data});
});

// 3. 更新標籤 & 字典
router.post('/updateDB', async function(req, res) {
  const updateData = req.body;
  const data = await adminTag.updateDB(updateData); // 更新 DB

  await adminTag.updateDic(updateData); // 更新 Dict

  res.send({data: data});
});

// 4-1. Tag count refresh (DB: filterCount)
router.get('/tagfreq', async function(req, res) {
  const today = dateForm(new Date()); // YYYY/MM/DD
  const beginDay = startDayForm(today, 14);
  const period = {
    start: beginDay + ' 00:00',
    end: today + ' 23:59'
  };
  const data = await tagFreq.getTagPeriodCount(period.start, period.end);

  res.send(data);
});

// 4-2. Tag count refresh (DB: filterCount) All
router.get('/tagfreqall', async function(req, res) {
  const today = dateForm(new Date()) + ' 23:59'; // YYYY/MM/DD
  const data = await tagFreq.getTagPeriodCount(null, today);

  res.send(data);
});

// 5. NLP training
router.post('/nlp/train', async function(req, res) {
  const period = {};
  const today = dateForm(new Date()); // YYYY/MM/DD

  if (req.body.start && req.body.end) {
    period.start = req.body.start.replace(/-/g, '/') + ' 00:00';
    period.end = req.body.end.replace(/-/g, '/') + ' 23:59';
  } else if (req.body.start) {
    period.start = req.body.start.replace(/-/g, '/') + ' 00:00';
    period.end = today + ' 23:59';
  } else {
    period.start = '';
    period.end = '';
  }

  const results = await nlp.train(period.start, period.end);

  res.send(results);
});

// 6. NLP process
router.post('/nlp/process', async function(req, res) {
  const period = {};
  const today = dateForm(new Date()); // YYYY/MM/DD

  if (req.body.start && req.body.end) {
    period.start = req.body.start.replace(/-/g, '/') + ' 00:00';
    period.end = req.body.end.replace(/-/g, '/') + ' 23:59';
  } else if (req.body.start) {
    period.start = req.body.start.replace(/-/g, '/') + ' 00:00';
    period.end = today + ' 23:59';
  } else {
    period.start = '';
    period.end = '';
  }

  const results = await nlp.process(period.start, period.end);

  res.send(results);
});

// NLP test mode
router.get('/nlp/test', async function(req, res) {
  const results = await nlp.test();

  res.send(results);
});

// 7. News get tag
router.get('/gettag', async function(req, res) {
  const results = await newsGetTag.getTag();

  res.send(results);
});

// x-2. Set synonyms
router.post('/synonyms', async function(req, res) {
  const param = req.body;
  const results = await adminTag.setSynonyms(param);

  res.send(results);
});

function dateForm(date) {
  const year = date.getFullYear();
  let month = date.getMonth() + 1;
  let day = date.getDate();
  month = month < 10 ? ('0' + month) : month;
  day = day < 10 ? ('0' + day) : day;

  return year + '/' + month + '/' + day;
}

function startDayForm(today, days) {
  today = new Date(today);
  const startDay = new Date(today.setDate(today.getDate() - days));

  return dateForm(startDay);
}


module.exports = router;
