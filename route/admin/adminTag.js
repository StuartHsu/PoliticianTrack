const express = require("express");
const router = express.Router(); // create a router
const bodyParser = require('body-parser');

const adminTag = require('../../model/admin/adminTag');


// run segmentation
router.post('/api/seg', async function(req, res) {
  console.log(req.body.start.replace(/-/g, "/"));
  console.log(req.body.end.replace(/-/g, "/"));
  let period = {
    start: req.body.start.replace(/-/g, "/"),
    end:req.body.end.replace(/-/g, "/")
  }
  let data = await adminTag.seg(period.start, period.end);
  res.send({data: data});
});

// get raw segmentation results
router.get('/api/list', async function(req, res) {
  let data = await adminTag.get();
  res.send({data: data});
});

// add or modify tag in dict
router.get('/api/updateDict', async function(req, res) {
  let data = await adminTag.updateDic();
  res.send({data: data});
});

router.get('/api/updateDB', async function(req, res) {
  let data = await adminTag.updateDB();
  res.send({data: data});
});



































module.exports = router;
