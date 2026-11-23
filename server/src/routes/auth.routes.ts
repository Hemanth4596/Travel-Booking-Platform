import express from 'express';
import { register, login, logout, getMe } from '../controllers/auth.controller';
import { protect } from '../middleware/auth';
import { authRateLimiter } from '../middleware/rateLimiter';

const router = express.Router();

router.post('/register', authRateLimiter, register);
router.post('/login', authRateLimiter, login);
router.post('/logout', logout);
router.get('/me', protect, getMe);

export default router;
