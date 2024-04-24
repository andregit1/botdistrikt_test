module.exports = function disableDefaultRemoteMethods(Model) {
  const defaultRemoteMethods = [
    'create', 'replaceOrCreate', 'patchOrCreate', 'exists', 'findById', 'find',
    'findOne', 'destroyById', 'deleteById', 'count', 'replaceById', 'prototype.patchAttributes',
    'createChangeStream', 'updateAll', 'replaceOrCreate', 'replaceById', 'upsertWithWhere'
  ];

  // Disable default remote methods for the specified model
  defaultRemoteMethods.forEach(methodName => {
    Model.disableRemoteMethodByName(methodName);
  });
}

/**
 * doesn't need anymore since using this :
 * "options": {
      "remoting": {
        "sharedMethods": {
          "*": false
        }
      }
    }
*/