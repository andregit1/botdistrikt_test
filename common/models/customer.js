'use strict';

module.exports = function(Customer) {
  // Register endpoint
  Customer.register = function(data, callback) {
    const username = data.username;

    Customer.findOne({ where: { username: username }}, function(err, existingCustomer) {
      if (err) return callback(err);
      if (existingCustomer) {
        var error = new Error('Username must be unique');
        error.statusCode = 400;
        return callback(error);
      } else {
        // Create the new customer
        Customer.create({ username: username }, function(err, customer) {
          if (err) {
            return callback(err);
          }
          callback(null, customer);
        });
      }
    });
  };

  // Expose the register method over REST for registration
  Customer.remoteMethod('register', {
    description: 'Register a new customer.',
    accepts: [
      {
        arg: 'data',
        type: 'object',
        http: { source: 'body' },
        required: true,
        root: true
      },
    ],
    returns: { arg: 'data', type: 'Customer', root: true },
    http: { verb: 'post', path: '/register' },
  });

  // Remote method for login
  Customer.login = function(data, req, callback) {
    const username = data.username;
    
    Customer.findOne({ where: { username: username } }, function(err, user) {
      if (err) return callback(err);
      if (!user) {
        var error = new Error('Invalid username');
        error.statusCode = 401;
        return callback(error);
      }

      // Store the user's ID in the session
      req.session.userId = user.id;

      callback(null, user);
    });
  };

  // Expose the login method over REST
  Customer.remoteMethod('login', {
    description: 'Login with unique username.',
    accepts: [
      {
        arg: 'data',
        type: 'object',
        http: { source: 'body' },
        required: true,
        root: true
      },
      { arg: 'req', type: 'object', http: { source: 'req' } }
    ],
    returns: { arg: 'data', type: 'Customer', root: true },
    http: { verb: 'post', path: '/login' },
  });

  // Remote method for logout
  Customer.logout = function(req, callback) {
    // Clear the user's ID from the session
    req.session.destroy(function(err) {
      if (err) return callback(err);
      callback(null, { message: 'Logout successful' });
    });
  };

  // Expose the logout method over REST
  Customer.remoteMethod('logout', {
    accepts: [
      { arg: 'req', type: 'object', http: { source: 'req' } }
    ],
    returns: { arg: 'message', type: 'string' },
    http: { verb: 'post', path: '/logout' }
  });

  // Define the fields to be returned
  const PROFILE_FIELDS = { email: true, phone: true, username: true };

  // Expose the method to get the current user's profile
  Customer.profile = function(req, callback) {
    // Get the current user's ID from the session
    var userId = req.session.userId;
    
    if (!userId) {
      var error = new Error('User not logged in');
      error.statusCode = 401;
      return callback(error);
    }
    
    // Find the user by ID and return the specified fields
    Customer.findById(userId, { fields: PROFILE_FIELDS }, function(err, user) {
      if (err) return callback(err);
      if (!user) {
        var error = new Error('User not found');
        error.statusCode = 404;
        return callback(error);
      }
      callback(null, user);
    });
  };

  // Expose the profile method over REST
  Customer.remoteMethod('profile', {
    accepts: [
      { arg: 'req', type: 'object', http: { source: 'req' } }
    ],
    returns: { arg: 'data', type: 'object', root: true },
    http: { verb: 'get', path: '/profile' }
  });

  // Expose the method to update user details
  Customer.updateDetails = function(data, req, callback) {
    // Get the current user's ID from the session
    var userId = req.session.userId;
    
    if (!userId) {
      var error = new Error('User not logged in');
      error.statusCode = 401;
      return callback(error);
    }

    // Find the user by ID and update their details
    Customer.findById(userId, function(err, user) {
      if (err) return callback(err);
      if (!user) {
        var error = new Error('User not found');
        error.statusCode = 404;
        return callback(error);
      }
      user.updateAttributes(data, function(err, updatedUser) {
        if (err) return callback(err);
        callback(null, updatedUser);
      });
    });
  };

  // Expose the updateDetails method over REST
  Customer.remoteMethod('updateDetails', {
    description: 'Update the details of the logged-in user.',
    accepts: [
      { arg: 'data', type: 'object', model: 'Customer', http: { source: 'body' } },
      { arg: 'req', type: 'object', http: { source: 'req' } }
    ],
    returns: { arg: 'data', type: 'object', root: true },
    http: { verb: 'put', path: '/profile/update' }
  });

  // Define the remote method to fetch all customers
  Customer.getAllCustomers = function(callback) {
    Customer.find({}, function(err, customers) {
      if (err) {
        console.error('Error fetching customers:', err);
        return callback(err);
      }

      callback(null, customers);
    });
  };

  // Expose the remote method over REST
  Customer.remoteMethod('getAllCustomers', {
    description: 'Get all customers.',
    returns: { arg: 'data', type: 'array', root: true },
    http: { verb: 'get', path: '/' }
  });  
};
