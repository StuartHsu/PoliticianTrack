const nodejieba = require('nodejieba');

// nodejieba.load({userDict: './util/dict.txt'},);


// var result = nodejieba.cut("南京市长江大桥");
// console.log(result);

module.exports = {
  get: async function(data) {
    return new Promise(async function(resolve, reject) {
      let body = {
        // cut: nodejieba.cut(data),
        // cutHMM: nodejieba.cutHMM(data),
        tag: nodejieba.tag(data)
        // extract: nodejieba.extract(data, 30)
      };
      resolve(body);
    });
  }
}
