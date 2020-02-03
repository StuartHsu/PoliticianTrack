const { NlpManager } = require('node-nlp');

const manager = new NlpManager({ languages: ['zh'] });

manager.addDocument('zh', '在台北市的法國餐廳', 'place.search');
manager.addDocument('zh', '韓國瑜', 'people.politician');
manager.addDocument('zh', '雞排妹', 'people.normal');

manager.addAnswer('zh', 'place.search', '找地點');
manager.addAnswer('zh', 'people.politician', '政治人物');
manager.addAnswer('zh', 'people.normal', '一般人物');


module.exports = {
  get: async function() {
    return new Promise(async function(resolve, reject) {
      await manager.train();
      manager.save('./test_train.nlp');
      const response = await manager.process('zh', '韓國瑜被雞排妹嗆！');
      resolve (JSON.stringify(response));
    });
  }
}
