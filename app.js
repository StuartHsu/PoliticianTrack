const express=require('express');
const request=require('request');
const asyncModule = require('async');

const superagent = require('superagent');
const cheerio = require('cheerio');

const puppeteer = require('puppeteer');

const NewsAPI = require('./src/newsapi');

const newsapi=new NewsAPI('999b04c84ac64ac5a3b4625ec41448d8');

const PORT = process.env.PORT || 3000;


const app = express();

// API key: 999b04c84ac64ac5a3b4625ec41448d8
// pass: katosy0322

const currentDate = new Date();
const year = currentDate.getFullYear();
const month = currentDate.getMonth();
const date = currentDate.getDate();

const toNow = year + '-' + month + '-' + date;
const daysAgo = 10;
const fromDaysAgo = year + '-' + month + '-' + (date-daysAgo);

const url = 'https://newsapi.org/v2/everything?' +
          'q=%E9%9F%93%E5%9C%8B%E7%91%9C' +
          // 'q=%E8%94%A1%E8%8B%B1%E6%96%87' +
          // 'q=Web+API' +
          '&sortBy=publishedAt' +
          '&language=zh' +
          '&from=' + fromDaysAgo +
          '&to=' + toNow +
          // '&domains=google.com' +
          '&pageSize=100' +
          '&apiKey=999b04c84ac64ac5a3b4625ec41448d8';

const url2 = 'https://newsapi.org/v2/top-headlines?' +
          // 'q=Web+API' +
          // 'q=%E9%9F%93%E5%9C%8B%E7%91%9C' +
          'country=tw' +
          // 'sources=google-news' +
          '&pageSize=100' +
          '&apiKey=999b04c84ac64ac5a3b4625ec41448d8';

const url3 = 'https://newsapi.org/v2/sources?' +
          'language=en' +
          '&country=us' +
          '&apiKey=999b04c84ac64ac5a3b4625ec41448d8';


// app.get('/', function(req, res){
//   request(url, (err, response, body) => {
//     console.log(url);
//     if (err || !res){
//       console.log(err);
//     } else {
//       // console.log(body);
//       res.send(JSON.parse(body));
//       // return body;
//     }
//   });
//   // console.log(test);
// });


// app.get('/', function(req, res) {
//   newsapi.v2.everything({
//     q:'黃昭順',
//     sortBy:'publishedAt',
//     language:'zh',
//     domains:'yahoo.com,google.com,ltn.com,storm.mg,newtalk.com,setn.com,udn.com,chinatimes.com',
//     from:fromDaysAgo,
//     to:toNow,
//     pageSize:100
//   }).then(response=>{
//     res.send(JSON.parse(response));
//   }).catch(function(error){
//     res.status(400).send({error:error});
//   });
// });


// app.get('/', async function(req, res) {
//   const BASE_URL = 'https://www.thenewslens.com/category/politics/year/2020/month/1';
//   await superagent.get('http://www.23us.so')
//   .end(function(err, sres){
//     console.log(sres);
//     let $=cheerio.load(sres.text);
//     let data=[];
//     $('#s_dd dd').each(function () {
//       let info = {
//         link: $(this).find('a').eq(0).attr('href'),
//         name: $(this).find('a').eq(1).text(),
//         image: $(this).find('img').attr('src')
//       }
//       data.push(info)
//     })
//     console.log(data);
//   })
// });

// Crawler route
const crawler = require('./route/crawler');
app.use('/crawler', crawler);

// // FTV crawler
// app.get('/ftv', async function(req, res) {
//   await crawler.ftv.get({Cate: 'POL', Page: 1, Sp: 200}).then(resp => {
//     res.send({data: resp});
//   }).catch(err => {
//     res.status(400).send({error: err});
//   });
// });
//
// // EBC crawler
// app.get('/ebc', async function(req, res) {
//   await crawler.ebc.get().then(resp => {
//     res.send({data: resp});
//   }).catch(err => {
//     res.status(400).send({error: err});
//   });
// });
//
// // ETtoday crawler
// app.get('/ett', async function(req, res) {
//   await crawler.ett.get().then(resp => {
//     res.send({data: resp});
//   }).catch(err => {
//     res.status(400).send({error: err});
//   });
// });
//
// //  CNA crawler
// app.get('/cna', async function(req, res) {
//   await crawler.cna.get().then(resp => {
//     res.send({data: resp});
//   }).catch(err => {
//     res.status(400).send({error: err});
//   });
// });
//
// // TVBS crawler
// app.get('/tvbs', async function(req, res) {
//   await crawler.tvbs.get().then(resp => {
//     res.send({data: resp});
//   }).catch(err => {
//     res.status(400).send({error: err});
//   });
// });





















app.use((req, res, next) => {
  res.status(404).send("Sorry can't find that!");
});
app.use(function(err, req, res, next) {
  console.error(err.stack);
  res.status(500).send('Something Error!');
});

app.listen(3000, () => {
  console.log(`Server running on port ${PORT}`);
});
