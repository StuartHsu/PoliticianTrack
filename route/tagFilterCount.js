const express = require("express");
const router = express.Router(); // create a router
const db = require('../model/crawler/savenews');
const tagFilterCount = require('../model/tagFilterCount');



// Get politician
router.get('/', async function(req, res) {
  let data = await tagFilterCount.get();
  res.send({data: data});
});




































module.exports = router;
