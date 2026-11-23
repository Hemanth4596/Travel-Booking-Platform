import app from '../server/src/app';
import connectDB from '../server/src/config/db';
import { ensureDatabaseSeeded } from '../server/src/utils/autoSeed';

export default async function handler(req: any, res: any) {
  try {
    await connectDB();
    // Automatically seed inventory if new database is empty
    ensureDatabaseSeeded().catch((e) => console.error('AutoSeed background warning:', e));
  } catch (err: any) {
    console.warn('[Vercel Serverless]: Database connection failed. Entering resilient demo mode:', err?.message);
  }

  return app(req, res);
}
