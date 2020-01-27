const express = require("express");
const router = express.Router(); // create a router
const db = require('../model/crawler/savenews');
const news = require('../model/news');



// Get news
router.get('/test', async function(req, res) {
  await news.get('title', '韓國瑜').then(async resp => {
    res.send({data: resp});
  }).catch(err => {
    res.status(400).send({error: err});
  });
});







































module.exports = router;
