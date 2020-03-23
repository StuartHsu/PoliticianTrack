const express = require('express');
// eslint-disable-next-line
const router = express.Router();
const news = require('../model/news');

router.post('/getNews/:category', async function(req, res) {
  const {category} = req.params;
  const param = req.body;
  const size = 10;
  let paging = parseInt(req.query.paging);

  if (!Number.isInteger(paging)) {
    paging = 0;
  }

  switch (category) {
    case 'normal':
      await news.get(param, size, paging)
          .then(async function(resp) {
            res.send({data: resp});
          })
          .catch(function(err) {
            res.status(400).send({error: err});
          });
      break;

    case 'accurate':
      await news.getAccurate(param, size, paging)
          .then(async function(resp) {
            res.send({data: resp});
          })
          .catch(function(err) {
            res.status(400).send({error: err});
          });
      break;

    default:
      res.status(404).send('Sorry can\'t find that!');
  }
});


module.exports = router;
