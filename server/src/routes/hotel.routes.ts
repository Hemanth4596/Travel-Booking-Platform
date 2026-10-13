import express from 'express';
import { getHotels, getHotelById } from '../controllers/hotel.controller';

const router = express.Router();

router.get('/', getHotels);
router.get('/:id', getHotelById);

export default router;
