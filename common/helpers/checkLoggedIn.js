module.exports = function checkLoggedIn(req, callback) {
  var userId = req.session.userId;
  if (!userId) {
    var error = new Error('User not logged in');
    error.statusCode = 401;
    return callback(error);
  }
  return userId;
}
