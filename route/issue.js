const express = require("express");
const router = express.Router(); // create a router
const bodyParser = require('body-parser');
const issues = require('../model/issues');



// Get parties: /api/polgetissues
router.post('/', async function(req, res) {
  let pol = req.body.pol;
  if(pol.length === 0) {
    let data = await issues.getAllIssue();
    res.send(data);
  } else {
    let pol_id = await issues.getPolId(pol);
    data = await issues.getPolIssue(pol_id);
    res.send(data);
  }
});




































module.exports = router;
