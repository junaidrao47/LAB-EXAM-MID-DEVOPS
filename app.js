const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const keys = require('./config/keys');
const clientProm = require('prom-client');

// Register models and services
require('./services/cache');
require('./models/Book');
require('./models/Todo');

const app = express();
app.use(bodyParser.json());

// simple health endpoint (responds even before DB is ready)
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Connect to MongoDB
// Disable deprecated findAndModify (used by findOneAndUpdate / findOneAndDelete)
mongoose.set('useFindAndModify', false);
const ready = mongoose
  .connect(keys.mongoURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    // Fail faster when Mongo isn't reachable (shorten server selection timeout)
    serverSelectionTimeoutMS: 5000,
  })
  .then(() => {
    // register routes after DB connection
    require('./routes/bookRoutes')(app);
    require('./routes/todoRoutes')(app);

    // Prometheus metrics (disable during tests to avoid open handles)
    if (process.env.NODE_ENV !== 'test') {
      const collectDefaultMetrics = clientProm.collectDefaultMetrics;
      collectDefaultMetrics();

      app.get('/metrics', async (req, res) => {
        try {
          res.set('Content-Type', clientProm.register.contentType);
          res.send(await clientProm.register.metrics());
        } catch (err) {
          res.status(500).send(err.message);
        }
      });
    }
  })
  .catch(err => {
    console.error('Mongo connection error', err);
    throw err;
  });

module.exports = { app, ready };
