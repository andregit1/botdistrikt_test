'use strict';

module.exports = function(app) {
  var MenuItem = app.models.MenuItem;

  const menuItems = [
    {
      "name": "Product 1",
      "description": "Description for Product 1",
      "price": "1.99",
      "image_name": "product-one",
      "image_url": "/assets/images/product-one.jpg",
      "is_default": true
    },
    {
      "name": "Product 2",
      "description": "Description for Product 2",
      "price": "2.99",
      "image_name": "product-two",
      "image_url": "/assets/images/product-two.jpg",
      "is_default": true
    },
    {
      "name": "Product 3",
      "description": "Description for Product 3",
      "price": "3.99",
      "image_name": "product-three",
      "image_url": "/assets/images/product-three.jpg",
      "is_default": true
    },
    {
      "name": "Product 4",
      "description": "Description for Product 4",
      "price": "0.99",
      "image_name": "product-four",
      "image_url": "/assets/images/product-four.jpg",
      "is_default": true
    },
    {
      "name": "Product 5",
      "description": "Description for Product 5",
      "price": "0.99",
      "image_name": "product-five",
      "image_url": "/assets/images/product-five.jpg",
      "is_default": true
    },
    {
      "name": "Product 6",
      "description": "Description for Product 6",
      "price": "0.99",
      "image_name": "product-six",
      "image_url": "/assets/images/product-six.jpg",
      "is_default": true
    }
  ];

  

  // Function to find all existing menu items
  function findAllMenuItems(callback) {
    MenuItem.find({}, (err, existingMenuItems) => {
      if (err) {
        callback(err);
      } else {
        callback(null, existingMenuItems);
      }
    });
  }

  // Array to store new menu items
  const newMenuItems = [];

  // Function to filter out existing menu items
  function filterNewMenuItems(existingMenuItems, callback) {
    menuItems.forEach(menuItem => {
      const existingItem = existingMenuItems.find(item => item.name === menuItem.name && item.is_default === menuItem.is_default);
      if (!existingItem) {
        newMenuItems.push(menuItem);
      }
    });
    callback();
  }

  // Function to create new menu items
  function createNewMenuItems(callback) {
    MenuItem.create(newMenuItems, (err, createdMenuItems) => {
      if (err) {
        callback(err);
      } else {
        callback(null, createdMenuItems);
      }
    });
  }

  // Find all existing menu items
  findAllMenuItems((err, existingMenuItems) => {
    if (err) {
      console.error('Error finding existing menu items:', err);
    } else {
      // Filter out new menu items
      filterNewMenuItems(existingMenuItems, () => {
        // Create new menu items
        createNewMenuItems((err, createdMenuItems) => {
          if (err) {
            console.error('Error creating new menu items:', err);
          } else {
            if (createdMenuItems?.length > 0) {
              console.log('\nSuccess seeding data for menu items');
            } else {
             console.log('\nMenu items already seeded');
            }
          }
        });
      });
    }
  });
 
};
