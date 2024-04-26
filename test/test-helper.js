const assert = require('assert');
const supertest = require('supertest');
const loopback = require('loopback');
const app = loopback();
const async = require('async');
const session = require('express-session');

app.dataSource('db', { connector: 'memory' });
app.use('/api', loopback.rest());
app.use(session({
  secret: 'your-secret-key',
  resave: true,
  saveUninitialized: true,
  cookie: { maxAge: 3600000 }
}));

// perform database cleanup before each test
function cleanDatabase(done) {
  async.series([
    function(callback) {
      // Delete all records from each model's table
      async.each(app.models(), function(model, cb) {
        model.destroyAll(cb);
      }, callback);
    },
    function(callback) {
      // Alternatively, drop and recreate tables
      app.datasources.db.automigrate(callback);
    }
  ], done);
}

module.exports = {
  assert, supertest, app, cleanDatabase
};
