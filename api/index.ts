import app from '../server/src/app';
import connectDB from '../server/src/config/db';

export default async function handler(req: any, res: any) {
  try {
    await connectDB();
  } catch (err: any) {
    console.error('Database connection error in Vercel handler:', err);
    return res.status(500).json({
      error: 'Database connection failed. Please ensure MONGODB_URI is configured in Vercel Environment Variables.',
      details: process.env.NODE_ENV === 'development' ? err?.message : undefined,
    });
  }

  return app(req, res);
}
