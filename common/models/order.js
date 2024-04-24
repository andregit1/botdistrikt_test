'use strict';

module.exports = function(Order) {
  // Create a new order with associated menu items
  Order.createOrder = function(data, req, callback) {
    // Check if customer is logged in
    if (!req.session.userId) {
      const error = new Error('Authentication required');
      error.statusCode = 401;
      return callback(error);
    }

    const { menu_item_ids, transaction_date, table_number, total_price } = data;
    const timestampUnix = Math.floor(Date.now() / 1000); // Current Unix timestamp in seconds
    const transaction_uuid = `${table_number}-${timestampUnix}`;

    // Create the order
    Order.create({
      customer_id: req.session.userId, // Associate order with logged-in customer
      transaction_uuid: transaction_uuid,
      transaction_date: transaction_date,
      table_number: table_number,
      total_price: total_price,
    }, function(err, order) {
      if (err) {
        console.error('Error creating order:', err);
        return callback(err);
      }

      const orderId = order.id; // Get the ID of the newly created order

      // Construct the SQL query to insert rows into the intermediary table
      const sql = `
        INSERT INTO menuitemorder (orderid, menuitemid)
        VALUES ${menu_item_ids.map(itemId => `(${orderId}, ${itemId})`).join(', ')}
      `;

      // Execute the SQL query
      Order.dataSource.connector.execute(sql, (err, result) => {
        if (err) {
          console.error('Error associating menu items with order:', err);
          return callback(err);
        }
      });

      // Fetch customer data
      order.customer(function(err, customer) {
        if (err) {
          console.error('Error fetching customer data:', err);
          return callback(err);
        }

        // Fetch ordered items
        order.menuItems(function(err, menuItems) {
          if (err) {
            console.error('Error fetching ordered items:', err);
            return callback(err);
          }

          // Construct the response object
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
  };

  // Define the remote method
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
