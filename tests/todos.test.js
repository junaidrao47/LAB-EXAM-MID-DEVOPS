const request = require('supertest');
const { app, ready } = require('../app');
const mongoose = require('mongoose');
const redis = require('redis');
const util = require('util');
const keys = require('../config/keys');

let redisClient;

beforeAll(async () => {
  // wait for DB connection
  await ready;
  // create redis client using project config (respects env vars)
  redisClient = redis.createClient({ host: keys.redisHost, port: keys.redisPort });
  redisClient.hget = util.promisify(redisClient.hget);
});

afterAll(async () => {
  await mongoose.connection.close();
  if (redisClient) redisClient.quit();
});

describe('Todos CRUD and cache', () => {
  let createdId;

  test('Create todo', async () => {
    const res = await request(app)
      .post('/api/todos')
      .send({ title: 'Test create', dueDate: null })
      .set('Accept', 'application/json');

    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('_id');
    createdId = res.body._id;
  });

  test('Read todos and populate cache', async () => {
    // first request - should populate cache
    const res1 = await request(app).get('/api/todos');
    expect(res1.statusCode).toBe(200);
    expect(Array.isArray(res1.body)).toBe(true);

    // check Redis hash exists for todos
    const hashKey = JSON.stringify('todos');
    const queryKey = JSON.stringify({});
    const cached = await redisClient.hget(hashKey, queryKey);
    expect(cached).toBeTruthy();
  });

  test('Update todo and invalidate cache', async () => {
    const res = await request(app).put(`/api/todos/${createdId}`).send({ completed: true });
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('completed', true);

    // cache should be cleared (hget returns null)
    const hashKey = JSON.stringify('todos');
    const queryKey = JSON.stringify({});
    const cached = await redisClient.hget(hashKey, queryKey);
    // cache may be cleared by clearKey which deletes the hash; expect null
    expect(cached === null || cached === undefined).toBeTruthy();
  });

  test('Delete todo', async () => {
    const res = await request(app).delete(`/api/todos/${createdId}`);
    expect([200, 204]).toContain(res.statusCode);
  });
});
