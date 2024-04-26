const { assert, supertest, app, cleanDatabase } = require('../test/test-helper.js')
const CustomerSchema = require('../common/models/customer.json');
const Customer = app.registry.createModel(CustomerSchema);
require('../common/models/customer.js')(Customer);
app.model(Customer, { dataSource: 'db' });

beforeEach(cleanDatabase);

// Define the test case
describe('POST /api/customers/register', function() {
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

// // Test suite for Customer login endpoint
// describe('POST /api/customers/login', function() {
  
//   let registeredUser;

//   // Register a customer before testing login
//   before(function(done) {
//     const testData = {
//       username: 'botdistrikt',
//       phone: '',
//       email: ''
//     };
    
//     supertest(app)
//       .post('/api/customers/register')
//       .send(testData)
//       .expect(200)
//       .end(function(err, res) {
//         if (err) return done(err);
//         registeredUser = res.body;
//         done();
//       });
//   });

//   // Test case for successful login
//   it('should log in a customer with valid username', function(done) {
//     const testData = { username: 'botdistrikt' };

//     // Make a POST request to the login endpoint
//     supertest(app)
//       .post('/api/customers/login')
//       .send(testData)
//       .expect(200)
//       .end(function(err, res) {
//         if (err) return done(err);
//         assert.equal(res.body, registeredUser); // Ensure correct user object is returned
//         done(); // Signal completion of the test
//       });
//   });

//   // Test case for login with invalid username
//   it('should return an error for invalid username', function(done) {
//     const testData = { username: 'invaliduser' };

//     // Make a POST request to the login endpoint
//     supertest(app)
//       .post('/api/customers/login')
//       .send(testData)
//       .expect(401)
//       .end(function(err, res) {
//         if (err) return done(err);
//         done();
//       });
//   });
// });

// Test suite for Customer login endpoint
describe('POST /api/customers/login', function() {
  
  let registeredUser;

  // Register a customer before testing login
  before(function(done) {
    const testData = {
      username: 'botdistrikt',
      phone: '',
      email: ''
    };
    
    // Register the customer
    supertest(app)
      .post('/api/customers/register')
      .send(testData)
      .expect(200)
      .end(function(err, res) {
        if (err) return done(err);

        // Retrieve the registered user from the database
        Customer.find({ where: { username: testData.username } }, function(err, users) {
          if (err) return done(err);
          registeredUser = users[0]; // Store the registered user
          console.log('Registered user:', registeredUser); // Log the registered user
          done();
        });
      });
  });

  // Test case for successful login
  it('should log in a customer with valid username', function(done) {
    // const testData = { username: 'botdistrikt' };

    // Make a POST request to the login endpoint
    supertest(app)
      .post('/api/customers/login')
      .send({ username: 'botdistrikt' })
      .expect(200)
      .end(function(err, res) {
        if (err) return done(err);
        // assert.equal(res.body, registeredUser); // Ensure correct user object is returned
        assert.equal(res.body.username, registeredUser.username);

        done(); // Signal completion of the test
      });
  });

  // Test case for login with invalid username
  it('should return an error for invalid username', function(done) {
    const testData = { username: 'invaliduser' };

    // Make a POST request to the login endpoint
    supertest(app)
      .post('/api/customers/login')
      .send(testData)
      .expect(401)
      .end(function(err, res) {
        if (err) return done(err);
        done();
      });
  });
});
