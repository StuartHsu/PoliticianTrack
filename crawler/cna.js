const request = require('request');
const cheerio = require('cheerio');
const asyncModule = require('async');

module.exports={
  get: function() {

    return new Promise(function(resolve, reject) {
      //  來源 URL
      let fetchUrl = 'https://www.cna.com.tw/list/aipl.aspx';

      getUrls(fetchUrl, (err, results) => {
        asyncModule.map(results, getInfo, (err, results) => {
          resolve(results);
        });
      });
    });
  }
}

// 取得政治分類的細項連結
function getUrls(url, cb) {
  request(url, function(err, resp, body) {
    let $ = cheerio.load(body);

    let urls = [];
    let urlParent = $('#myMainList li a');
    let url = '';
    for(let i = 0; i < urlParent.length; i++) {
      url = $('#myMainList li a').eq(i).attr('href');
      urls.push(url);
    };

    cb(null, urls);
  });
};

// 取得各新聞詳細內容
function getInfo(url, cb) {
  request(url, function(err, res, body) {
    let $ = cheerio.load(body);

    var title = $('.centralContent h1').text().trim();
    var desc = $('.centralContent .paragraph p').eq(0).text().trim();
    let content = '';
    for(let i = 0; i < $('.centralContent .paragraph p').length; i++) {
      content += $('.centralContent .paragraph p').eq(i).text().trim();
    };
    let href = url;
    var pubTime = $('.centralContent .updatetime span').text().trim();

    cb(null, {title, desc, content, href, pubTime});
  });
};
