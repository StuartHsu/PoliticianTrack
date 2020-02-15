const express = require("express");
const bodyParser = require('body-parser');
const router = express.Router(); // create a router
const db = require('../model/crawler/savenews');
const news = require('../model/news');

router.post('/getNews', async function(req, res) {
  let data = req.body;
  let pol = req.body.pol;
  let issue = req.body.issue;
  let polCount = req.body.pol.length;
  let issueCount = req.body.issue.length;
  if(polCount === 0 && issueCount === 0) { // 無人物、無議題
    await news.getAll().then(async resp => {
      res.send({data: resp});
    }).catch(err => {
      res.status(400).send({error: err});
    });
  } else if(issueCount === 0 && polCount > 0) { // 有人物 (1 or 2)、無議題
    await news.getNoIssNews(pol).then(async resp => {
      res.send({data: resp});
    }).catch(err => {
      res.status(400).send({error: err});
    });
  } else if(issueCount > 0 && polCount === 0) { // 無人物、有議題
    await news.getNoPolNews(issue).then(async resp => {
      res.send({data: resp});
    }).catch(err => {
      res.status(400).send({error: err});
    });
  } else if(issueCount > 0 && polCount === 1) { // 一人物、有議題
    await news.getPolIssNews(pol, issue).then(async resp => {
      res.send({data: resp});
    }).catch(err => {
      res.status(400).send({error: err});
    });
  } else if(issueCount > 0 && polCount === 2)  { // compare
    await news.getCompare(pol, issue).then(async resp => {
      res.send({data: resp});
    }).catch(err => {
      res.status(400).send({error: err});
    });
  } else {
    res.send({data: "Nothing"});
  }
});


































module.exports = router;
