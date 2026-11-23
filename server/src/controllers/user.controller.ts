import { Response } from 'express';
import { User } from '../models/User';
// @ts-ignore
import bcrypt from 'bcryptjs';

export const updateProfile = async (req: any, res: Response) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (req.body.name && typeof req.body.name === 'string') {
      const trimmedName = req.body.name.trim();
      if (trimmedName.length >= 2 && trimmedName.length <= 60) {
        user.name = trimmedName;
      }
    }

    if (req.body.phone !== undefined) {
      user.phone = typeof req.body.phone === 'string' ? req.body.phone.trim().slice(0, 25) : undefined;
    }

    if (req.body.password) {
      if (typeof req.body.password !== 'string' || req.body.password.length < 6) {
        return res.status(400).json({ error: 'New password must be at least 6 characters long' });
      }
      const salt = await bcrypt.genSalt(10);
      user.passwordHash = await bcrypt.hash(req.body.password, salt);
    }

    await user.save();
    return res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone,
    });
  } catch (error: any) {
    console.error('[updateProfile error]:', error);
    return res.status(500).json({ error: 'Failed to update profile' });
  }
};
