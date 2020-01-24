const express=require("express");
const router = express.Router(); // create a router

const crawler={
  ftv: require('../crawler/ftv'),
  ebc: require('../crawler/ebc'),
  ett: require('../crawler/ett'),
  cna: require('../crawler/cna'),
  tvbs: require('../crawler/tvbs')
}

// FTV crawler
router.get('/ftv', async function(req, res) {
  await crawler.ftv.get({Cate: 'POL', Page: 1, Sp: 200}).then(resp => {
    res.send({data: resp});
  }).catch(err => {
    res.status(400).send({error: err});
  });
});

// EBC crawler
router.get('/ebc', async function(req, res) {
  await crawler.ebc.get().then(resp => {
    res.send({data: resp});
  }).catch(err => {
    res.status(400).send({error: err});
  });
});

// ETtoday crawler
router.get('/ett', async function(req, res) {
  await crawler.ett.get().then(resp => {
    res.send({data: resp});
  }).catch(err => {
    res.status(400).send({error: err});
  });
});

//  CNA crawler
router.get('/cna', async function(req, res) {
  await crawler.cna.get().then(resp => {
    res.send({data: resp});
  }).catch(err => {
    res.status(400).send({error: err});
  });
});

// TVBS crawler
router.get('/tvbs', async function(req, res) {
  await crawler.tvbs.get().then(resp => {
    res.send({data: resp});
  }).catch(err => {
    res.status(400).send({error: err});
  });
});


module.exports = router;
