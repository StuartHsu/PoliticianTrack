const request = require('request');
const cheerio = require('cheerio');
const runSchedule = require('./schedule.js');
const db = require('../model/crawler/savenews');

const crawler = {
  ftv: require('./ftv'),
  ebc: require('./ebc'),
  ett: require('./ett'),
  cna: require('./cna'),
  tvbs: require('./tvbs')
}

// runSchedule(async function() {
  console.log("Crawler exec start...");

  // crawler.ebc.get().then(async resp => {
  //   await dataForm('ebc', resp);
  //   console.log("ebc done");
  // }).catch(err => {
  //   console.log("ebc error");
  // });

  async function ggg() {
    await crawler.ett.get().then(async resp => {
      await dataForm('ett', resp);
      console.log("ett done");
    }).catch(err => {
      console.log("ett error");
    });
  }

  ggg();
  //
  // await crawler.cna.get().then(async resp => {
  //   await dataForm('cna', resp);
  //   console.log("cna done");
  // }).catch(err => {
  //   console.log("cna error");
  // });
  //
  // await crawler.tvbs.get().then(async resp => {
  //   await dataForm('tvbs', resp);
  //   console.log("tvbs done");
  // }).catch(err => {
  //   console.log("tvbs error");
  // });

  console.log("Crawler exec finish...");
// });



async function dataForm(publisher, resp) {
  // for (let i = 0; i < resp.length; i++) {
  for (let i = 0; i < 1; i++) {
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
      console.log(err);
    });
  }
}
