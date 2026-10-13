import mongoose, { Document, Schema } from 'mongoose';

export interface IFlight extends Document {
  airline: string;
  flightNumber: string;
  origin: string;
  destination: string;
  departureTime: Date;
  arrivalTime: Date;
  durationMinutes: number;
  stops: number;
  price: number;
  cabin: 'Economy' | 'Business';
  baggageAllowance: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const flightSchema = new Schema<IFlight>(
  {
    airline: { type: String, required: true },
    flightNumber: { type: String, required: true },
    origin: { type: String, required: true },
    destination: { type: String, required: true },
    departureTime: { type: Date, required: true },
    arrivalTime: { type: Date, required: true },
    durationMinutes: { type: Number, required: true },
    stops: { type: Number, required: true, default: 0 },
    price: { type: Number, required: true },
    cabin: { type: String, enum: ['Economy', 'Business'], default: 'Economy' },
    baggageAllowance: { type: String },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const Flight = mongoose.model<IFlight>('Flight', flightSchema);
