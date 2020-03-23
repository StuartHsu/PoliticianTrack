const express = require('express');
// eslint-disable-next-line
const router = express.Router();
const issues = require('../../model/filter/issues');

router.post('/', async function(req, res) {
  const param = req.body;
  const data = await issues.get(param);

  res.send(data);
});


module.exports = router;
