const express = require('express');
const newData = require('./model/news');
const polsData = require('./model/politicians');
const issuesData = require('./model/issues');

const PORT = process.env.PORT || 3000;


const app = express();

app.use(express.static('public')); // static file
app.set('view engine', 'ejs');

// Crawler route
const crawler = require('./route/crawler');
app.use('/crawler', crawler);

const news = require('./route/news');
app.use('/api/news', news);

// filter page get politician
const getPolitician = require('./route/politician');
app.use('/api/getpolitician', getPolitician);

// NLP
const nlp = require('./route/nlp/nlpjs');
app.use('/nlp', nlp);

// filter page render data when 1st coming
app.get('/politician', async function(req, res) {
  let results = await newData.get('title', '');
  let polsResults = await polsData.get();
  let issuesResults = await issuesData.get();
  res.render('politician', {
    title: '',
    issue: '',
    results: results,
    polsData: polsResults,
    issuesData: issuesResults
  });
});




// app.get('/nlp/test', async function(req, res) {
//   let results = await nlp.get();
//   res.send(results);
// });

// const jieba = require('./nlp/jieba/jiebatest');
//
// app.get('/jieba/test', async function(req, res) {
//   let content = "副總統當選人賴清德辦公室今天指出，賴清德2日已赴美，出席今年度華府的「國家祈禱早餐會」，此行是以個人身份應邀，也將安排國際事務智庫、僑界等拜會，預定2月9日返國，前立委蕭美琴陪同。賴清德辦公室今天透過新聞稿指出，賴清德昨天晚間出發前往美國，出席今年度在華府舉辦的「國家祈禱早餐會」（National Prayer Breakfast）。賴清德辦公室指出，賴清德此行是以個人身份，行程間除應邀參加美國民間團體主辦的活動，「並藉此機會向美國友人表達其聲援台灣加入世界衛生組織（WHO）的感激外」，也將安排國際事務智庫、僑界等拜會，並短暫停留紐約，預定於2月9日返國。前立法委員蕭美琴也陪同前往。賴清德辦公室表示，賴清德日前已就此行向總統蔡英文報告，蔡總統表示樂見，也祝福賴清德行程順利。（編輯：楊凱翔）1090203";
//   let results = await jieba.get(content);
//   res.send(results);
// });





const ggg = require('./nlp/jieba/tagFreq');

app.get('/tagVerify', async function(req, res) {
  let data = await ggg.test();
  res.send(data);
});














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
