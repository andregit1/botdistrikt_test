'use strict';

module.exports = function(Order) {
  Order.createOrder = function(data, req, callback) {
    let customerId;

    if (!req.session.userId) {
      let guestUniqueUsername = Math.floor(Math.random().toString(2) * Date.now()).toString(36);

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
      const timestampUnix = Math.floor(Date.now() / 1000); // Current Unix timestamp in seconds
      const transaction_uuid = `${table_number}-${timestampUnix}`;

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
};
