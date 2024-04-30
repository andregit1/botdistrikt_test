'use strict';

module.exports = function(app) {
  var datasources = app.datasources.postgresql;

  datasources.autoupdate(function(err) {
    if (err) throw err;
    console.log('Models migrated for datasources');
  });
};
