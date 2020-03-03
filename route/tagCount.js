const express = require("express");
const router = express.Router(); // create a router
const db = require('../model/crawler/savenews');
const filterTagCount = require('../model/filterTagCount');



// Get politician
router.get('/', async function(req, res) {
  let data = await filterTagCount.get();
  res.send({data: data});
});




































module.exports = router;
