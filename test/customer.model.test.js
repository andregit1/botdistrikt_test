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

  // Register a customer before testing login
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

// Test suite for Customer login endpoint
describe('Customer.profile', function() {
  let firstCustomer;
  let otherCustomer;

  // Register a customer before testing login
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

  // Test case for successful retrieval of user profile
  it('should return the user profile for a logged-in user', async function() {
    const sessionCookie = await createSessionCookie({ userId: firstCustomer.id });
    const response = await supertest(app).get('/api/customers/profile').set('Cookie', [sessionCookie]);
    assert.strictEqual(response.status, 200, 'Expected status code 200');
  });

  // Test case for user not logged in
  it('should return an error for a user not logged in', async function() {
    // Send the request without setting the session cookie
    const response = await supertest(app).get('/api/customers/profile');
    assert.strictEqual(response.status, 401, 'Expected status code 401');
  });

  // Test case for user not found
  it('should return an error for a user not found', async function() {
    // Create a session cookie with non-existing userId
    const invalidSessionCookie = await createSessionCookie({ userId: 1001 });
    const response = await supertest(app).get('/api/customers/profile').set('Cookie', [invalidSessionCookie]);
    assert.strictEqual(response.status, 404, 'Expected status code 404');
  });

  after(async function() {
    // Destroy the session after all test cases are executed
    await destroySession();
    cleanDatabase();
  });
});

describe('Customer.updateDetails', function() {
  let firstCustomer;
  let sessionCookie;

  beforeEach(async function() {
    firstCustomer = await Customer.create({
      username: 'botdistrikt',
      phone: '',
      email: 'test@example.com' // Initial valid email
    });

    sessionCookie = await createSessionCookie({ userId: firstCustomer.id });
  });

  it('should update user details with valid data', async function() {
    const newData = {
      email: 'newemail@example.com' // Valid new email format
    };

    const response = await supertest(app)
      .put('/api/customers/profile/update')
      .set('Cookie', sessionCookie)
      .send(newData);

    assert.strictEqual(response.status, 200, 'Expected status code 200');
    assert.strictEqual(response.body.email, newData.email, 'Expected email to be updated');
  });

  it('should return an error for invalid email format', async function() {
    const newData = {
      email: 'invalidemail' // Invalid email format
    };

    const response = await supertest(app)
      .put('/api/customers/profile/update')
      .set('Cookie', sessionCookie)
      .send(newData);

    assert.strictEqual(response.status, 400, 'Expected status code 400 for invalid email format');
    assert.strictEqual(response.body.error, 'Invalid email format', 'Expected error message for invalid email format');
  });

  it('should return an error for user not logged in', async function() {
    const newData = {
      email: 'newemail@example.com' // Valid new email format
    };

    const response = await supertest(app)
      .put('/api/customers/profile/update')
      .send(newData);

    assert.strictEqual(response.status, 401, 'Expected status code 401 for user not logged in');
    assert.strictEqual(response.body.error, 'User not logged in', 'Expected error message for user not logged in');
  });

  it('should return an error if user not found', async function() {
    const newData = {
      email: 'newemail@example.com' // Valid new email format
    };

    // Use an invalid user ID to simulate user not found
    sessionCookie = await createSessionCookie({ userId: 'invalidUserId' });

    const response = await supertest(app)
      .put('/api/customers/profile/update')
      .set('Cookie', sessionCookie)
      .send(newData);

    assert.strictEqual(response.status, 404, 'Expected status code 404 for user not found');
    assert.strictEqual(response.body.error, 'User not found', 'Expected error message for user not found');
  });

  after(async function() {
    await destroySession();
    cleanDatabase();
  });
});
