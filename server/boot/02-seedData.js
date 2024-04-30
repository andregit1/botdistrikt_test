'use strict';

module.exports = function(app) {

  var Menuitem = app.models.Menuitem;

  const menuItems = [
    {
      "name": "Product 1",
      "description": "Description for Product 1",
      "price": 1.99,
      "image_name": "product-one",
      "image_url": "/assets/images/product-one.jpg",
      "is_default": true
    },
    {
      "name": "Product 2",
      "description": "Description for Product 2",
      "price": 2.99,
      "image_name": "product-two",
      "image_url": "/assets/images/product-two.jpg",
      "is_default": true
    },
    {
      "name": "Product 3",
      "description": "Description for Product 3",
      "price": 3.99,
      "image_name": "product-three",
      "image_url": "/assets/images/product-three.jpg",
      "is_default": true
    },
    {
      "name": "Product 4",
      "description": "Description for Product 4",
      "price": 0.99,
      "image_name": "product-four",
      "image_url": "/assets/images/product-four.jpg",
      "is_default": true
    },
    {
      "name": "Product 5",
      "description": "Description for Product 5",
      "price": 0.99,
      "image_name": "product-five",
      "image_url": "/assets/images/product-five.jpg",
      "is_default": true
    },
    {
      "name": "Product 6",
      "description": "Description for Product 6",
      "price": 0.99,
      "image_name": "product-six",
      "image_url": "/assets/images/product-six.jpg",
      "is_default": true
    }
  ];

  // Promisified version of Menuitem.findOne
  function findOneAsync(criteria) {
    return new Promise((resolve, reject) => {
      Menuitem.findOne(criteria, (err, data) => {
        if (err) reject(err);
        resolve(data);
      });
    });
  }

  // Promisified version of Menuitem.create
  function createAsync(data) {
    return new Promise((resolve, reject) => {
      Menuitem.create(data, (err, createdItem) => {
        if (err) reject(err);
        resolve(createdItem);
      });
    });
  }

  // Function to create menu items
  async function createMenuItems() {
    for (const menuItem of menuItems) {
      try {
        const existingItem = await findOneAsync({
          where: {
            and: [
              { name: menuItem.name },
              { is_default: true }
            ]
          }
        });

        if (!existingItem) {
          const createdItem = await createAsync(menuItem);
          console.log('Menu item created:', createdItem);
        } else {
          console.log('Menu item already exists:', existingItem.name);
        }
      } catch (err) {
        console.error('Error creating menu item:', err);
      }
    }
  }

  // Call the function to create menu items
  createMenuItems();
};
