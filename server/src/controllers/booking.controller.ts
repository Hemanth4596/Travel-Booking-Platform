import { Response } from 'express';
import { Booking } from '../models/Booking';
import { Notification } from '../models/Notification';
import { Flight } from '../models/Flight';
import { Hotel } from '../models/Hotel';
import { Cab } from '../models/Cab';
import { v4 as uuidv4 } from 'uuid';
import paymentSimulationService from '../services/paymentSimulation.service';
import { isValidObjectId } from '../utils/security';

export const createBooking = async (req: any, res: Response) => {
  try {
    const {
      bookingType,
      itemId,
      itemSnapshot,
      travelDetails,
      passengerOrGuestDetails,
      totalAmount,
    } = req.body;

    // 1. Validate booking type
    if (!['FLIGHT', 'HOTEL', 'CAB'].includes(bookingType)) {
      return res.status(400).json({ error: 'Invalid booking type. Must be FLIGHT, HOTEL, or CAB.' });
    }

    // 2. Validate item ID
    if (!isValidObjectId(itemId)) {
      return res.status(400).json({ error: 'Invalid item ID format' });
    }

    // 3. Look up authoritative item in database to prevent price tampering
    let authoritativeBaseFare = 0;
    let authoritativeItemSnapshot = itemSnapshot || {};

    if (bookingType === 'FLIGHT') {
      const flight = await Flight.findOne({ _id: itemId, isActive: true });
      if (!flight) {
        return res.status(404).json({ error: 'Selected flight is no longer available' });
      }
      authoritativeBaseFare = flight.price;
      authoritativeItemSnapshot = {
        airline: flight.airline,
        flightNumber: flight.flightNumber,
        origin: flight.origin,
        destination: flight.destination,
        departureTime: flight.departureTime,
        arrivalTime: flight.arrivalTime,
        durationMinutes: flight.durationMinutes,
        cabin: flight.cabin,
        price: flight.price,
      };
    } else if (bookingType === 'HOTEL') {
      const hotel = await Hotel.findOne({ _id: itemId, isActive: true });
      if (!hotel) {
        return res.status(404).json({ error: 'Selected hotel is no longer available' });
      }
      const room = hotel.rooms.find((r: any) => r.name === itemSnapshot?.roomName) || hotel.rooms[0];
      if (!room) {
        return res.status(400).json({ error: 'No available rooms found for this hotel' });
      }
      authoritativeBaseFare = room.pricePerNight;
      authoritativeItemSnapshot = {
        hotelName: hotel.name,
        roomName: room.name,
        destination: hotel.destination,
        address: hotel.address,
        pricePerNight: room.pricePerNight,
      };
    } else if (bookingType === 'CAB') {
      const cab = await Cab.findOne({ _id: itemId, isActive: true });
      if (!cab) {
        return res.status(404).json({ error: 'Selected cab is no longer available' });
      }
      authoritativeBaseFare = cab.estimatedFare;
      authoritativeItemSnapshot = {
        vehicleType: cab.vehicleType,
        vehicleName: cab.vehicleName,
        passengerCapacity: cab.passengerCapacity,
        estimatedFare: cab.estimatedFare,
      };
    }

    // Calculate authoritative server-side price breakdown & total
    const authoritativeTaxes = Math.round(authoritativeBaseFare * 0.1);
    const authoritativeTotal = Math.round(authoritativeBaseFare + authoritativeTaxes);

    const booking = await Booking.create({
      bookingReference: uuidv4().split('-')[0].toUpperCase(),
      userId: req.user._id,
      bookingType,
      itemId,
      itemSnapshot: authoritativeItemSnapshot,
      travelDetails: travelDetails || {},
      passengerOrGuestDetails: passengerOrGuestDetails || { count: 1 },
      priceBreakdown: {
        baseFare: authoritativeBaseFare,
        taxes: authoritativeTaxes,
      },
      totalAmount: authoritativeTotal,
    });

    res.status(201).json(booking);
  } catch (error: any) {
    console.error('[createBooking error]:', error);
    res.status(500).json({ error: 'Failed to create booking' });
  }
};

export const getMyBookings = async (req: any, res: Response) => {
  try {
    const bookings = await Booking.find({ userId: req.user._id }).sort({ createdAt: -1 });
    res.json(bookings);
  } catch (error: any) {
    console.error('[getMyBookings error]:', error);
    // Graceful fallback if database connection is pending or interrupted
    res.json([]);
  }
};

export const getBookingById = async (req: any, res: Response) => {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) {
      return res.status(400).json({ error: 'Invalid booking ID format' });
    }

    const booking = await Booking.findOne({ _id: id, userId: req.user._id });
    if (booking) {
      return res.json(booking);
    }
    return res.status(404).json({ error: 'Booking not found' });
  } catch (error: any) {
    console.error('[getBookingById error]:', error);
    return res.status(500).json({ error: 'Failed to retrieve booking' });
  }
};

export const simulatePayment = async (req: any, res: Response) => {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) {
      return res.status(400).json({ error: 'Invalid booking ID format' });
    }

    const { success, requestedOutcome, paymentMethod, methodDetails, idempotencyKey } = req.body;
    let outcome = requestedOutcome;
    if (!outcome) {
      outcome = success === false ? 'SIMULATED_FAILURE' : 'SIMULATED_SUCCESS';
    }

    const result = await paymentSimulationService.processSimulation({
      bookingId: id,
      userId: req.user._id,
      requestedOutcome: outcome,
      paymentMethod: paymentMethod || 'CARD',
      methodDetails,
      idempotencyKey,
    });

    res.json(result.booking);
  } catch (error: any) {
    const status = error.status || 500;
    res.status(status).json({ error: error.message || 'Payment simulation failed' });
  }
};

export const cancelBooking = async (req: any, res: Response) => {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) {
      return res.status(400).json({ error: 'Invalid booking ID format' });
    }

    const booking = await Booking.findOne({ _id: id, userId: req.user._id });
    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

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
      relatedBookingId: booking._id,
    });

    res.json(booking);
  } catch (error: any) {
    console.error('[cancelBooking error]:', error);
    res.status(500).json({ error: 'Failed to cancel booking' });
  }
};
