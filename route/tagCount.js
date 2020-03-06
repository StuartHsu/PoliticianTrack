const express = require("express");
const router = express.Router(); // create a router
const redis = require('redis');

const tagCount = require('../model/tagCount');

const REDIS_PORT = process.env.PORT || 6379;
const client = redis.createClient(REDIS_PORT);

// Set response
function setRespnse(name, data)
{
  return JSON.parse(data);
}

// Make request from database
async function getData(req, res)
{
  try
  {
    const tagCountList = await tagCount.get();
    console.log('Fetching data from DB');

    // Set data to Redis
    const resTagCountList = JSON.stringify(tagCountList);
    client.setex("tagCount", 1800, resTagCountList);

    res.send({data: setRespnse("tagCount", resTagCountList)});
  }
  catch(error)
  {
    console.error(error);
    res.status(500);
  }
}

// Cache middleware
function cache(req, res, next)
{
  client.get("tagCount", (err, tagCountList) =>
  {
    if (err) throw err;

    if (tagCountList !== null)
    {
      console.log('Fetching data from Redis');
      res.send( {data: setRespnse("tagCount", tagCountList)} );
    }
    else
    {
      next();
    }
  });
}

router.get('/', cache, getData);


module.exports = router;
