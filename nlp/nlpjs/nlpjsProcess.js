const { NlpManager } = require('node-nlp');

const manager = new NlpManager({ languages: ['zh'] });
manager.load('./nlp/nlpjs/trained_model/train.nlp');

module.exports = manager;
