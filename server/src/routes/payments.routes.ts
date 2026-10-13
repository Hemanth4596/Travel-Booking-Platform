import express from 'express';
import {
  handleSimulatePayment,
  getBookingSimulationHistory,
} from '../controllers/payments.controller';
import { protect } from '../middleware/auth';

const router = express.Router();

router.use(protect);

router.post('/simulate', handleSimulatePayment);
router.get('/booking/:bookingId', getBookingSimulationHistory);

export default router;
