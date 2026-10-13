import express from 'express';
import { createBooking, getMyBookings, getBookingById, simulatePayment, cancelBooking } from '../controllers/booking.controller';
import { protect } from '../middleware/auth';

const router = express.Router();

router.use(protect);

router.post('/', createBooking);
router.get('/my', getMyBookings);
router.get('/:id', getBookingById);
router.post('/:id/payment/simulate', simulatePayment);
router.patch('/:id/cancel', cancelBooking);

export default router;
