const { NlpManager } = require('node-nlp');

const manager = new NlpManager({ languages: ['zh'] });

const people = ['賴清德','韓國瑜'];

manager.addNamedEntityText(
  'people',
  '人物',
  ['zh'],
  people
);

manager.addNamedEntityText(
  'say',
  '表示',
  ['zh'],
  ['表示','認為','說','覺得']
);

manager.addDocument('zh', '%people%：', 'people.say');
manager.addDocument('zh', '%people%%say%', 'people.say');

// manager.addAnswer('zh', 'place.search', '找地點');
// manager.addAnswer('zh', 'people.politician', '政治人物');
manager.addAnswer('zh', 'people.say', '表示');


module.exports = {
  get: async function() {
    return new Promise(async function(resolve, reject) {
      await manager.train();
      manager.save('./util/nlp_trained_model/test_train.nlp');
      // const content = '快訊／「原先台灣會世界第二慘」蘇貞昌說話了：生產再多口罩都不夠用'.replace('：', '表示');
      const content = '賴清德：我在亂講話';
      const response = await manager.process('zh', content);
      resolve (JSON.stringify(response));
    });
  }
}
