const app = require('../app');
require('dotenv').config()
const request = require('supertest');
const { ENVIRONMENT } = process.env;
const mysql = require("../util/mysqlcon.js");
const { truncateFakeData, createFakeData, closeConnection } = require('./fakeDataGenerator');

beforeAll(async (done) => {
  if (ENVIRONMENT !== "test")
  {
    throw "Not in test enviroment";
  }

  await truncateFakeData();
  await createFakeData();
  done()
});

describe('Test news endpoint', function()
{
  // test('test news json data', async function(done)
  // {
  //   const response = await request(app)
  //   .post('/api/news/getNews/normal')
  //   .send(
  //     {
  //       politician: ["韓國瑜"],
  //       issue: []
  //     })
  //   .set('Content-Type', 'application/json')
  //
  //   expect(response.status).toBe(200);
  //   expect(response.body)
  //   .toStrictEqual(
  //     {
  //       data:
  //       {
  //         news:
  //         [
  //           {
  //             id: 1,
  //             title: "團圓飯哪裡吃？　韓國瑜：除夕沉澱心情陪家人",
  //             description: "今天(23日)是小年夜，也是過年連續假期的第一天，不過高雄市長韓國瑜卻繼續上班，上午率隊視察左營蓮池潭風景區，拚在地觀光，替即將到來的春節出遊潮把關環境，也透露年假會回北部陪家人沈澱休息，他從除夕休到初三，初四上工發紅包。高雄市長韓國瑜vs.當地人員：「裡面有24孝，我們都照古禮。」小年夜韓市長扮演...",
  //             content: "今天(23日)是小年夜，也是過年連續假期的第一天，不過高雄市長韓國瑜卻繼續上班，上午率隊視察左營蓮池潭風景區，拚在地觀光，替即將到來的春節出遊潮把關環境，也透露年假會回北部陪家人沈澱休息，他從除夕休到初三，初四上工發紅包。高雄市長韓國瑜vs.當地人員：「裡面有24孝，我們都照古禮。」小年夜韓市長扮演觀光大使，來到春秋閣，先走一趟龍虎塔。高雄市長韓國瑜：「入龍頭出虎尾，原來是有意義的。」龍頭進虎尾出，除掉去年壞運勢，韓國瑜親自出馬，要hold住高雄旅遊品質，徒步視察蓮池潭，一下車還檢查公廁乾不乾淨，小年夜拚觀光，韓市長漫步在蓮池潭風景區，大家好奇市長過年休幾天，會在哪裡吃團圓飯。高雄市長韓國瑜：「沉澱一下，陪陪家人，長輩住在北部，就陪長輩吃年夜飯，但是我們高雄市都有留守，全職勤務表都已經排出來了，所以24小時每一天，都有一個副市長級的留守。」邊品嘗百年老店的棋餅，透露自己年假要沉澱休息，回北部陪陪家人，也強調三位副市長都會輪值留守，他自己會提前銷假上班，攤開這幾天市府公布的行程，韓市長從除夕夜開始休假，一連休四天，初四就上工，開始發送市長紅包，而隔天大年初五，罷韓連署第二階段就要展開。高雄市長韓國瑜vs.記者：「罷韓第二階段你怎麼看，不說這個，謝謝喔，高雄市是一個欣欣向榮的城市，希望大家好朋友都來高雄走一走，大年初五開始愛河燈會，加上全世界第二條的這個塑膠廢料的藍鯨，都有非常多亮麗的景點。」卯起來推薦高雄燈會，以及新亮相的愛之鯨，對於罷免案這關鍵字，韓國瑜只聽不回，農曆年前最後一個公開行程，韓國瑜努力拚觀光，要讓市民跟業者有感，在罷韓連署開始前，交出漂亮成績。",
  //             href: "https://test.com",
  //             pubTime: "2020/01/23 12:47",
  //             publisher: "tvbs",
  //             tag: [
  //               {
  //                   "tagName": "韓國瑜",
  //                   "tagType": "NRP"
  //               }
  //             ]
  //           }
  //         ]
  //       }
  //     }
  //   );
  //   done();
  // },50000);

  // test('test politician_say intent', async function(done)
  // {
  //   const response = await request(app)
  //   .post('/api/news/getNews/normal')
  //   .send(
  //     {
  //       politician: [],
  //       issue: []
  //     })
  //   .set('Content-Type', 'application/json')
  //
  //   expect(response.status).toBe(200);
  //   const newsListId = [];
  //   for (let i = 0; i < response.body.data.news.length; i++)
  //   {
  //     newsListId.push(response.body.data.news[i].id);
  //   }
  //   expect(newsListId).toEqual(expect.arrayContaining([1,2,4,5,7,9,10,11]));
  //   done();
  // },50000);

  // test('test compare route', async function(done)
  // {
  //   const response = await request(app)
  //   .post('/api/news/getNews/normal')
  //   .send(
  //     {
  //       politician: ["韓國瑜", "柯文哲"],
  //       issue: ["武漢肺炎"]
  //     })
  //   .set('Content-Type', 'application/json')
  //
  //   expect(response.status).toBe(200);
  //   const newsListId = [];
  //   for (let i = 0; i < response.body.data.news.length; i++)
  //   {
  //     newsListId.push(response.body.data.news[i].id);
  //   }
  //   expect(newsListId).toEqual(expect.arrayContaining([4,5,7]));
  //   done();
  // },50000);

  test('test paging', async function(done)
  {
    const response = await request(app)
    .post('/api/news/getNews/normal')
    .send(
      {
        politician: [],
        issue: []
      })
    .set('Content-Type', 'application/json')

    expect(response.status).toBe(200);
    expect(response.body.data.next_paging).toBe(1);
    done();
  },50000);

});

afterAll(async (done) => {
  closeConnection();
  done();
});
