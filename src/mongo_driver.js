import dotenv from 'dotenv';
import mongo from 'mongodb';
const MongoClient = mongo.MongoClient;

dotenv.config();

const connect_mongo_client = async (callback) => {
    // do something
    return MongoClient.connect(process.env.MONGO_DB_URL, { useNewUrlParser: true, useUnifiedTopology: true }, callback);
}

export default { connect_mongo_client, mongo};