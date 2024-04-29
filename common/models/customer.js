'use strict';

module.exports = function(Customer) {
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


  Customer.logout = function(req, callback) {
    // Clear the user's ID from the session
    delete req.session.userId
    // req.session.destroy(function(err) {
    //   if (err) return callback(err);
    //   callback(null, { message: 'Logout successful' });
    // });
    callback(null, 'Logout successful');
  };

  Customer.remoteMethod('logout', {
    accepts: [
      { arg: 'req', type: 'object', http: { source: 'req' } }
    ],
    returns: { arg: 'message', type: 'string' },
    http: { verb: 'post', path: '/logout' }
  });
  

  const PROFILE_FIELDS = { email: true, phone: true, username: true };
  Customer.profile = function(req, callback) {
    // Get the current user's ID from the session
    var userId = req.session.userId;
    
    if (!userId) {
      var error = new Error('Please log in to continue.');
      error.statusCode = 401;
      return callback(error);
    }
    
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

  Customer.remoteMethod('profile', {
    accepts: [
      { arg: 'req', type: 'object', http: { source: 'req' } }
    ],
    returns: { arg: 'data', type: 'object', root: true },
    http: { verb: 'get', path: '/profile' }
  });

  
  const EMAIL_REGEX = new RegExp("^[\\w\\.-]+@([\\w-]+\\.)+[\\w-]{2,4}$");
  Customer.updateDetails = function(data, req, callback) {
    var userId = req.session.userId;
    
    if (!userId) {
      var error = new Error('Please log in to continue.');
      error.statusCode = 401;
      return callback(error);
    }

     // Check if the provided email format is valid
     if (data.email && !EMAIL_REGEX.test(data.email)) {
      var error = new Error('Invalid email format');
      error.statusCode = 400;
      return callback(error);
    }

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

  Customer.remoteMethod('updateDetails', {
    description: 'Update the details of the logged-in user.',
    accepts: [
      { arg: 'data', type: 'object', model: 'Customer', http: { source: 'body' } },
      { arg: 'req', type: 'object', http: { source: 'req' } }
    ],
    returns: { arg: 'data', type: 'object', root: true },
    http: { verb: 'put', path: '/profile/update' }
  });



  Customer.getAllCustomers = function(callback) {
    Customer.find({}, function(err, customers) {
      if (err) {
        console.error('Error fetching customers:', err);
        return callback(err);
      }

      callback(null, customers);
    });
  };

  Customer.remoteMethod('getAllCustomers', {
    description: 'Get all customers.',
    returns: { arg: 'data', type: 'array', root: true },
    http: { verb: 'get', path: '/' }
  });  
};
