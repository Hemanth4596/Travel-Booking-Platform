import mongoose, { Document, Schema } from 'mongoose';

export type SimulationOutcome = 'SIMULATED_SUCCESS' | 'SIMULATED_FAILURE' | 'SIMULATED_CANCELLED';
export type DemoPaymentMethod = 'CARD' | 'UPI' | 'NET_BANKING';

export interface IPaymentSimulation extends Document {
  simulationReference: string;
  bookingId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  authorizedAmount: number;
  paymentMethod: DemoPaymentMethod;
  methodDetails: {
    cardBrand?: string;
    last4?: string;
    upiHandle?: string;
    bankName?: string;
  };
  outcome: SimulationOutcome;
  failureReason?: string;
  isSimulation: boolean;
  simulationDisclaimer: string;
  idempotencyKey?: string;
  createdAt: Date;
  updatedAt: Date;
}

const paymentSimulationSchema = new Schema<IPaymentSimulation>(
  {
    simulationReference: { type: String, required: true, unique: true },
    bookingId: { type: Schema.Types.ObjectId, ref: 'Booking', required: true, index: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    authorizedAmount: { type: Number, required: true },
    paymentMethod: { type: String, enum: ['CARD', 'UPI', 'NET_BANKING'], required: true },
    methodDetails: {
      cardBrand: { type: String },
      last4: { type: String },
      upiHandle: { type: String },
      bankName: { type: String },
    },
    outcome: {
      type: String,
      enum: ['SIMULATED_SUCCESS', 'SIMULATED_FAILURE', 'SIMULATED_CANCELLED'],
      required: true,
    },
    failureReason: { type: String },
    isSimulation: { type: Boolean, default: true, immutable: true },
    simulationDisclaimer: {
      type: String,
      default: 'DEMO MODE: Simulated transaction only. No real money was transferred or charged.',
      immutable: true,
    },
    idempotencyKey: { type: String, index: true },
  },
  { timestamps: true }
);

export const PaymentSimulation = mongoose.model<IPaymentSimulation>(
  'PaymentSimulation',
  paymentSimulationSchema
);
