const express = require("express");
const router = express.Router(); // create a router
const bodyParser = require('body-parser');
const issues = require('../../model/filter/issues');

router.post('/', async function(req, res)
{
  const param = req.body;
  const data = await issues.get(param);

  res.send(data);
});


module.exports = router;
