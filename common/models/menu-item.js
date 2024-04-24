'use strict';

const checkLoggedIn = require('../helpers/checkLoggedIn');

module.exports = function(Menuitem) {
  // Define the remote method to fetch all menuItems
  Menuitem.getAllMenuitems = function(callback) {
    Menuitem.find({}, function(err, menuItems) {
      if (err) {
        console.error('Error fetching menuItems:', err);
        return callback(err);
      }

      callback(null, menuItems);
    });
  };

  // Expose the remote method over REST
  Menuitem.remoteMethod('getAllMenuitems', {
    description: 'Get all menu items.',
    returns: { arg: 'data', type: 'array', root: true },
    http: { verb: 'get', path: '/' }
  }); 

  // Define the remote method to create a menu item
  Menuitem.createMenuItem = function(data, callback) {
    // Create the menu item
    Menuitem.create(data, function(err, menuItem) {
      if (err) {
        console.error('Error creating menu item:', err);
        return callback(err);
      }

      callback(null, menuItem);
    });
  };

  // Expose the remote method to create a menu item over REST
  Menuitem.remoteMethod('createMenuItem', {
    description: 'Create a new menu item.',
    accepts: [
      { 
        arg: 'data', 
        type: 'object', 
        http: { source: 'body' }, 
        description: 'Data of the menu item to be created.' 
      }
    ],
    returns: { arg: 'data', type: 'object', root: true },
    http: { verb: 'post', path: '/' }
  }); 
};
