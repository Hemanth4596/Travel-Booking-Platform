import { Request, Response } from 'express';
import { User } from '../models/User';
import jwt from 'jsonwebtoken';
// Use bcryptjs for cross-platform compatibility on modern Node runtimes
// @ts-ignore
import bcrypt from 'bcryptjs';
import { z } from 'zod';

const registerSchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters').max(60, 'Name must be at most 60 characters'),
  email: z.string().trim().toLowerCase().email('Invalid email address').max(100, 'Email must be at most 100 characters'),
  password: z.string().min(6, 'Password must be at least 6 characters').max(100, 'Password is too long'),
  phone: z.string().trim().max(25, 'Phone number too long').optional(),
});

const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

const getJwtSecret = (): string => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('FATAL: JWT_SECRET environment variable must be configured in production!');
    }
    return 'super_secret_key_for_development_only';
  }
  return secret;
};

const generateToken = (id: string) => {
  return jwt.sign({ id }, getJwtSecret(), {
    expiresIn: '30d',
  });
};

export const register = async (req: Request, res: Response) => {
  try {
    const parseResult = registerSchema.safeParse(req.body);
    if (!parseResult.success) {
      const issue = parseResult.error.issues[0];
      return res.status(400).json({ error: issue ? issue.message : 'Invalid input data' });
    }

    const { name, email, password, phone } = parseResult.data;

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ error: 'User with this email already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);
    const user = await User.create({ name, email, passwordHash, phone, role: 'USER' });

    if (user) {
      const token = generateToken(user._id.toString());
      res.cookie('jwt', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 30 * 24 * 60 * 60 * 1000,
      });
      return res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token,
      });
    } else {
      return res.status(400).json({ error: 'Failed to create user account' });
    }
  } catch (error: any) {
    console.error('[Register error]:', error);
    return res.status(500).json({ error: 'Registration failed due to a server error' });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const parseResult = loginSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({ error: 'Please enter a valid email and password' });
    }

    const { email, password } = parseResult.data;

    const user = await User.findOne({ email });
    if (user && typeof user.passwordHash === 'string' && (await bcrypt.compare(password, user.passwordHash))) {
      const token = generateToken(user._id.toString());
      res.cookie('jwt', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 30 * 24 * 60 * 60 * 1000,
      });
      return res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token,
      });
    }

    // Generic response to avoid revealing user enumeration
    return res.status(401).json({ error: 'Invalid email or password' });
  } catch (error: any) {
    console.error('[Login error]:', error);
    return res.status(500).json({ error: 'Login failed due to a server error' });
  }
};

export const logout = (req: Request, res: Response) => {
  res.cookie('jwt', '', {
    httpOnly: true,
    expires: new Date(0),
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
  });
  return res.status(200).json({ message: 'Logged out successfully' });
};

export const getMe = async (req: any, res: Response) => {
  try {
    const user = await User.findById(req.user._id).select('-passwordHash');
    if (user) {
      return res.json(user);
    }
    return res.status(404).json({ error: 'User not found' });
  } catch (error: any) {
    return res.status(500).json({ error: 'Failed to retrieve profile' });
  }
};
