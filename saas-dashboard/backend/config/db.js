import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

let isConnected = false;
let memServer = null;

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000
    });
    isConnected = true;
    console.log(`MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    console.log('Atlas unreachable, starting local in-memory database...');
    try {
      memServer = await MongoMemoryServer.create();
      const memUri = memServer.getUri();
      await mongoose.connect(memUri);
      isConnected = true;
      console.log(`MongoDB Memory Server running on ${memUri}`);
    } catch (memError) {
      isConnected = false;
      console.error('Database connection error:', memError.message);
      console.error('Server will start but database operations will fail.');
    }
  }
};

export const checkDB = () => {
  if (!isConnected) {
    throw new Error('Database not connected. Please start MongoDB and restart the server.');
  }
};

export default connectDB;
