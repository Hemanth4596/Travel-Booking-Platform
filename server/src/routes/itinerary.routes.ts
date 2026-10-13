import express from 'express';
import { createItinerary, getItineraries, getItineraryById, updateItinerary, deleteItinerary } from '../controllers/itinerary.controller';
import { protect } from '../middleware/auth';

const router = express.Router();

router.use(protect);

router.post('/', createItinerary);
router.get('/', getItineraries);
router.get('/:id', getItineraryById);
router.patch('/:id', updateItinerary);
router.delete('/:id', deleteItinerary);

export default router;
