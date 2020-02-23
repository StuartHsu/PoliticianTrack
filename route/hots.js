const express = require("express");
const router = express.Router(); // create a router
const bodyParser = require('body-parser');
const hotsData = require('../model/hots');



// Get hots - pols
router.get('/:category', async function(req, res) {
  let { category } = req.params;
  let type;
  let data = req.body;
  let paging = parseInt(req.query.paging);
	if(!Number.isInteger(paging)){
		paging = 0;
	}
	let size = 30;

  switch (category) {
    case "pol":
      type = "pol";
    break;
    case "issue":
      type = "issue";
    break;
    default:
      res.send("Sorry..., this category dosen't exist in database.");
  }
  let results = await hotsData.get(type, size, paging);
  res.send({data: results});
});

// Get hots - issues
// router.get('/issue', async function(req, res) {
//   let data = await hotsData.getIssue();
//   res.send({data: data});
// });

// Get hots - subIssues
// router.get('/sub/issue', async function(req, res) {
//   if(req.query.pol) {
//     let data = await hotsData.getSubIssue(req.query.pol);
//     res.send({data: data});
//   } else if(req.query.issue) {
//     let data = await hotsData.getSubPol(req.query.issue);
//     res.send({data: data});
//   } else {
//     res.send("Please enter correct request");
//   }
//   // let data = await hotsData.getSubIssue(req.query.pol);
//   // res.send({data: data});
// });

// Get hots - subPol
// router.get('/sub/pol', async function(req, res) {
//   let data = await hotsData.getSubPol(req.query.issue);
//   res.send({data: data});
// });

// Get hots - sub
router.get('/sub/:category', async function(req, res) {
  let { category } = req.params;
  let tagId = req.query.id;
  let type;
  switch (category) {
    case "pol":
      type = "pol";
    break;
    case "issue":
      type = "issue";
    break;
    default:
      res.send("Sorry..., this category dosen't exist in database.");
  }
  let results = await hotsData.getSub(type, tagId);
  res.send({data: results});
});




































module.exports = router;
