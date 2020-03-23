const express = require('express');
// eslint-disable-next-line
const router = express.Router();
const hotsData = require('../model/hots');

// Get hots
router.get('/:category', async function(req, res) {
  const {category} = req.params;
  let type;
  const size = 30;
  let paging = parseInt(req.query.paging);

  if (!Number.isInteger(paging)) {
    paging = 0;
  }

  switch (category) {
    case 'politician':
      type = 'politician';
      break;

    case 'issue':
      type = 'issue';
      break;

    default:
      res.send('Sorry..., this category dosen\'t exist in database.');
  }

  const results = await hotsData.get(type, size, paging);

  res.send({data: results});
});

// Get hots - sub
router.get('/sub/:category', async function(req, res) {
  const {category} = req.params;
  const tagId = req.query.id;
  let type;

  switch (category) {
    case 'politician':
      type = 'politician';
      break;

    case 'issue':
      type = 'issue';
      break;

    default:
      res.send('Sorry..., this category dosen\'t exist in database.');
  }

  const results = await hotsData.getSub(type, tagId);

  res.send({data: results});
});


module.exports = router;
