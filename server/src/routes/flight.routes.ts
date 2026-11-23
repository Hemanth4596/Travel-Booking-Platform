import express from 'express';
import {
  getFlights,
  getFlightById,
  getLiveFlights,
  getLiveFlightByNumber,
} from '../controllers/flight.controller';
import { apiRateLimiter } from '../middleware/rateLimiter';

const router = express.Router();

// Aviation Edge Live Flight Radar endpoints (rate-limited)
router.get('/live', apiRateLimiter, getLiveFlights);
router.get('/live/search', apiRateLimiter, getLiveFlights);
router.get('/live/:flightNumber', apiRateLimiter, getLiveFlightByNumber);

// Bookable inventory flight endpoints
router.get('/', getFlights);
router.get('/:id', getFlightById);

export default router;
