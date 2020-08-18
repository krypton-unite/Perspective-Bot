// const mongo = require('mongodb');
// const MongoClient = mongo.MongoClient;
// require('dotenv').config();

// MongoClient.connect(process.env.MONGO_DB_URL, { useNewUrlParser: true, useUnifiedTopology: true }, (err, client) => {

//     if (err) throw err;

//     console.log(client);

//     client.close();
// });

const mongo = require('mongodb');
const MongoClient = mongo.MongoClient;

require('dotenv').config();

const connect_mongo_client = async (callback) => {
    // do something
    return MongoClient.connect(process.env.MONGO_DB_URL, { useNewUrlParser: true, useUnifiedTopology: true }, callback);
}

module.exports.connect_mongo_client = connect_mongo_client;
module.exports.mongo = mongo;