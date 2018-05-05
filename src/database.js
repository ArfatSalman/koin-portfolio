const { MongoClient } = require('mongodb');
const { DATABASE_URL } = require('./constants');

let DBInstance = null;

module.exports = () => new Promise((resolve, reject) => {
  if (DBInstance) {
    resolve(DBInstance);
  }
  MongoClient.connect(DATABASE_URL)
    .then((client) => {
      DBInstance = client;
      resolve(client);
    })
    .catch(err => reject(err));
});
