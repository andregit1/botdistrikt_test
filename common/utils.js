function uniqueUsername() {
  return Math.floor(Math.random().toString(2) * Date.now()).toString(36);
};

function transactionUUID(table_number) {
  const timestampUnix = Math.floor(Date.now() / 1000); // Current Unix timestamp in seconds
  const transaction_uuid = `${table_number}-${timestampUnix}`;
  return transaction_uuid;
}

module.exports = {
  uniqueUsername,
  transactionUUID
}