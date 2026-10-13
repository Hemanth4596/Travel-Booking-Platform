import { Request, Response } from 'express';
import { Hotel } from '../models/Hotel';

export const getHotels = async (req: Request, res: Response) => {
  try {
    const { destination } = req.query;
    let query: any = { isActive: true };
    if (destination) query.destination = new RegExp(destination as string, 'i');
    const hotels = await Hotel.find(query);
    res.json(hotels);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getHotelById = async (req: Request, res: Response) => {
  try {
    const hotel = await Hotel.findById(req.params.id);
    if (hotel) res.json(hotel);
    else res.status(404).json({ error: 'Hotel not found' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
