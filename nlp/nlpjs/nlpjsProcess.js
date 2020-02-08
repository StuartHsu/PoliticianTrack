const { NlpManager } = require('node-nlp');

const manager = new NlpManager({ languages: ['zh'] });
manager.load('./util/nlp_trained_model/train.nlp');

module.exports = manager;
