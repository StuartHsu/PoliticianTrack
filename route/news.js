const express = require("express");
const bodyParser = require('body-parser');
const router = express.Router(); // create a router
const db = require('../model/crawler/savenews');
const news = require('../model/news');



// Get news
router.get('/test', async function(req, res) {
  let name = req.query.name;
  let issueName = req.query.issue;
  await news.get('title', name, 'content', issueName).then(async resp => {
    res.send({data: resp});
  }).catch(err => {
    res.status(400).send({error: err});
  });
});

router.get('/listtag', async function(req, res) {
  let name = req.query.name;
  let issueName = req.query.issue;
  await news.listTag('title', name, 'content', issueName).then(async resp => {
    res.send({data: resp});
  }).catch(err => {
    res.status(400).send({error: err});
  });
});







































module.exports = router;
