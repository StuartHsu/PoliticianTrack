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
  let content = '賴清德華府見盧比歐 談美台關係及台灣國際參與'.replace('：', '表示');
  nlpProcess.process(content).then(result => {
    res.send(result);
  });
});



































module.exports = router;
