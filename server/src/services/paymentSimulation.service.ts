import mongoose from 'mongoose';
import { v4 as uuidv4 } from 'uuid';
import { Booking, IBooking } from '../models/Booking';
import { Notification } from '../models/Notification';
import {
  PaymentSimulation,
  IPaymentSimulation,
  SimulationOutcome,
  DemoPaymentMethod,
} from '../models/PaymentSimulation';

export interface ProcessSimulationInput {
  bookingId: string;
  userId: string;
  requestedOutcome: SimulationOutcome;
  paymentMethod: DemoPaymentMethod;
  methodDetails?: {
    cardBrand?: string;
    cardNumberMasked?: string;
    upiHandle?: string;
    bankName?: string;
  };
  failureReason?: string;
  idempotencyKey?: string;
}

export interface SimulationResult {
  success: boolean;
  simulationReference: string;
  outcome: SimulationOutcome;
  authorizedAmount: number;
  bookingReference: string;
  paymentMethod: DemoPaymentMethod;
  isSimulation: true;
  mandatoryDisclosure: string;
  message: string;
  processedAt: string;
  booking: IBooking;
}

const MANDATORY_DISCLOSURE =
  'DEMO MODE — SIMULATED PAYMENT: This is a demonstration payment flow. No real money will be charged, and no real payment transaction will be processed.';

