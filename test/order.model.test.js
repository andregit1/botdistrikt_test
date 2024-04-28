const { 
  app,
  agent,
  assert,
  cleanDatabase, 
  createSessionCookie,
  destroySession,
} = require('./test-helper.js')
const { describe } = require('mocha');

const OrderSchema = require('../common/models/order.json');
const Order = app.registry.createModel(OrderSchema);
require('../common/models/order.js')(Order);

const CustomerSchema = require('../common/models/customer.json');
const Customer = app.registry.createModel(CustomerSchema);
require('../common/models/customer.js')(Customer);

const MenuItemSchema = require('../common/models/menu-item.json');
const MenuItem = app.registry.createModel(MenuItemSchema);
require('../common/models/menu-item.js')(MenuItem);

app.model(Customer, { dataSource: 'db' });
app.model(Order, { dataSource: 'db' });
app.model(MenuItem, { dataSource: 'db' });

describe('Order.create', function() {
  let firstCustomer;
  let menuItem1;
  let menuItem2;
  let menuItem3;
  let orderData;

  beforeEach(async function() {
    firstCustomer = await Customer.create({
      username: 'botdistrikt',
      phone: '',
      email: ''
    });

    menuItem1 = await MenuItem.create({ name: 'burger-one', price: 1.99 });
    menuItem2 = await MenuItem.create({ name: 'burger-two', price: 2.99 });
    menuItem3 = await MenuItem.create({ name: 'burger-three', price: 3.99 });

    orderData = {
      menu_item_ids: [menuItem1.id, menuItem2.id, menuItem3.id],
      transaction_date: '2024-04-28',
      table_number: 5,
      total_price: menuItem1.price + menuItem2.price + menuItem3.price
    };
  });

  it('should create an order for a logged-in user', function(done) {
    createSessionCookie({ userId: firstCustomer.id }, function(err, sessionCookie) {
      if (err) {
        done(err);
        return;
      }
 
      agent
        .post('/api/orders/create')
        .set('cookie', sessionCookie)
        .send(orderData)
        .end(function(err, orderRes) {
          if (err) {
            done(err);
            return;
          }

          assert.strictEqual(orderRes.status, 200, 'Expected status code 200');
          assert.strictEqual(orderRes.body.customer, firstCustomer, 'Expected customer object');
          assert.strictEqual(orderRes.body.ordered_items, [menuItem1, menuItem2, menuItem3], 'Expected menu items object');
          assert.strictEqual(orderRes.body.transaction_date, orderData.transaction_date, 'Expected transaction date to match');
          assert.strictEqual(orderRes.body.table_number, orderData.table_number, 'Expected table number to match');
          assert.strictEqual(orderRes.body.total_price, orderData.total_price, 'Expected total price to match');

          done();
        });
    });

    done();
  });

  it('should not create an order for unauthenticated user', function(done) {
    destroySession(firstCustomer.id, function(err, sessionCookie) {
      if (err) {
        done(err);
        return;
      }

      agent
        .post('/api/orders/create')
        .set('cookie', sessionCookie)
        .send(orderData)
        .end(function(err, orderRes) {
          if (err) {
            done(err);
            return;
          }

          assert.strictEqual(orderRes.status, 401, 'Expected status code 401');
          done();
        });
    });

    done();
  });

  after(async function() {
    await destroySession();
    cleanDatabase();
  });
})
