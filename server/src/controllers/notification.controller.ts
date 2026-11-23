import { Response } from 'express';
import { Notification } from '../models/Notification';
import { isValidObjectId } from '../utils/security';

export const getNotifications = async (req: any, res: Response) => {
  try {
    const notifications = await Notification.find({ userId: req.user._id }).sort({ createdAt: -1 }).limit(100);
    res.json(notifications);
  } catch (error: any) {
    console.error('[getNotifications error]:', error);
    res.status(500).json({ error: 'Failed to retrieve notifications' });
  }
};

export const markAsRead = async (req: any, res: Response) => {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) {
      return res.status(400).json({ error: 'Invalid notification ID format' });
    }

    const notification = await Notification.findOneAndUpdate(
      { _id: id, userId: req.user._id },
      { $set: { read: true } },
      { new: true }
    );

    if (notification) {
      return res.json(notification);
    }
    return res.status(404).json({ error: 'Notification not found' });
  } catch (error: any) {
    console.error('[markAsRead error]:', error);
    return res.status(500).json({ error: 'Failed to update notification' });
  }
};

export const markAllAsRead = async (req: any, res: Response) => {
  try {
    await Notification.updateMany({ userId: req.user._id }, { $set: { read: true } });
    res.json({ message: 'All notifications marked as read' });
  } catch (error: any) {
    console.error('[markAllAsRead error]:', error);
    res.status(500).json({ error: 'Failed to mark notifications as read' });
  }
};
