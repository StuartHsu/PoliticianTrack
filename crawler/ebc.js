const request = require('request');
const cheerio = require('cheerio');
const asyncModule = require('async');

module.exports={
  get: function() {

    return new Promise(function(resolve, reject) {
      //  來源 URL
      let fetchUrl = 'https://news.ebc.net.tw/News/politics';

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
    let urlParent = $('.news-list-box .style1.white-box a');
    let url = '';
    for(let i = 0; i < urlParent.length; i++) {
      if($('.news-list-box .style1.white-box a').eq(i).attr('href')) {
        url = 'https://news.ebc.net.tw' + $('.news-list-box .style1.white-box a').eq(i).attr('href');
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

    var title = $('.fncnews-content h1').text().trim();
    let content = '';
    for(let i = 0; i < $('.fncnews-content .raw-style p').length; i++) {
      content += $('.fncnews-content .raw-style p').eq(i).clone().find('strong').remove().end().text().trim();
    };
    var desc = content.substr(0, 150) + '...';
    let href = url;
    let reg = /[\u4e00-\u9fa5]/ig; // 中文字
    var pubTime = $('.fncnews-content .small-gray-text').text().replace(reg, '').trim();

    cb(null, {title, desc, content, href, pubTime});
  });
};