export class PaymentSimulationService {
  /**
   * Process a deterministic payment simulation
   */
  public async processSimulation(input: ProcessSimulationInput): Promise<SimulationResult> {
    const {
      bookingId,
      userId,
      requestedOutcome,
      paymentMethod,
      methodDetails,
      failureReason,
      idempotencyKey,
    } = input;

    if (!mongoose.Types.ObjectId.isValid(bookingId)) {
      const err: any = new Error('Invalid booking reference ID');
      err.status = 400;
      throw err;
    }

    // 1. Fetch authoritative booking from MongoDB verifying user ownership
    const booking = await Booking.findOne({
      _id: bookingId,
      userId: new mongoose.Types.ObjectId(userId),
    });

    if (!booking) {
      const err: any = new Error('Booking not found or does not belong to the authenticated user');
      err.status = 404;
      throw err;
    }

    // 2. Validate current booking state
    if (booking.bookingStatus === 'CONFIRMED' && booking.paymentStatus === 'SUCCESS') {
      const err: any = new Error('This booking is already confirmed and paid.');
      err.status = 400;
      throw err;
    }

    if (booking.bookingStatus === 'CANCELLED' && requestedOutcome !== 'SIMULATED_CANCELLED') {
      const err: any = new Error('This booking has been cancelled and cannot be paid.');
      err.status = 400;
      throw err;
    }

    // 3. Check idempotency if key provided
    if (idempotencyKey) {
      const existing = await PaymentSimulation.findOne({
        bookingId: booking._id,
        idempotencyKey,
      });
      if (existing && existing.outcome === 'SIMULATED_SUCCESS') {
        return {
          success: true,
          simulationReference: existing.simulationReference,
          outcome: existing.outcome,
          authorizedAmount: existing.authorizedAmount,
          bookingReference: booking.bookingReference,
          paymentMethod: existing.paymentMethod,
          isSimulation: true,
          mandatoryDisclosure: MANDATORY_DISCLOSURE,
          message: 'Simulated payment succeeded (idempotent result).',
          processedAt: existing.createdAt.toISOString(),
          booking,
        };
      }
    }

    // 4. Generate unique simulation reference
    const uniqueRef = `SIM-PAY-${Date.now().toString(36).toUpperCase()}-${uuidv4().substring(0, 6).toUpperCase()}`;

    // 5. Sanitize and prepare safe method details (NEVER save sensitive credentials!)
    let safeLast4: string | undefined;
    if (methodDetails?.cardNumberMasked) {
      const digits = methodDetails.cardNumberMasked.replace(/\D/g, '');
      safeLast4 = digits.length >= 4 ? digits.slice(-4) : '4242';
    }

    const safeMethodDetails = {
      cardBrand: methodDetails?.cardBrand || (paymentMethod === 'CARD' ? 'Demo Visa' : undefined),
      last4: safeLast4,
      upiHandle: methodDetails?.upiHandle ? String(methodDetails.upiHandle).replace(/[^a-zA-Z0-9@._]/g, '') : undefined,
      bankName: methodDetails?.bankName || undefined,
    };

    // Authoritative amount directly from MongoDB booking model
    const authoritativeAmount = booking.totalAmount;

    // 6. Update booking status deterministically
    let resultMessage = '';
    let notifTitle = '';
    let notifMessage = '';

    if (requestedOutcome === 'SIMULATED_SUCCESS') {
      booking.paymentStatus = 'SUCCESS';
      booking.bookingStatus = 'CONFIRMED';
      resultMessage = 'Simulated payment completed successfully. Your booking is confirmed.';
      notifTitle = 'Booking Confirmed (Demo)';
      notifMessage = `Your simulated booking ${booking.bookingReference} has been confirmed. Simulation only — no real money was transferred.`;
    } else if (requestedOutcome === 'SIMULATED_FAILURE') {
      booking.paymentStatus = 'FAILED';
      // Keep bookingStatus as PENDING so user can retry!
      booking.bookingStatus = 'PENDING';
      resultMessage = 'Simulated payment was declined. You can retry with another method.';
      notifTitle = 'Simulated Payment Declined';
      notifMessage = `Simulated payment for booking ${booking.bookingReference} was declined. You can retry anytime.`;
    } else {
      // SIMULATED_CANCELLED
      booking.paymentStatus = 'FAILED';
      booking.bookingStatus = 'CANCELLED';
      resultMessage = 'Simulated checkout was cancelled.';
      notifTitle = 'Booking Cancelled (Demo)';
      notifMessage = `Simulated checkout for booking ${booking.bookingReference} was cancelled.`;
    }

    await booking.save();

    // 7. Record payment-simulation event in MongoDB
    const simulationRecord = await PaymentSimulation.create({
      simulationReference: uniqueRef,
      bookingId: booking._id,
      userId: booking.userId,
      authorizedAmount: authoritativeAmount,
      paymentMethod,
      methodDetails: safeMethodDetails,
      outcome: requestedOutcome,
      failureReason: requestedOutcome !== 'SIMULATED_SUCCESS' ? (failureReason || 'Simulated user selection') : undefined,
      isSimulation: true,
      simulationDisclaimer: MANDATORY_DISCLOSURE,
      idempotencyKey,
    });

    // 8. Create user notification
    try {
      await Notification.create({
        userId: booking.userId,
        type: 'BOOKING_UPDATE',
        title: notifTitle,
        message: notifMessage,
        relatedBookingId: booking._id,
      });
    } catch {
      // Notification creation shouldn't block simulation response
    }

    return {
      success: requestedOutcome === 'SIMULATED_SUCCESS',
      simulationReference: simulationRecord.simulationReference,
      outcome: requestedOutcome,
      authorizedAmount: authoritativeAmount,
      bookingReference: booking.bookingReference,
      paymentMethod,
      isSimulation: true,
      mandatoryDisclosure: MANDATORY_DISCLOSURE,
      message: resultMessage,
      processedAt: simulationRecord.createdAt.toISOString(),
      booking,
    };
  }

  /**
   * Retrieve simulation history for a booking
   */
  public async getSimulationsForBooking(bookingId: string, userId: string): Promise<IPaymentSimulation[]> {
    if (!mongoose.Types.ObjectId.isValid(bookingId)) {
      return [];
    }

    return PaymentSimulation.find({
      bookingId: new mongoose.Types.ObjectId(bookingId),
      userId: new mongoose.Types.ObjectId(userId),
    }).sort({ createdAt: -1 });
  }
}

export const paymentSimulationService = new PaymentSimulationService();
export default paymentSimulationService;
