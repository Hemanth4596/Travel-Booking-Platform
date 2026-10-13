import { Request, Response } from 'express';
import { Cab } from '../models/Cab';

export const getCabs = async (req: Request, res: Response) => {
  try {
    const cabs = await Cab.find({ isActive: true });
    res.json(cabs);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getCabById = async (req: Request, res: Response) => {
  try {
    const cab = await Cab.findById(req.params.id);
    if (cab) res.json(cab);
    else res.status(404).json({ error: 'Cab not found' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
