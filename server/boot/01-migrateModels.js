'use strict';

module.exports = function(app, callback) {
  var datasources = app.datasources.postgresql;

  datasources.autoupdate(function(err) {
    if (err) {
      callback(err);
    } else {
      console.log('\nModels migrated for datasources\n');
      callback(null); // Signal that migration is complete
    }
  });
};
