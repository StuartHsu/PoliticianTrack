const express = require("express");
const router = express.Router(); // create a router
const bodyParser = require('body-parser');
const issues = require('../model/issues');



// Get parties: /api/polgetissues
router.post('/', async function(req, res) {
  let pol = req.body.pol;
  let issue = req.body.issue;
  let pol_id;
  if(pol.length === 0) {
    let data = await issues.getAllIssue();
    res.send(data);
  } else if(pol.length === 2 && issue.length === 0) { // filter: pol affect issue @compare
    let polList = [req.body.pol[0],req.body.pol[1]];
    rawPolId = await issues.getPolId(polList);
    let polId = [rawPolId[0].id, rawPolId[1].id];
    data = await issues.getTwoPolIssue(polId);
    res.send(data);
  } else {
    pol_id = await issues.getPolId(pol);
    data = await issues.getPolIssue(pol_id[0].id);
    res.send(data);
  }
});




































module.exports = router;
