const { assert, supertest, createSessionCookie, destroySession, app, cleanDatabase } = require('../test/test-helper.js')
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
  let agent;
  let firstCustomer;
  let otherCustomer;

  // Register a customer before testing login
  beforeEach(async function() {
    agent = supertest.agent(app); // Create a supertest agent
    
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

  // Test suite for Customer login endpoint
  describe('POST /api/customers/login', function() {
    // Test case for successful login
    it('should log in a customer with valid username', async function () {
      const sessionCookie = await createSessionCookie({ userId: firstCustomer.id });
      const response = await supertest(app)
        .post('/api/customers/login')
        .set('cookie', [sessionCookie])
        .send({ username: 'botdistrikt' });

      assert.strictEqual(response.status, 200, 'Expected status code 200');
    });
    

    // Test case for login with invalid username
    it('should return an error for invalid username', async function() {
      const sessionCookie = await createSessionCookie({ userId: null });
      const response = await supertest(app)
        .post('/api/customers/login')
        .set('cookie', [sessionCookie])
        .send({ username: 'invaliduser' });

      assert.strictEqual(response.status, 401, 'Expected status code 401');
    });
  });

  // Test suite for Customer logout endpoint
  describe('POST /api/customers/logout', function() {
    // Test case for successful logout
    let sessionCookie;
    
    before(async function() {
      sessionCookie = await createSessionCookie({ userId: firstCustomer.id });
    });

    it('should log out a customer successfully', async function () {
      const response = await supertest(app)
        .post('/api/customers/logout')
        .set('Cookie', [sessionCookie]); // Set the session cookie in the request

      // Destroy the session after logging out
      await destroySession(sessionCookie);

      assert.strictEqual(response.status, 200, 'Expected status code 200');
    });
  });

  after(async function() {
    await createSessionCookie({ userId: null });
    cleanDatabase();
  });
});
