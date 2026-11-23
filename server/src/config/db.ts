import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

let cachedPromise: Promise<typeof mongoose> | null = null;

const connectDB = async (): Promise<typeof mongoose> => {
  // If already connected, reuse existing connection pool (vital for Vercel Serverless)
  if (mongoose.connection.readyState === 1) {
    return mongoose;
  }

  if (mongoose.connection.readyState === 2 && cachedPromise) {
    return cachedPromise;
  }

  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/travel_booking_db';

  try {
    cachedPromise = mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 10000,
    });

    const conn = await cachedPromise;
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error: any) {
    cachedPromise = null;
    console.error(`MongoDB connection error: ${error.message}`);
    // Only exit process in local stand-alone server development, NOT in serverless environments like Vercel
    if (process.env.NODE_ENV !== 'production' && !process.env.VERCEL) {
      process.exit(1);
    }
    throw error;
  }
};

export default connectDB;
