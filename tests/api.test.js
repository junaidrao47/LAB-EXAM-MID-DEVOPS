const request = require('supertest');
const { app, ready } = require('../app');
const mongoose = require('mongoose');

beforeAll(async () => {
  // Ensure app is ready (Mongo connected)
  await ready;
});

afterAll(async () => {
  // Close mongoose connection after tests
  await mongoose.connection.close();
});

describe('API basic', () => {
  test('GET /api/todos returns 200 and array', async () => {
    const res = await request(app).get('/api/todos');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });
});


