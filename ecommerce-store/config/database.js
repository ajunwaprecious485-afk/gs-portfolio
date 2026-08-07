require('dotenv').config();
const mongoose = require('mongoose');

mongoose.set('strictQuery', false);

const connectDB = async () => {
  const connectWithRetry = async (retries = 5) => {
    try {
      await mongoose.connect(process.env.MONGODB_URI, {
        tlsAllowInvalidCertificates: true,
        serverSelectionTimeoutMS: 10000,
        socketTimeoutMS: 45000
      });
      console.log('MongoDB connected successfully!');
    } catch (err) {
      if (retries > 0) {
        console.log('MongoDB retry ' + (6 - retries) + '/5...');
        await new Promise(r => setTimeout(r, 3000));
        return connectWithRetry(retries - 1);
      }
      console.error('MongoDB connection failed:', err.message);
    }
  };
  await connectWithRetry();
};

module.exports = connectDB;