const express = require("express");
const router = express.Router(); // create a router
const bodyParser = require('body-parser');
const hotsData = require('../model/hots');



// Get hots - pols
router.get('/pol', async function(req, res) {
  let data = await hotsData.getPol();
  res.send({data: data});
});

// Get hots - issues
router.get('/issue', async function(req, res) {
  let data = await hotsData.getIssue();
  res.send({data: data});
});

// Get hots - subIssues
router.get('/sub/issue', async function(req, res) {
  if(req.query.pol) {
    let data = await hotsData.getSubIssue(req.query.pol);
    res.send({data: data});
  } else if(req.query.issue) {
    let data = await hotsData.getSubPol(req.query.issue);
    res.send({data: data});
  } else {
    res.send("Please enter correct request");
  }
  // let data = await hotsData.getSubIssue(req.query.pol);
  // res.send({data: data});
});

// Get hots - subPol
router.get('/sub/pol', async function(req, res) {
  let data = await hotsData.getSubPol(req.query.issue);
  res.send({data: data});
});




































module.exports = router;
