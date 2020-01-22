const puppeteer = require('puppeteer');
const cheerio = require('cheerio');

(async () => {
  // 這裡會開啟一個瀏覽器
  const browser = await puppeteer.launch({
      headless: true
  })

  const page = await browser.newPage();
  await page.goto('https://www.ftvnews.com.tw/news/overview/POL');
  await page.waitForSelector('.overview-news-list')
  let body = await page.content()
  let $ = await cheerio.load(body)

  let data=[];
  await $('app-root div ftv-news news-overview article section ul.clearfix.mt-30 li').each((i,el)=>{
    let $2 = cheerio.load($(el).html());

    let tmp={
      title: $2('span.title').text().trim(),
      href: $2('a').attr('href'),
      time: $2('.time i').text()
      // view: $2('div.ir-list__info').text().trim().split('｜')[1],
      // herf: $2('h3.ir-list__title a').attr('href')
    }
    data.push(tmp);
  })
  console.log(data);
  // let gg=await $('app-root div ftv-news news-overview article section ul.clearfix.mt-30 li.col-lg-4.col-md-6.col-sm-6.col-xs-12').text()
  // console.log(gg);

})();

// 民視
// https://api.ftvnews.com.tw/api/FtvGetNews?Cate=POL&Page=1&Sp=200
