const express = require("express");
const router = express.Router(); // create a router
const bodyParser = require('body-parser');
const hotsData = require('../model/hots');

// Get hots
router.get('/:category', async function(req, res)
{
  let { category } = req.params;
  let type;
  let data = req.body;
  let size = 30;
  let paging = parseInt(req.query.paging);

	if (!Number.isInteger(paging))
  {
		paging = 0;
	}

  switch (category)
  {
    case "politician":
      type = "politician";
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

// Get hots - sub
router.get('/sub/:category', async function(req, res)
{
  let { category } = req.params;
  let tagId = req.query.id;
  let type;

  switch (category)
  {
    case "politician":
      type = "politician";
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
