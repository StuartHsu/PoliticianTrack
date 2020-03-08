require('dotenv').config()
const { ENVIRONMENT } = process.env;
const mysql = require("../util/mysqlcon.js");
const promiseSql = require("../util/promiseSql.js");
const
{
  news,
  filtercount,
  newstag,
  tagverify
} = require('./fakeData');

async function _createFakeNews()
{
  await promiseSql.query('INSERT INTO news (id, title, description, content, href, pubTime, publisher, intent, intent_score) VALUES ?;', [news.map(x => Object.values(x))]);
}

async function _createFakeFiltercount()
{
  await promiseSql.query('INSERT INTO filtercount (id, name, type, count, parent_name, parent_id) VALUES ?;', [filtercount.map(x => Object.values(x))]);
}

async function _createFakeNewstag()
{
  await promiseSql.query('INSERT INTO newstag (id, news_id, tag_id) VALUES ?;', [newstag.map(x => Object.values(x))]);
}

async function _createFakeTagverify()
{
  await promiseSql.query('INSERT INTO tagverify (id, name, type, count, status) VALUES ?;', [tagverify.map(x => Object.values(x))]);
}


function createFakeData()
{

  if (ENVIRONMENT !== "test")
  {
    console.log("Not in test enviroment");
    return;
  }

  return _createFakeNews()
    .then(() => {return _createFakeFiltercount();})
    .then(() => {return _createFakeNewstag();})
    .then(() => {return _createFakeTagverify();})
    .catch(console.log);
}

function truncateFakeData()
{
  if (ENVIRONMENT !== "test")
  {
    console.log("Not in test enviroment");
    return;
  }

  console.log("Truncate fake data");
  const setForeignKey = async function(status)
  {
    await promiseSql.query('SET FOREIGN_KEY_CHECKS = ?;', status);
  };

  const truncateTable = async function(table)
  {
    await promiseSql.query(`TRUNCATE TABLE ${table};`);
  };

  return setForeignKey(0)
    .then(() => {return truncateTable('news');})
    .then(() => {return truncateTable('filtercount');})
    .then(() => {return truncateTable('newstag');})
    .then(() => {return truncateTable('tagverify');})
    .then(() => {return setForeignKey(1);})
    .catch(console.log);
}

function closeConnection()
{
  return mysql.con.end();
}

module.exports = {
    createFakeData,
    truncateFakeData,
    closeConnection
};
