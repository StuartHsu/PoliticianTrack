const request = require('request');
const cheerio = require('cheerio');

module.exports={
  crawler: function() {
    let result={};
    let test = request('https://rate.bot.com.tw/xrt?Lang=zh-TW', (err, res, body) => {
      if (err || !body){
        result={
          TWD:1,
          JPY:1/0.2804,
          USD:1/30.09
        }
        return result;
      } else {
        const $ = cheerio.load(body);
        const tr = $("tbody tr");
        const usd=parseFloat(tr.eq(0).children().eq(4).text());
        const jpy=parseFloat(tr.eq(7).children().eq(4).text());
        result={
          TWD:1,
          JPY:1/jpy,
          USD:1/usd
        }
        return result;
      }
    });
  }
}
