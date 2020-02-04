const express = require("express");
const router = express.Router(); // create a router
const nlpTrain = require('../../nlp/nlpjs/nlpjsTrain');
const nlpProcess = require('../../nlp/nlpjs/nlpjsProcess');

// NLP train
router.get('/train', async function(req, res) {
  let results = await nlpTrain.train();
  res.send(results);
});

// NLP run
router.get('/run', async function(req, res) {
  let content = '影／喊蓋收容所被稱先知！韓國瑜：我們是先辦，高雄希望做防疫模範生';
  nlpProcess.process(content).then(result => {
    res.send(result);
  });
});



































module.exports = router;
