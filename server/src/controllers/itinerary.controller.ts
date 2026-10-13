import { Response } from 'express';
import { Itinerary } from '../models/Itinerary';

export const createItinerary = async (req: any, res: Response) => {
  try {
    const itinerary = await Itinerary.create({ ...req.body, userId: req.user._id });
    res.status(201).json(itinerary);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getItineraries = async (req: any, res: Response) => {
  try {
    const itineraries = await Itinerary.find({ userId: req.user._id }).sort({ createdAt: -1 });
    res.json(itineraries);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getItineraryById = async (req: any, res: Response) => {
  try {
    const itinerary = await Itinerary.findOne({ _id: req.params.id, userId: req.user._id });
    if (itinerary) res.json(itinerary);
    else res.status(404).json({ error: 'Itinerary not found' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const updateItinerary = async (req: any, res: Response) => {
  try {
    const itinerary = await Itinerary.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      req.body,
      { new: true }
    );
    if (itinerary) res.json(itinerary);
    else res.status(404).json({ error: 'Itinerary not found' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const deleteItinerary = async (req: any, res: Response) => {
  try {
    const itinerary = await Itinerary.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    if (itinerary) res.json({ message: 'Itinerary deleted' });
    else res.status(404).json({ error: 'Itinerary not found' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
