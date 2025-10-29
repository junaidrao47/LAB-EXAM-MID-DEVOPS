// Start server (require app module which exports { app, ready })
const { app, ready } = require('./app');

const PORT = process.env.PORT || 5000;
ready.then(() => {
  app.listen(PORT, () => {
    console.log('Listening on port', PORT);
  });
}).catch(err => {
  console.error('Failed to start app', err);
  process.exit(1);
});
