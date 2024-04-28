const { 
  app,
  supertest,
  assert,
  cleanDatabase,
} = require('./test-helper.js')
const { describe } = require('mocha');

const MenuItemSchema = require('../common/models/menu-item.json');
const MenuItem = app.registry.createModel(MenuItemSchema);
require('../common/models/menu-item.js')(MenuItem);

app.model(MenuItem, { dataSource: 'db' });

describe('MenuItem.create', function() {
  let menuItem1;
  let menuItem2;
  let menuItem3;

  beforeEach(async function() {
    menuItem1 = await MenuItem.create({ name: 'burger-one', price: 1.99 });
    menuItem2 = await MenuItem.create({ name: 'burger-two', price: 2.99 });
    menuItem3 = await MenuItem.create({ name: 'burger-three', price: 3.99 });
  });

  it('should fetch menu items', function(done) {
    supertest(app)
      .get('/api/menu-items')
      .end(function(err, res) {
        if (err) {
          done(err);
          return;
        }
  
        assert.strictEqual(res.status, 200, 'Expected status code 200');
  
        const expectedMenuItems = [menuItem1, menuItem2, menuItem3];

        res.body.forEach((menuItem, index) => {
          const expectedMenuItem = expectedMenuItems[index];
          assert.strictEqual(menuItem.name, expectedMenuItem.name, 'Expected menu item name');
          assert.strictEqual(menuItem.price, expectedMenuItem.price, 'Expected menu item price');
          assert.strictEqual(menuItem.description, undefined, 'Unexpected menu item description');
          assert.strictEqual(menuItem.image_name, undefined, 'Unexpected menu item image_name');
          assert.strictEqual(menuItem.image_url, undefined, 'Unexpected menu item image_url');
        });
        
        done();
      });
  });
  

  after(async function() {
    cleanDatabase();
  });
})
