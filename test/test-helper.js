const assert = require('assert');
const supertest = require('supertest');
const loopback = require('loopback');
const app = loopback();
const async = require('async');
const session = require('express-session');
const cookie = require('cookie');
const { promisify } = require('util');
const signature = require('cookie-signature');
const { MemoryStore } = require('express-session');
const sessionStore = new MemoryStore();
const stubSessionMiddleware = function(req, res, next) {
  req.session = {}; // Stubbing req.session
  next();
};

app.dataSource('db', { connector: 'memory' });
app.use('/api', loopback.rest());
app.middleware('session', stubSessionMiddleware);
app.use(session({
  secret: 'your-secret-key',
  resave: false,
  saveUninitialized: true,
  store: sessionStore,
  cookie: { 
    maxAge: 3600000,
    secure: false
  }
}));

// Function to create a session cookie with the desired session value
async function createSessionCookie(sessionValue) {
  const fakeReq = { sessionStore };
  sessionStore.generate(fakeReq); // Generate a session ID
  Object.assign(fakeReq.session, sessionValue); // Assign the session value
  await promisify(fakeReq.session.save).call(fakeReq.session); // Save the session

  // Sign the session ID with the secret
  const signed = `s:${signature.sign(fakeReq.sessionID, 'your-secret-key')}`;
  return cookie.serialize('connect.sid', signed);
}

// Function to destroy a session
// async function destroySession(req) {
//   await promisify(req.session.destroy).call(req.session);
// }

// Function to destroy a session by session ID
async function destroySession(sessionId) {
  await new Promise((resolve, reject) => {
    sessionStore.destroy(sessionId, (err) => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
}


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
  app,
  assert, 
  supertest,
  cleanDatabase, 
  createSessionCookie,
  destroySession
};
