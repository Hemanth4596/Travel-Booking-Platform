import { Request, Response } from 'express';
import { Cab } from '../models/Cab';
import { isValidObjectId } from '../utils/security';
import { ensureDatabaseSeeded } from '../utils/autoSeed';

export const getCabs = async (req: Request, res: Response) => {
  try {
    let cabs = await Cab.find({ isActive: true }).limit(50);
    if (cabs.length === 0) {
      await ensureDatabaseSeeded();
      cabs = await Cab.find({ isActive: true }).limit(50);
    }
    res.json(cabs);
  } catch (error: any) {
    console.error('[getCabs error]:', error);
    res.status(500).json({ error: 'Failed to retrieve cabs' });
  }
};

export const getCabById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) {
      return res.status(400).json({ error: 'Invalid cab ID format' });
    }

    const cab = await Cab.findById(id);
    if (cab) {
      return res.json(cab);
    }
    return res.status(404).json({ error: 'Cab not found' });
  } catch (error: any) {
    console.error('[getCabById error]:', error);
    return res.status(500).json({ error: 'Failed to fetch cab details' });
  }
};
