const express = require('express');
const bodyParser = require('body-parser');

const newData = require('./model/news');
const hotsData = require('./model/hots');
const politicianFilterList = require('./model/filter/politicians');
const issuesFilterList = require('./model/filter/issues');
const partiesData = require('./model/filter/parties');

const PORT = process.env.PORT || 3000;
const app = express();

app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.use(express.static('public')); // static file
app.set('view engine', 'ejs');

// = News
const news = require('./route/news');
app.use('/api/news', news);

// = Filter
// - politician gets issue list
const getIssuesByPolitician = require('./route/filter/issue');
app.use('/api/getIssuesByPolitician', getIssuesByPolitician);
// - party gets politician list
const getPoliticiansByParty = require('./route/filter/parties');
app.use('/api/getPoliticiansByParty', getPoliticiansByParty);

// = Index
const tagCount = require('./route/tagCount');
app.use('/tagCount', tagCount);

// = Hots
const getHots = require('./route/hots');
app.use('/api/gethots', getHots);

// = Admin
const adminTag = require('./route/admin/adminTag');
app.use('/admin', adminTag);


let param =
{
  politician: [],
  issue: [],
  party: [],
  from: ""
}

// News
app.get('/politician', async function(req, res)
{
  let results;

  if (req.query.politician && req.query.issue) // hot page's subList 過來
  {
    param.politician = [req.query.politician];
    param.issue = [req.query.issue];
    param.from = "hots";
    results = await newData.get(param, 10, 0);
  }
  else if (req.query.politician || req.query.issue) // index 點擊過來
  {
    param.politician = req.query.politician ? [req.query.politician] : [];
    param.issue = req.query.issue ? [req.query.issue] : [];
    param.from = "index";
    results = await newData.get(param, 10, 0);
  }
  else // 篩選進來預設
  {
    let paging = parseInt(req.query.paging);
    const size = 10;

  	if (!Number.isInteger(paging))
    {
  		paging = 0;
  	}

    param.politician = [];
    param.issue = [];
    param.from = "oncoming";
    results = await newData.get(param, size, paging);
  }

  const polsResults = await politicianFilterList.get();
  const issuesResults = await issuesFilterList.get(param);
  const partiesResults = await partiesData.getParties();

  res.render('politician',
  {
    title: param.politician,
    issue: param.issue,
    results: results,
    polsData: polsResults,
    issuesData: issuesResults,
    partiesData: partiesResults,
    from: param.from
  });
});

// Compare
app.get('/compare', async function(req, res)
{
  const polsResults = await politicianFilterList.get();
  const issuesResults = await issuesFilterList.get(param);

  res.render('compare',
  {
    polsData: polsResults,
    issuesData: issuesResults
  });
});

// Hots
app.get('/hots', async function(req, res)
{
  let paging = parseInt(req.query.paging);
  const size = 30;

	if (!Number.isInteger(paging))
  {
		paging = 0;
	}

  const results = await hotsData.get("politician", size, paging);

  res.render('hots',
  {
    results: results.list
  });
});


app.use((req, res, next) =>
{
  res.status(404).send("Sorry can't find that!");
});

app.use(function(err, req, res, next)
{
  console.error(err.stack);
  res.status(500).send('Something Error!');
});

app.listen(3000, () =>
{
  console.log(`Server running on port ${PORT}`);
});
