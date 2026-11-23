import { Request, Response, NextFunction } from 'express';

interface RateLimitStore {
  [key: string]: { count: number; resetTime: number };
}

/**
 * Creates an in-memory rate limiter middleware to protect against brute-force attacks and abuse.
 * @param windowMs Time window in milliseconds
 * @param max Maximum requests allowed per window per IP
 * @param message Error message returned upon exceeding limit
 */
export const rateLimiter = (windowMs: number, max: number, message = 'Too many requests, please try again later.') => {
  const store: RateLimitStore = {};

  // Cleanup expired entries periodically to prevent memory leak
  setInterval(() => {
    const now = Date.now();
    for (const ip in store) {
      if (store[ip].resetTime <= now) {
        delete store[ip];
      }
    }
  }, windowMs * 2);

  return (req: Request, res: Response, next: NextFunction) => {
    // In Express behind proxies or local, pick reliable IP identifier
    const clientIp = (req.headers['x-forwarded-for'] as string)?.split(',')[0].trim() || req.ip || req.socket.remoteAddress || 'unknown';
    const now = Date.now();

    if (!store[clientIp] || store[clientIp].resetTime <= now) {
      store[clientIp] = { count: 1, resetTime: now + windowMs };
      return next();
    }

    store[clientIp].count++;

    if (store[clientIp].count > max) {
      const retryAfterSeconds = Math.ceil((store[clientIp].resetTime - now) / 1000);
      res.setHeader('Retry-After', retryAfterSeconds);
      return res.status(429).json({
        error: message,
        retryAfterSeconds
      });
    }

    next();
  };
};

// Preset limiters:
// Strict limiter for authentication endpoints: max 15 attempts per 15 minutes
export const authRateLimiter = rateLimiter(15 * 60 * 1000, 15, 'Too many authentication attempts. Please try again after 15 minutes.');

// General limiter for live telemetry / flight lookups: max 60 requests per minute
export const apiRateLimiter = rateLimiter(60 * 1000, 60, 'Too many requests. Please slow down.');
