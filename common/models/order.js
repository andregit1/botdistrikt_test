'use strict';

const { uniqueUsername, transactionUUID } = require('../utils')
const async = require('async');

module.exports = function(Order) {
  Order.createOrder = function(data, req, callback) {
    let customerId;

    if (!req.session.userId) {
      let guestUniqueUsername = uniqueUsername()

      Order.app.models.Customer.create({ username: guestUniqueUsername }, function(err, customer) {
        if (err) {
          console.error('Error creating temporary customer:', err);
          err.statusCode = 500;
          return callback(err);
        }

        customerId = customer.id;
        console.log("customer from order > ", customer);
        continueOrderCreation(customerId);
      });
    } else {
        console.log("customer from order if logged in > ", req.session.userId);
        customerId = req.session.userId;
        continueOrderCreation(customerId);
    }

    function continueOrderCreation(customerId) {
      const { menu_item_ids, transaction_date, table_number, total_price } = data;
      const transaction_uuid = transactionUUID(table_number);

      Order.create({
          customer_id: customerId,
          transaction_uuid: transaction_uuid,
          transaction_date: transaction_date,
          table_number: table_number,
          total_price: total_price,
      }, function(err, order) {
        if (err) {
          console.error('Error creating order:', err);
          err.statusCode = 500;
          return callback(err);
        }

        const sql = `
          INSERT INTO menuitemorder (orderid, menuitemid)
          VALUES ${menu_item_ids.map(itemId => `(${order.id}, ${itemId})`).join(', ')}
        `;

        Order.dataSource.connector.execute(sql, (err, result) => {
          if (err) {
            console.error('Error associating menu items with order:', err);
            return callback(err);
          }
        });

        order.customer(function(err, customer) {
          if (err) {
            console.error('Error fetching customer data:', err);
            return callback(err);
          }

          order.menuItems(function(err, menuItems) {
            if (err) {
              console.error('Error fetching ordered items:', err);
              return callback(err);
            }

            const response = {
              id: order.id,
              customer: customer,
              ordered_items: menuItems,
              transaction_uuid: order.transaction_uuid,
              transaction_date: order.transaction_date,
              table_number: order.table_number,
              total_price: order.total_price,
            };

            console.log('Order created with associated menu items:', response);
            callback(null, response);
          });
        });
      });
    }
  };

  Order.remoteMethod('createOrder', {
    description: 'Create a new order with associated menu items.',
    accepts: [
      { arg: 'data', type: 'object', http: { source: 'body' } },
      { arg: 'req', type: 'object', http: { source: 'req' } },
    ],
    returns: { arg: 'order', type: 'object', root: true },
    http: { verb: 'post', path: '/' }
  });
 
  
  Order.histories = function(req, callback) {

    var userId = req.session.userId;

    if (!userId) {
      var error = new Error('Please log in to continue.');
      error.statusCode = 401;
      return callback(error);
    }

    Order.find({ where: { customer_id: req.session.userId }}, function(err, orders) {
      if (err) {
        console.error('Error fetching orders:', err);
        return callback(err);
      }
  
      const orderData = [];
  
      // Iterate over each order to fetch associated customer and menu items
      async.eachSeries(orders, function(order, next) {
        order.menuItems(function(err, menuItems) {
          if (err) {
            console.error('Error fetching ordered items:', err);
            return next(err);
          }

          const response = {
            id: order.id,
            ordered_items: menuItems,
            transaction_uuid: order.transaction_uuid,
            transaction_date: order.transaction_date,
            table_number: order.table_number,
            total_price: order.total_price,
          };

          orderData.push(response);
          next();
        });
      }, function(err) {
        if (err) {
          console.error('Error processing orders:', err);
          return callback(err);
        }
  
        callback(null, orderData);
      });
    });
  };
  
  // Expose the remote method over REST
  Order.remoteMethod('histories', {
    description: 'Get all order histories.',
    accepts: [ { arg: 'req', type: 'object', http: { source: 'req' } } ],
    returns: { arg: 'data', type: 'array', root: true },
    http: { verb: 'get', path: '/histories' }
  });  
};
