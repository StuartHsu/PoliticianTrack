const express = require("express");
const router = express.Router(); // create a router
const bodyParser = require('body-parser');
const parties = require('../../model/filter/parties');

router.post('/', async function(req, res)
{
  const party = req.body.party;
  const data = await parties.getPoliticians(party);

  res.send({data: data});
});


module.exports = router;
