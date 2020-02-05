const { NlpManager } = require('node-nlp');

const manager = new NlpManager({ languages: ['zh'] });

const politician = ['賴清德','韓國瑜','蘇貞昌','王世堅','郝龍斌','柯文哲'];
const country = ['美國','中國','中國大陸','大陸','中共'];

manager.addNamedEntityText(
  'politician',
  '人物',
  ['zh'],
  politician
);

manager.addNamedEntityText(
  'country',
  '國家',
  ['zh'],
  country
);

manager.addNamedEntityText(
  'say',
  '表示',
  ['zh'],
  ['表示','認為','說','覺得','痛批','批','嗆','嗆爆','一句話']
);

manager.addNamedEntityText(
  'medical',
  '醫療',
  ['zh'],
  ['WHO']
);

manager.addDocument('zh', '%politician%：', 'politician.say');
manager.addDocument('zh', '%politician%%say%', 'politician.say');
manager.addDocument('zh', '%country%：', 'country.say');
manager.addDocument('zh', '%country%%say%', 'country.say');
manager.addDocument('zh', '%say%', 'someone.say');
manager.addDocument('zh', '%medical%：', 'issue.medical');

manager.addAnswer('zh', 'politician.say', '政治人物表示');
manager.addAnswer('zh', 'country.say', '國家表示');
manager.addAnswer('zh', 'someone.say', '某人表示');
manager.addAnswer('zh', 'issue.medical', '醫療議題');


module.exports = {
  train: async function() {
    return new Promise(async function(resolve, reject) {
      await manager.train();
      manager.save('./nlp/nlpjs/trained_model/train.nlp');
      const content = '爆料隔離地點恐挨罰 柯文哲稱「會檢討」：要被抓去關了嗎？'.replace('：', '表示');
      const response = await manager.process('zh', content);
      resolve (JSON.stringify(response));
    });
  }
}
