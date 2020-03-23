require('dotenv').config();

const app = require('../app');
const request = require('supertest');
const {ENVIRONMENT} = process.env;
const {truncateFakeData, generateFakeData, closeDBConnection} = require('./fakeDataGenerator');

beforeAll(async (done) => {
  if (ENVIRONMENT !== 'test') {
    throw 'Not in test enviroment';
  }

  await truncateFakeData();
  await generateFakeData();
  done();
});

describe('Test news endpoint', function() {
  test('test news json data', async function(done) {
    const response = await request(app)
        .post('/api/news/getNews/normal')
        .send({
          politician: ['nt14'],
          issue: []
        })
        .set('Content-Type', 'application/json');

    expect(response.status).toBe(200);
    expect(response.body)
        .toStrictEqual({
          data:
        {
          news:
          [
            {
              id: 14,
              title: 'nt14',
              description: 'nd14',
              content: 'nc14',
              href: 'nh14',
              pubTime: '2020/02/18 14:52',
              publisher: 'np14',
              tag:
              [
                {
                  tagName: 'nt14',
                  tagType: 'NRP'
                }
              ]
            }
          ]
        }
        }
        );
    done();
  }, 50000);

  test('test politician_say intent', async function(done) {
    const response = await request(app)
        .post('/api/news/getNews/normal')
        .send({
          politician: [],
          issue: []
        })
        .set('Content-Type', 'application/json');

    expect(response.status).toBe(200);
    const newsListId = [];
    for (let i = 0; i < response.body.data.news.length; i++) {
      newsListId.push(response.body.data.news[i].id);
    }
    expect(newsListId).toEqual(expect.arrayContaining([1, 2, 4, 7, 9, 10, 11, 12, 13, 14]));
    done();
  }, 50000);

  test('test compare route', async function(done) {
    const response = await request(app)
        .post('/api/news/getNews/normal')
        .send({
          politician: ['韓國瑜', '柯文哲'],
          issue: ['武漢肺炎']
        })
        .set('Content-Type', 'application/json');

    expect(response.status).toBe(200);
    const newsListId = [];
    for (let i = 0; i < response.body.data.news.length; i++) {
      newsListId.push(response.body.data.news[i].id);
    }
    expect(newsListId).toEqual(expect.arrayContaining([4, 5, 7]));
    done();
  }, 50000);

  test('test paging', async function(done) {
    const response = await request(app)
        .post('/api/news/getNews/normal')
        .send({
          politician: [],
          issue: []
        })
        .set('Content-Type', 'application/json');

    expect(response.status).toBe(200);
    expect(response.body.data.next_paging).toBe(1);
    done();
  }, 50000);
});

afterAll(async (done) => {
  closeDBConnection();
  done();
});
