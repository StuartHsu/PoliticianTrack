const express = require("express");
const router = express.Router(); // create a router
const bodyParser = require('body-parser');

const adminTag = require('../../model/admin/adminTag');
const tagFreq = require('../../model/admin/tagFreq');
const nlp = require('../../model/admin/nlp');
const newsGetTag = require('../../model/admin/newsGetTag');

// run segmentation
router.post('/api/seg', async function(req, res) {
  let period = {
    start: req.body.start.replace(/-/g, "/") + " 00:00",
    end:req.body.end.replace(/-/g, "/") + " 23:59"
  }
  let data = await adminTag.seg(period.start, period.end);
  res.send({data: data});
});

// get raw segmentation results
router.get('/api/list', async function(req, res) {
  let data = await adminTag.get();
  res.send({data: data});
});

// add or modify tag in dict
router.get('/api/updateDict', async function(req, res) {
  let data = await adminTag.updateDic();
  res.send({data: data});
});

// update tag status & tag type & add new tag in dict
router.post('/api/updateDB', async function(req, res) {
  let updateData = req.body
  let data = await adminTag.updateDB(updateData); // 更新 DB
  await adminTag.updateDic(updateData); // 更新 Dict
  res.send({data: data});
});

// NRP & NI 頻率統計
router.get('/api/tagfreq', async function(req, res) {
  let today = dateForm(new Date()); // YYYY/MM/DD
  let beginDay = startDayForm(today, 14);

  let period = {
    start: beginDay + " 00:00",
    end: today + " 23:59"
  }
  let data = await tagFreq.getPeriodCount(period.start, period.end);
  res.send(data);
});

// NRP & NI 頻率統計 ALL
router.get('/api/tagfreqall', async function(req, res) {
  let today = dateForm(new Date()) + " 23:59"; // YYYY/MM/DD

  // let period = {
  //   end: today + " 23:59"
  // }
  // let data = await tagFreq.getPeriodCountAll(today);
  let data = await tagFreq.getPeriodCountAll2(today);
  res.send(data);
});

// NLP training mode
router.post('/api/nlp/train', async function(req, res) {
  let period = {};
  let today = dateForm(new Date()); // YYYY/MM/DD
  if(req.body.start && req.body.end) {
    period.start = req.body.start.replace(/-/g, "/") + " 00:00";
    period.end = req.body.end.replace(/-/g, "/") + " 23:59";
  } else if(req.body.start) {
    period.start = req.body.start.replace(/-/g, "/") + " 00:00";
    period.end = today + " 23:59";
  } else {
    period.start = "";
    period.end = "";
  }
  let results = await nlp.train(period.start, period.end);
  res.send(results);
});

// NLP process mode, update news intent
router.post('/api/nlp/process', async function(req, res) {
  let period = {};
  let today = dateForm(new Date()); // YYYY/MM/DD
  if(req.body.start && req.body.end) {
    period.start = req.body.start.replace(/-/g, "/") + " 00:00";
    period.end = req.body.end.replace(/-/g, "/") + " 23:59";
  } else if(req.body.start) {
    period.start = req.body.start.replace(/-/g, "/") + " 00:00";
    period.end = today + " 23:59";
  } else {
    period.start = "";
    period.end = "";
  }
  let results = await nlp.process(period.start, period.end);
  res.send(results);
});

// NLP test mode
router.get('/api/nlp/test', async function(req, res) {
  let results = await nlp.test();
  res.send(results);
});

//  News get tag
router.get('/api/gettag', async function(req, res) {
  let results = await newsGetTag.getTag();
  res.send(results);
});





function dateForm(date) {
  var year = date.getFullYear();
  var month = date.getMonth() + 1;
  var day = date.getDate();

  month = month < 10 ? ('0' + month) : month;
  day = day < 10 ? ('0' + day) : day;

  return year + '/' + month + '/' + day;
}

function startDayForm(today, days) {
  today = new Date(today);
  var startDay = new Date(today.setDate(today.getDate() - days));

  return dateForm(startDay);
}





























module.exports = router;
