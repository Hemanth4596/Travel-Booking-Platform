import { Response } from 'express';
import paymentSimulationService, {
  ProcessSimulationInput,
} from '../services/paymentSimulation.service';

/**
 * Handle simulated payment request
 */
export const handleSimulatePayment = async (req: any, res: Response) => {
  try {
    const {
      bookingId,
      requestedOutcome,
      paymentMethod,
      methodDetails,
      failureReason,
      idempotencyKey,
    } = req.body;

    // Default to bookingId from params if called via /bookings/:id/payment/simulate
    const effectiveBookingId = bookingId || req.params.id;

    if (!effectiveBookingId) {
      return res.status(400).json({ error: 'Booking ID is required' });
    }

    // Determine deterministic outcome
    // Allow boolean `success` for legacy compatibility, or explicit `requestedOutcome`
    let outcome = requestedOutcome;
    if (!outcome) {
      if (req.body.success === true) outcome = 'SIMULATED_SUCCESS';
      else if (req.body.success === false) outcome = 'SIMULATED_FAILURE';
      else outcome = 'SIMULATED_SUCCESS';
    }

    if (!['SIMULATED_SUCCESS', 'SIMULATED_FAILURE', 'SIMULATED_CANCELLED'].includes(outcome)) {
      return res.status(400).json({ error: 'Invalid requested outcome for simulation' });
    }

    const effectivePaymentMethod = paymentMethod || 'CARD';
    if (!['CARD', 'UPI', 'NET_BANKING'].includes(effectivePaymentMethod)) {
      return res.status(400).json({ error: 'Invalid simulated payment method' });
    }

    const input: ProcessSimulationInput = {
      bookingId: effectiveBookingId,
      userId: req.user._id,
      requestedOutcome: outcome,
      paymentMethod: effectivePaymentMethod,
      methodDetails,
      failureReason,
      idempotencyKey,
    };

    const result = await paymentSimulationService.processSimulation(input);
    res.status(200).json(result);
  } catch (error: any) {
    const status = error.status || 500;
    res.status(status).json({
      success: false,
      error: error.message || 'Payment simulation processing failed',
      isSimulation: true,
      mandatoryDisclosure:
        'DEMO MODE — SIMULATED PAYMENT: This is a demonstration payment flow. No real money will be charged, and no real payment transaction will be processed.',
    });
  }
};

/**
 * Retrieve simulation events for a booking
 */
export const getBookingSimulationHistory = async (req: any, res: Response) => {
  try {
    const { bookingId } = req.params;
    const history = await paymentSimulationService.getSimulationsForBooking(
      bookingId,
      req.user._id
    );
    res.json(history);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to fetch simulation events' });
  }
};
