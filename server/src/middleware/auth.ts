import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../models/User';
import { isValidObjectId } from '../utils/security';
import { getDemoUserById } from '../utils/demoData';

interface AuthRequest extends Request {
  user?: any;
}

export const getJwtSecret = (): string => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    return 'travel_platform_default_jwt_secret_2026';
  }
  return secret;
};

export const protect = async (req: AuthRequest, res: Response, next: NextFunction) => {
  let token: string | undefined;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  } else if ((req as any).cookies && (req as any).cookies.jwt) {
    token = (req as any).cookies.jwt;
  }

  if (!token) {
    return res.status(401).json({ error: 'Not authorized, no token provided' });
  }

  try {
    const secret = getJwtSecret();
    const decoded: any = jwt.verify(token, secret);

    if (!decoded || !decoded.id || !isValidObjectId(decoded.id)) {
      return res.status(401).json({ error: 'Not authorized, token invalid' });
    }

    let user: any = null;
    try {
      user = await User.findById(decoded.id).select('-passwordHash');
    } catch (dbErr) {
      // Database might be temporarily unavailable; fall back to demo user
    }

    if (!user) {
      user = getDemoUserById(decoded.id);
    }

    if (!user) {
      return res.status(401).json({ error: 'Not authorized, user not found' });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Not authorized, token failed' });
  }
};

export const admin = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (req.user && req.user.role === 'ADMIN') {
    next();
  } else {
    res.status(403).json({ error: 'Forbidden: Admin access required' });
  }
};
