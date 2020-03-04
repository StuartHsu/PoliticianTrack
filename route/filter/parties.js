const express = require("express");
const router = express.Router(); // create a router
const bodyParser = require('body-parser');
const parties = require('../../model/filter/parties');

router.post('/', async function(req, res) {
  let party = req.body.party;
  let data = await parties.getPoliticians(party);
  res.send({data: data});
});


module.exports = router;
