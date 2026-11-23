import { Request, Response, NextFunction } from 'express';

export const cookieParser = (req: Request, res: Response, next: NextFunction) => {
  const cookieHeader = req.headers.cookie;
  if (!cookieHeader) {
    (req as any).cookies = {};
    return next();
  }

  const cookies: Record<string, string> = {};
  const pairs = cookieHeader.split(';');

  for (const pair of pairs) {
    const idx = pair.indexOf('=');
    if (idx !== -1) {
      const key = pair.substring(0, idx).trim();
      const val = pair.substring(idx + 1).trim();
      try {
        cookies[key] = decodeURIComponent(val);
      } catch {
        cookies[key] = val;
      }
    }
  }

  (req as any).cookies = cookies;
  next();
};
