const express = require('express');
// eslint-disable-next-line
const router = express.Router();
const parties = require('../../model/filter/parties');

router.post('/', async function(req, res) {
  const party = req.body.party;
  const data = await parties.getPoliticians(party);

  res.send({data: data});
});


module.exports = router;
