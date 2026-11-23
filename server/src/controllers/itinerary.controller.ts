import { Response } from 'express';
import { Itinerary } from '../models/Itinerary';
import { isValidObjectId } from '../utils/security';

export const createItinerary = async (req: any, res: Response) => {
  try {
    const { title, destination, startDate, endDate, activities, notes } = req.body;

    if (!title || !destination || !startDate || !endDate) {
      return res.status(400).json({ error: 'Title, destination, startDate, and endDate are required' });
    }

    const itinerary = await Itinerary.create({
      userId: req.user._id,
      title: String(title).slice(0, 100),
      destination: String(destination).slice(0, 100),
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      activities: Array.isArray(activities) ? activities : [],
      notes: notes ? String(notes).slice(0, 500) : undefined,
    });

    res.status(201).json(itinerary);
  } catch (error: any) {
    console.error('[createItinerary error]:', error);
    res.status(500).json({ error: 'Failed to create itinerary' });
  }
};

export const getItineraries = async (req: any, res: Response) => {
  try {
    const itineraries = await Itinerary.find({ userId: req.user._id }).sort({ createdAt: -1 });
    res.json(itineraries);
  } catch (error: any) {
    console.error('[getItineraries error]:', error);
    res.status(500).json({ error: 'Failed to retrieve itineraries' });
  }
};

export const getItineraryById = async (req: any, res: Response) => {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) {
      return res.status(400).json({ error: 'Invalid itinerary ID format' });
    }

    const itinerary = await Itinerary.findOne({ _id: id, userId: req.user._id });
    if (itinerary) {
      return res.json(itinerary);
    }
    return res.status(404).json({ error: 'Itinerary not found' });
  } catch (error: any) {
    console.error('[getItineraryById error]:', error);
    return res.status(500).json({ error: 'Failed to retrieve itinerary' });
  }
};

export const updateItinerary = async (req: any, res: Response) => {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) {
      return res.status(400).json({ error: 'Invalid itinerary ID format' });
    }

    // Whitelist update fields to prevent mass assignment or privilege escalation
    const allowedUpdates: any = {};
    if (req.body.title !== undefined) allowedUpdates.title = String(req.body.title).slice(0, 100);
    if (req.body.destination !== undefined) allowedUpdates.destination = String(req.body.destination).slice(0, 100);
    if (req.body.startDate !== undefined) allowedUpdates.startDate = new Date(req.body.startDate);
    if (req.body.endDate !== undefined) allowedUpdates.endDate = new Date(req.body.endDate);
    if (req.body.activities !== undefined && Array.isArray(req.body.activities)) allowedUpdates.activities = req.body.activities;
    if (req.body.notes !== undefined) allowedUpdates.notes = String(req.body.notes).slice(0, 500);

    const itinerary = await Itinerary.findOneAndUpdate(
      { _id: id, userId: req.user._id },
      { $set: allowedUpdates },
      { new: true, runValidators: true }
    );

    if (itinerary) {
      return res.json(itinerary);
    }
    return res.status(404).json({ error: 'Itinerary not found' });
  } catch (error: any) {
    console.error('[updateItinerary error]:', error);
    return res.status(500).json({ error: 'Failed to update itinerary' });
  }
};

export const deleteItinerary = async (req: any, res: Response) => {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) {
      return res.status(400).json({ error: 'Invalid itinerary ID format' });
    }

    const itinerary = await Itinerary.findOneAndDelete({ _id: id, userId: req.user._id });
    if (itinerary) {
      return res.json({ message: 'Itinerary deleted' });
    }
    return res.status(404).json({ error: 'Itinerary not found' });
  } catch (error: any) {
    console.error('[deleteItinerary error]:', error);
    return res.status(500).json({ error: 'Failed to delete itinerary' });
  }
};
