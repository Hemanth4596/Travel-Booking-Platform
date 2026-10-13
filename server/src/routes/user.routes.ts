import express from 'express';
import { updateProfile } from '../controllers/user.controller';
import { protect } from '../middleware/auth';

const router = express.Router();

router.patch('/me', protect, updateProfile);

export default router;
