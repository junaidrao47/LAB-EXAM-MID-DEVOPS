const host = process.env.MONGO_HOST || 'localhost';
const port = process.env.MONGO_PORT || '27018';
const dbName = process.env.MONGO_DB_NAME || 'testdb';

module.exports = {
  // Build the Mongo URI from env with sensible defaults for local dev/test
  mongoURI: `mongodb://${host}:${port}/${dbName}`,
  redisPort: process.env.REDIS_PORT || '6379',
  redisHost: process.env.REDIS_HOST || 'localhost'
};
