const request = require('request');
const cheerio = require('cheerio');
const asyncModule = require('async');

module.exports={
  get: function() {

    return new Promise(function(resolve, reject) {
      //  來源 URL
      let fetchUrl = 'https://news.tvbs.com.tw/politics/';

      getUrls(fetchUrl, (err, result) => {
        if(result.length > 40) {
          result = result.splice(39, result.length - 40)
        }
        asyncModule.map(result, getInfo, (err, results) => {
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
    let urlParent = $('#block_768 .content_center_list_box a');
    let url = '';
    for(let i = 0; i < urlParent.length; i++) { // urlParent.length
      url = 'https://news.tvbs.com.tw' + urlParent.eq(i).attr('href');
      urls.push(url);
    };

    cb(null, urls);
  });
};

// 取得各新聞詳細內容
function getInfo(url, cb) {
  request(url, function(err, res, body) {
    if(body) {
      let $ = cheerio.load(body);

      var title = $('.newsdetail_content .title.margin_b20 h1').text().trim();
      let content = $('#news_detail_div').clone().find('strong').remove().end().text().trim();
      var desc = content.substr(0, 150) + '...';
      let href = url;
      var pubTime = $('.newsdetail_content .icon_time.time.leftBox2').text().trim();
      cb(null, {title, desc, content, href, pubTime});
    } else {
      cb(null, null);
    }

  });
};
