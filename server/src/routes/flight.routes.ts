import express from 'express';
import {
  getFlights,
  getFlightById,
  getLiveFlights,
  getLiveFlightByNumber,
} from '../controllers/flight.controller';

const router = express.Router();

// Aviation Edge Live Flight Radar endpoints
router.get('/live', getLiveFlights);
router.get('/live/search', getLiveFlights);
router.get('/live/:flightNumber', getLiveFlightByNumber);

// Bookable inventory flight endpoints
router.get('/', getFlights);
router.get('/:id', getFlightById);

export default router;
