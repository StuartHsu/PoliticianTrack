const language = require('@google-cloud/language');

const client = new language.LanguageServiceClient();

/**
 * TODO(developer): Uncomment the following line to run this code.
 */

async function test() {
  const text = '吳斯懷批國軍成口罩工 陳柏惟反嗆： 國民黨是不是在圖利中國？';

  // Prepares a document, representing the provided text
  const document = {
    content: text,
    type: 'PLAIN_TEXT',
  };

  // Detects entities in the document
  const [result] = await client.analyzeEntities({document});

  const entities = result.entities;

  console.log('Entities:');
  entities.forEach(entity => {
    console.log(entity);
    console.log(entity.name);
    console.log(` - Type: ${entity.type}, Salience: ${entity.salience}`);
    if (entity.metadata && entity.metadata.wikipedia_url) {
      console.log(` - Wikipedia URL: ${entity.metadata.wikipedia_url}$`);
    }
  });

}

test();
