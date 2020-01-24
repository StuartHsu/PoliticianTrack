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
    let content = '';
    for(let i = 1; i < $('.story p').length; i++) {
      // 多處理照片註解被納入內文
      content += $('.story p').eq(i).clone().find('strong').remove().end().text().trim();
    };
    // 濾除 XX記者/XX報導 開頭字樣
    var strPos = content.indexOf('報導') + 2;
    content = content.substring(strPos, content.length);
    var desc = content.substr(0, 150) + '...';
    let href = url;
    let reg1 = /(['年'|'月'])/ig;
    let reg2 = /(['日'])/ig;
    var pubTime = $('.c1 time.date').text().trim().replace(reg1, '/').replace(reg2, '');

    cb(null, {title, desc, content, href, pubTime});
  });
};
