const express = require("express");
const router = express.Router(); // create a router
const bodyParser = require('body-parser');
const news = require('../model/news');


router.post('/getNews/:category', async function(req, res) {
  let { category } = req.params;
  let param = req.body;
  let paging = parseInt(req.query.paging);
	if(!Number.isInteger(paging)){
		paging = 0;
	}
	let size = 10;

  switch (category) {
    case "normal":
      await news.get(param, size, paging).then(async resp => {
        res.send({data: resp});
      }).catch(err => {
        res.status(400).send({error: err});
      });
    break;
    case "accurate":
      await news.getAccurate(param, size, paging).then(async resp => {
        res.send({data: resp});
      }).catch(err => {
        res.status(400).send({error: err});
      });
    break;
    default:
      res.status(404).send("Sorry can't find that!");
  }
});


module.exports = router;
