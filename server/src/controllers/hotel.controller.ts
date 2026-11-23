import { Request, Response } from 'express';
import { Hotel } from '../models/Hotel';
import { escapeRegex, isValidObjectId } from '../utils/security';
import { ensureDatabaseSeeded } from '../utils/autoSeed';

export const getHotels = async (req: Request, res: Response) => {
  try {
    const { destination } = req.query;
    const query: any = { isActive: true };

    if (destination && typeof destination === 'string') {
      const sanitizedDest = escapeRegex(destination.trim());
      if (sanitizedDest) {
        query.destination = new RegExp(sanitizedDest, 'i');
      }
    }

    let hotels = await Hotel.find(query).limit(100);
    if (hotels.length === 0 && !destination) {
      await ensureDatabaseSeeded();
      hotels = await Hotel.find(query).limit(100);
    }
    res.json(hotels);
  } catch (error: any) {
    console.error('[getHotels error]:', error);
    res.status(500).json({ error: 'Failed to search hotels' });
  }
};

export const getHotelById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) {
      return res.status(400).json({ error: 'Invalid hotel ID format' });
    }

    const hotel = await Hotel.findById(id);
    if (hotel) {
      return res.json(hotel);
    }
    return res.status(404).json({ error: 'Hotel not found' });
  } catch (error: any) {
    console.error('[getHotelById error]:', error);
    return res.status(500).json({ error: 'Failed to fetch hotel details' });
  }
};
