const mongoose = require('mongoose');

module.exports.connectToDB = () => {
    const mongoUri = process.env.MONGO_URI || process.env.mongoURI || process.env.MONGODB_URI || process.env.mongodbUri;

    if (!mongoUri) {
        console.warn('MongoDB URI is not set. Add MONGO_URI to .env.local or .env to enable database connection.');
        return Promise.resolve(false);
    }

    return mongoose.connect(mongoUri)
        .then(() => {
            console.log('Connected to MongoDB');
        })
        .catch((err) => {
            console.log('Error connecting to MongoDB:', err);
        });
};