const request = require('request');
const cheerio = require('cheerio');
const asyncModule = require('async');

module.exports={
  get: function() {

    return new Promise(function(resolve, reject) {
      //  來源 URL
      let fetchUrl = 'https://www.ettoday.net/news/focus/%E6%94%BF%E6%B2%BB/';

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
    let urlParent = $('.block_content .piece.clearfix a');
    let url = '';
    for(let i = 0; i < urlParent.length; i++) {
      if($('.c1 .block_content .piece.clearfix a.pic').eq(i).attr('href')) {
        url = 'https://www.ettoday.net' + $('.c1 .block_content .piece.clearfix a.pic').eq(i).attr('href');
        urls.push(url);
      };
    };

    cb(null, urls);
  });
};

// 取得各新聞詳細內容
function getInfo(url, cb) {
  request(url, function(err, res, body) {
    let $ = cheerio.load(body);

    var title = $('header h1.title').text().trim();
    var desc = $('.story p').eq(3).text().trim();
    let content = '';
    for(let i = 3; i < $('.story p').length; i++) {
      content += $('.story p').eq(i).text().trim();
    };
    let href = url;
    var pubTime = $('.c1 time.date').text().trim();

    cb(null, {title, desc, content, href, pubTime});
  });
};
