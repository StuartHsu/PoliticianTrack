const express = require("express");
const router = express.Router(); // create a router
const mysql = require("../util/mysqlcon.js");
const db = require('../model/crawler/savenews');
const request = require('request');
const cheerio = require('cheerio');

const crawler = {
  ftv: require('../crawler/ftv'),
  ebc: require('../crawler/ebc'),
  ett: require('../crawler/ett'),
  cna: require('../crawler/cna'),
  tvbs: require('../crawler/tvbs')
}


// FTV crawler
router.get('/ftv', async function(req, res) {
  await crawler.ftv.get({Cate: 'POL', Page: 1, Sp: 200}).then(async resp => {
    await dataForm('ftv', resp);
    res.send({data: resp});
  }).catch(err => {
    res.status(400).send({error: err});
  });
});

// EBC crawler
router.get('/ebc', async function(req, res) {
  await crawler.ebc.get().then(async resp => {
    await dataForm('ebc', resp);
    res.send({data: resp});
  }).catch(err => {
    res.status(400).send({error: err});
  });
});

// ETtoday crawler
router.get('/ett', async function(req, res) {
  await crawler.ett.get().then(async resp => {
    await dataForm('ett', resp);
    res.send({data: resp});
  }).catch(err => {
    res.status(400).send({error: err});
  });
});

//  CNA crawler
router.get('/cna', async function(req, res) {
  await crawler.cna.get().then(async resp => {
    await dataForm('cna', resp);
    res.send({data: resp});
  }).catch(err => {
    res.status(400).send({error: err});
  });
});

// TVBS crawler
router.get('/tvbs', async function(req, res) {
  await crawler.tvbs.get().then(async resp => {
    await dataForm('tvbs', resp);
    res.send({data: resp});
  }).catch(err => {
    res.status(400).send({error: err});
  });
});

// Save all
router.get('/all', async function(req, res) {
  // await crawler.ftv.get({Cate: 'POL', Page: 1, Sp: 200}).then(async resp => {
  //   await dataForm('ftv', resp);
  //   console.log("ftv done");
  // }).catch(err => {
  //   res.status(400).send({error: err});
  // });
  await crawler.ebc.get().then(async resp => {
    await dataForm('ebc', resp);
    console.log("ebc done");
  }).catch(err => {
    res.status(400).send({error: err});
  });
  await crawler.ett.get().then(async resp => {
    await dataForm('ett', resp);
    console.log("ett done");
  }).catch(err => {
    res.status(400).send({error: err});
  });
  await crawler.cna.get().then(async resp => {
    await dataForm('cna', resp);
    console.log("cna done");
  }).catch(err => {
    res.status(400).send({error: err});
  });
  await crawler.tvbs.get().then(async resp => {
    await dataForm('tvbs', resp);
    console.log("tvbs done");
  }).catch(err => {
    res.status(400).send({error: err});
  });
  res.send("Done");
});

async function dataForm(publisher, resp) {
  for (let i = 0; i < resp.length; i++) {
    let data = {
      title: resp[i].title,
      description: resp[i].desc,
      content: resp[i].content,
      href: resp[i].href,
      pubTime: resp[i].pubTime,
      publisher: publisher
    }
    // save news to db
    await db.save(data.href, data).then(async function(results) {
      // nothing to do when insert data ok...
    }).catch(err => {
      res.status(400).send({error: err});
    });
  }
}







































module.exports = router;
