const request=require('request');
const qs=require('querystring');

const host = 'https://newsapi.org';

class NewsAPI {
  constructor(apiKey){
    if(!apiKey){
      throw new Error('No API key specified');
    }
    this.v2={
      everything(args){
        const url=urlWithEndpoint('/v2/everything', args, apiKey);
        return getData(url);
      }
    }
  }
}

function urlWithEndpoint(endpoint, params, apiKey){
  const query=qs.stringify(params);
  const API_KEY=`apiKey=${apiKey}`;
  const baseURL=`${host}${endpoint}`;
  return query ? `${baseURL}?${query}&${API_KEY}` : `${baseURL}?${API_KEY}`;
}

function getData(url){
  return new Promise(function(resolve, reject){
    request(url, function(err, res, body){
      if(err || !res){
        reject("Error");
      } else {
        resolve(body);
      }
    });
  });
}

module.exports = NewsAPI;
