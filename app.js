const express = require('express');
const bodyParser = require('body-parser');
const newData = require('./model/news');
const issuesData = require('./model/issues');
const filterTagContent = require('./model/filterTagCount');
const hotsData = require('./model/hots');
const partiesData = require('./model/parties');

const PORT = process.env.PORT || 3000;


const app = express();

app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

app.use(express.static('public')); // static file
app.set('view engine', 'ejs');

// Crawler route
const crawler = require('./route/crawler');
app.use('/crawler', crawler);

const news = require('./route/news');
app.use('/api/news', news);


// filter page pol get issue
const polGetIssues = require('./route/issue');
app.use('/api/polgetissues', polGetIssues);

// filter page get party
const getParty = require('./route/parties');
app.use('/api/getparty', getParty);

// hots
const getHots = require('./route/hots');
app.use('/api/gethots', getHots);






// Admin tag & NRP/NI 頻率統計
const adminTag = require('./route/admin/adminTag');
app.use('/admin', adminTag);

// Index page - get tagCount
const tagCount = require('./route/tagCount');
app.use('/tagCount', tagCount);

let param = {
  pol: [],
  issue: [],
  party: [],
  from: ""
}

// filter page render data when 1st coming
app.get('/politician', async function(req, res) {
  let results;

  if(req.query.pol && req.query.issue) { // hot page's subList 過來
    param.pol = [req.query.pol];
    param.issue = [req.query.issue];
    param.from = "hots";
    results = await newData.get(param, 10, 0);
  } else if(req.query.pol || req.query.issue) { // index 點擊過來
    param.pol = req.query.pol ? [req.query.pol] : [];
    param.issue = req.query.issue ? [req.query.issue] : [];
    param.from = "index";
    results = await newData.get(param, 10, 0);
  } else { // 篩選進來預設
    let paging = parseInt(req.query.paging);
  	if(!Number.isInteger(paging)){
  		paging = 0;
  	}
  	let size = 10;
    param.pol = [];
    param.issue = [];
    param.from = "oncoming";
    results = await newData.get(param, size, paging);
  }
  let polsResults = await filterTagContent.get("pol");
  let issuesResults = await filterTagContent.get("issue");
  let partiesResults = await partiesData.get();
  res.render('politician', {
    title: param.pol,
    issue: param.issue,
    results: results,
    polsData: polsResults,
    issuesData: issuesResults,
    partiesData: partiesResults,
    from: param.from
  });
});


// Compare page
app.get('/compare', async function(req, res) {
  let polsResults = await filterTagContent.get("pol");
  let issuesResults = await filterTagContent.get("issue");
  res.render('compare', {
    polsData: polsResults,
    issuesData: issuesResults
  });
});

// hots page
app.get('/hots', async function(req, res) {
  let data = req.body;
  let paging = parseInt(req.query.paging);
	if(!Number.isInteger(paging)){
		paging = 0;
	}
	let size = 30;
  let results = await hotsData.get("pol", size, paging);
  res.render('hots', {
    results: results.list
  });
});




// 立法院歷屆立委
// const request = require('request');
// const gov_legi = require('./crawler/gov/legislator');
// app.get('/legtest', function(req, res) {
//   let data = gov_legi.get();
//   res.send(data);
// });

// 讀議員 excel
const readExcel = require('./crawler/gov/parliament');
app.get('/parliament', async function(req, res) {
  let data = await readExcel.get();
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
