import { Response } from 'express';
import { Booking } from '../models/Booking';
import { Notification } from '../models/Notification';
import { v4 as uuidv4 } from 'uuid';
import paymentSimulationService from '../services/paymentSimulation.service';

export const createBooking = async (req: any, res: Response) => {
  try {
    const { bookingType, itemId, itemSnapshot, travelDetails, passengerOrGuestDetails, priceBreakdown, totalAmount } = req.body;
    
    const booking = await Booking.create({
      bookingReference: uuidv4().split('-')[0].toUpperCase(),
      userId: req.user._id,
      bookingType,
      itemId,
      itemSnapshot,
      travelDetails,
      passengerOrGuestDetails,
      priceBreakdown,
      totalAmount,
    });
    
    res.status(201).json(booking);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getMyBookings = async (req: any, res: Response) => {
  try {
    const bookings = await Booking.find({ userId: req.user._id }).sort({ createdAt: -1 });
    res.json(bookings);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getBookingById = async (req: any, res: Response) => {
  try {
    const booking = await Booking.findOne({ _id: req.params.id, userId: req.user._id });
    if (booking) res.json(booking);
    else res.status(404).json({ error: 'Booking not found' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const simulatePayment = async (req: any, res: Response) => {
  try {
    const { success, requestedOutcome, paymentMethod, methodDetails, idempotencyKey } = req.body;
    let outcome = requestedOutcome;
    if (!outcome) {
      outcome = success === false ? 'SIMULATED_FAILURE' : 'SIMULATED_SUCCESS';
    }

    const result = await paymentSimulationService.processSimulation({
      bookingId: req.params.id,
      userId: req.user._id,
      requestedOutcome: outcome,
      paymentMethod: paymentMethod || 'CARD',
      methodDetails,
      idempotencyKey,
    });

    res.json(result.booking);
  } catch (error: any) {
    const status = error.status || 500;
    res.status(status).json({ error: error.message });
  }
};

export const cancelBooking = async (req: any, res: Response) => {
  try {
    const booking = await Booking.findOne({ _id: req.params.id, userId: req.user._id });
    if (!booking) return res.status(404).json({ error: 'Booking not found' });
    
    booking.bookingStatus = 'CANCELLED';
    if (booking.paymentStatus === 'SUCCESS') {
      booking.paymentStatus = 'REFUNDED';
    }
    await booking.save();
    
    await Notification.create({
      userId: req.user._id,
      type: 'BOOKING_UPDATE',
      title: 'Booking Cancelled',
      message: `Your booking ${booking.bookingReference} has been cancelled.`,
      relatedBookingId: booking._id
    });
    
    res.json(booking);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
