const puppeteer = require('puppeteer');
const cheerio = require('cheerio');

module.exports={
  get: async function() {
    // 開啟一個瀏覽器
    const browser = await puppeteer.launch({
        headless: true,
        defaultViewport: {width:3000,height:1000}
    });

    const page = await browser.newPage();
    await page.goto('https://news.ebc.net.tw/News/politics');
    await page.waitForSelector('.footer-2');
    let body = await page.content();
    let $ = await cheerio.load(body);

    let data=[];

    await $('div.news-list-box .style1.white-box').each((i, el) => {
      let $2 = cheerio.load($(el).html());
      let tmp={
        title: $2('.title span').text().trim(),
        desc: $2('.summary span').text().trim(),
        href: 'https://news.ebc.net.tw' + $2('a').attr('href'),
        // image: $2('.target-img img').attr('src'),
        pubTime: $2('.small-gray-text').text().trim()
      }
      data.push(tmp);
    });
    await browser.close();
    return data;
  }
}
