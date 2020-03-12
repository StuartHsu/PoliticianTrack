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

async function generateFakeNewsData()
{
  await promiseSql.query('INSERT INTO news (id, title, description, content, href, pubTime, publisher, intent, intent_score) VALUES ?;', [news.map(x => Object.values(x))]);
}

async function generateFakeFiltercountData()
{
  await promiseSql.query('INSERT INTO filtercount (id, name, type, count, parent_name, parent_id) VALUES ?;', [filtercount.map(x => Object.values(x))]);
}

async function generateFakeNewstagData()
{
  await promiseSql.query('INSERT INTO newstag (id, news_id, tag_id) VALUES ?;', [newstag.map(x => Object.values(x))]);
}

async function generateFakeTagverifyData()
{
  await promiseSql.query('INSERT INTO tagverify (id, name, type, count, status) VALUES ?;', [tagverify.map(x => Object.values(x))]);
}


async function generateFakeData()
{

  if (ENVIRONMENT !== "test")
  {
    console.log("Not in test enviroment");
    return;
  }

  await generateFakeNewsData();
  await generateFakeFiltercountData();
  await generateFakeNewstagData();
  await generateFakeTagverifyData();

}

async function truncateFakeData()
{
  if (ENVIRONMENT !== "test")
  {
    console.log("Not in test enviroment");
    return;
  }

  const setForeignKey = async function(status)
  {
    await promiseSql.query('SET FOREIGN_KEY_CHECKS = ?;', status);
  };

  const truncateTable = async function(table)
  {
    await promiseSql.query(`TRUNCATE TABLE ${table};`);
  };

  await setForeignKey(0);
  await truncateTable('news');
  await truncateTable('filtercount');
  await truncateTable('newstag');
  await truncateTable('tagverify');
  await setForeignKey(1);
}

function closeDBConnection()
{
  await mysql.con.end();
}

module.exports = {
    generateFakeData,
    truncateFakeData,
    closeDBConnection
};
