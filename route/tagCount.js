const express = require("express");
const router = express.Router(); // create a router
const tagCount = require('../model/tagCount');


router.get('/', async function(req, res)
{
  let data = await tagCount.get();

  res.send({data: data});
});


module.exports = router;
