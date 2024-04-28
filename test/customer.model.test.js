const { 
  app,
  agent,
  assert, 
  supertest,
  cleanDatabase, 
  createSessionCookie,
  destroySession,
} = require('../test/test-helper.js')
const CustomerSchema = require('../common/models/customer.json');
const { describe } = require('mocha');
const Customer = app.registry.createModel(CustomerSchema);
require('../common/models/customer.js')(Customer);
app.model(Customer, { dataSource: 'db' });

// Define the test case
describe('POST /api/customers/register', function() {
  beforeEach(cleanDatabase);
  it('should register a new customer', function(done) {
    try {
      const testData = { username: 'testuser' };
      supertest(app)
        .post('/api/customers/register')
        .send(testData)
        .expect(200)
        .end(function(err, res) {
          if (err) throw err;
          assert.equal(res.body.username, testData.username);
          done();
        });
    } catch (error) {
      done(error);
    }
  });

  it('should return an error if username already exists', function(done) {
    Customer.create({ username: 'existinguser' }, function(err) {
      if (err) return done(err);
  
      const existingCustomerData = { username: 'existinguser' };
      supertest(app)
        .post('/api/customers/register')
        .send(existingCustomerData)
        .expect(400)
        .end(function(err, res) {
          if (err) return done(err);
          assert.equal(res.body.error.message, 'Username must be unique');
          done();
        });
    });
  });
});

describe('Customer session', function() {
  let firstCustomer;
  let otherCustomer;

  beforeEach(async function() {
    firstCustomer = await Customer.create({
      username: 'botdistrikt',
      phone: '',
      email: ''
    });

    otherCustomer = await Customer.create({
      username: 'botdistrikt2',
      phone: '',
      email: ''
    });
  });

  describe('POST /api/customers/login', function() {
    it('should log in a customer with valid username', function (done) {
      const sessionCookie = createSessionCookie({ userId: firstCustomer.id });
      supertest(app)
        .post('/api/customers/login')
        .set('cookie', [sessionCookie])
        .send({ username: 'botdistrikt' })
        .end(function(err, res) {
          if(err) {
            assert.strictEqual(response.status, 401, 'Expected status code 401');
            done(err)
            return
          }

          assert.strictEqual(res.status, 200, 'Expected status code 200');
          done();
        })
    });
    
    it('should return an error for invalid username', async function() {
      const sessionCookie = await createSessionCookie({ userId: null });
      const response = await supertest(app)
        .post('/api/customers/login')
        .set('cookie', [sessionCookie])
        .send({ username: 'invaliduser' });

      assert.strictEqual(response.status, 401, 'Expected status code 401');
    });
  });

  describe('POST /api/customers/logout', function() {
    let sessionCookie;
    
    before(async function() {
      sessionCookie = await createSessionCookie({ userId: firstCustomer.id });
    });

    it('should log out a customer successfully', async function () {
      const response = await supertest(app)
        .post('/api/customers/logout')
        .set('Cookie', [sessionCookie]);

      await destroySession(sessionCookie);

      assert.strictEqual(response.status, 200, 'Expected status code 200');
    });
  });

  after(async function() {
    await createSessionCookie({ userId: null });
    cleanDatabase();
  });
});

describe('Customer.profile', function() {
  let firstCustomer;
  let otherCustomer;

  beforeEach(async function() {
    firstCustomer = await Customer.create({
      username: 'profile',
      phone: '',
      email: ''
    });

    otherCustomer = await Customer.create({
      username: 'profile2',
      phone: '',
      email: ''
    });
  });

  it('should return the user profile for a logged-in user', function(done) {
    createSessionCookie({ userId: firstCustomer.id }, function(err, sessionCookie) {
      if (err) {
        done(err);
        return;
      }
  
      agent
        .get('/api/customers/profile')
        .set('cookie', sessionCookie)
        .end(function(err, profileRes) {
          if (err) {
            done(err);
            return;
          }

          assert.strictEqual(profileRes.status, 200, 'Expected status code 200');
          done();
        });
    });
    done()
  });

  it('should return an error for a user not logged in', function(done) {
    destroySession(firstCustomer.id, function(err, sessionCookie) {  
      agent
        .get('/api/customers/profile')
        .set('cookie', sessionCookie)
        .end(function(err, profileRes) {
          if (err) {
            done(err);
            return;
          }

          assert.strictEqual(profileRes.status, 401, 'Expected status code 401');
          done();
        });
    });
    done()
  });

  it('should return an error for a user not found', function(done) {
    const randomUserId = Math.floor(Math.random() * 1000);
  
    createSessionCookie({ userId: randomUserId }, function(err, sessionCookie) {
      if (err) {
        done(err);
        return;
      }
  
      agent
        .get('/api/customers/profile')
        .set('cookie', sessionCookie)
        .end(function(err, profileRes) {
          if (err) {
            done(err);
            return;
          }

          assert.strictEqual(profileRes.status, 404, 'Expected status code 404');
          done();
        });
    });

    done()
  });

  after(async function() {
    await destroySession();
    cleanDatabase();
  });
});

describe('Customer.updateDetails', function() {
  let firstCustomer;

  beforeEach(async function() {
    firstCustomer = await Customer.create({
      username: 'botdistrikt',
      phone: '',
      email: 'test@example.com'
    });

    sessionCookie = await createSessionCookie({ userId: firstCustomer.id });
  });

  it('should update user details with valid data', function(done) {
    createSessionCookie({ userId: firstCustomer.id }, function(err, sessionCookie) {
      if (err) {
        done(err);
        return;
      }
  
      const newData = {
        email: 'newemail@example.com'
      };

      agent
        .put('/api/customers/profile/update')
        .set('cookie', sessionCookie)
        .send(newData)
        .end(function(err, profileRes) {
          if (err) {
            done(err);
            return;
          }

          assert.strictEqual(profileRes.status, 200, 'Expected status code 200');
          done();
        });
    });
    done()
  });

  it('should return an error for invalid email format', function(done) {
    createSessionCookie({ userId: firstCustomer.id }, function(err, sessionCookie) {
      if (err) {
        done(err);
        return;
      }
  
      const newData = {
        email: 'invalidemail'
      };

      agent
        .put('/api/customers/profile/update')
        .set('cookie', sessionCookie)
        .send(newData)
        .end(function(err, profileRes) {
          if (err) {
            done(err);
            return;
          }

          assert.strictEqual(profileRes.status, 400, 'Expected status code 400');
          done();
        });
    });
    done()
  });

  it('should return an error for user not logged in', function(done) {
    destroySession(firstCustomer.id, function(err, sessionCookie) {  
      const newData = {
        email: 'newemail2@example.com'
      };

      agent
        .put('/api/customers/profile/update')
        .set('cookie', sessionCookie)
        .send(newData)
        .end(function(err, profileRes) {
          if (err) {
            done(err);
            return;
          }

          assert.strictEqual(profileRes.status, 401, 'Expected status code 401');
          done();
        });
    });
    done()
  });

  it('should return an error if user not found', function(done) {
    createSessionCookie({ userId: 1234 }, function(err, sessionCookie) {
      if (err) {
        done(err);
        return;
      }
  
      const newData = {
        email: 'newemail@example.com'
      };

      agent
        .put('/api/customers/profile/update')
        .set('cookie', sessionCookie)
        .send(newData)
        .end(function(err, profileRes) {
          if (err) {
            done(err);
            return;
          }

          assert.strictEqual(profileRes.status, 404, 'Expected status code 404');
          done();
        });
    });
    done()
  });

  after(async function() {
    await destroySession();
    cleanDatabase();
  });
});
