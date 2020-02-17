const express = require("express");
const router = express.Router(); // create a router
const db = require('../model/crawler/savenews');



// Get parties
router.get('/', async function(req, res) {
  res.send("hey");
  // let data = await politician.get();
  // res.send({data: data});
});




































module.exports = router;
