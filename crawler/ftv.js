const request = require('request');
const qs = require('querystring');

module.exports={
  get: function(args) {
    // API link: https://api.ftvnews.com.tw/api/FtvGetNews?Cate=POL&Page=1&Sp=300
    // Cate: category
    // Page: current page
    // Sp: numbers of 1 page
    const host = 'https://api.ftvnews.com.tw';
    const url = urlWithEndpoint('/api/FtvGetNews', args, host);
    let body = {};
    let data = [];
    return new Promise(function(resolve, reject){
      request({url: url, method: 'GET'}, function(err, resp, results){
        if(err || !body) {
          reject("Error");
        } else {
          let parseResult = JSON.parse(results).ITEM;

          for(let i = 0; i < parseResult.length; i++) {
            body = {
              title:parseResult[i].Title,
              desc:parseResult[i].Preface.replace( /(<([^>]+)>)/ig, ''),
              content:parseResult[i].Content.replace( /(<([^>]+)>)/ig, ''),
              href:parseResult[i].WebLink,
              pubTime:parseResult[i].CreateDate.substr(0, 16)
            }
            data.push(body);
          }
          resolve(data);
        }
      });
		});
  }
}


function urlWithEndpoint(endpoint, params, host){
  const query = qs.stringify(params);
  const baseURL = `${host}${endpoint}`;
  return query ? `${baseURL}?${query}` : baseURL;
}
