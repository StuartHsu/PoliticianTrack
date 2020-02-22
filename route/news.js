const express = require("express");
const bodyParser = require('body-parser');
const router = express.Router(); // create a router
const db = require('../model/crawler/savenews');
const news = require('../model/news');

router.post('/getNews', async function(req, res) {
  let data = req.body;
  let paging = parseInt(req.query.paging);
	if(!Number.isInteger(paging)){
		paging = 0;
	}
	let size = 10;
  await news.get(data, size, paging).then(async resp => {
    res.send({data: resp});
  }).catch(err => {
    res.status(400).send({error: err});
  });
});

router.post('/getNews/strict', async function(req, res) {
  let data = req.body;
  let paging = parseInt(req.query.paging);
	if(!Number.isInteger(paging)){
		paging = 0;
	}
	let size = 10;
  await news.getStrict(data, size, paging).then(async resp => {
    res.send({data: resp});
  }).catch(err => {
    res.status(400).send({error: err});
  });
});





















module.exports = router;
