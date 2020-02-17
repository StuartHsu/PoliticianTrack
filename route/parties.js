const express = require("express");
const router = express.Router(); // create a router
const bodyParser = require('body-parser');
const parties = require('../model/parties');



// Get parties: /api/getparty/
router.post('/', async function(req, res) {
  let party = req.body.party;
  let data = await parties.filter(party);
  res.send({data: data});
});




































module.exports = router;