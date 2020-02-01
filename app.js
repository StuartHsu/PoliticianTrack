const express = require('express');
const newData = require('./model/news');

const PORT = process.env.PORT || 3000;


const app = express();

app.use(express.static('public')); // static file
app.set('view engine', 'ejs');

// Crawler route
const crawler = require('./route/crawler');
app.use('/crawler', crawler);

const news = require('./route/news');
app.use('/api/news', news);


app.get('/politician', async function(req, res) {
  let results = await newData.get('title', '');
  res.render('politician', {
    title: '',
    issue: '',
    results: results
  });
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
