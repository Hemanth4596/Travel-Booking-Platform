import mongoose, { Document, Schema } from 'mongoose';

export interface ICab extends Document {
  vehicleType: 'Mini' | 'Sedan' | 'SUV';
  vehicleName: string;
  passengerCapacity: number;
  estimatedFare: number;
  estimatedDurationMinutes: number;
  image: string;
  features: string[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const cabSchema = new Schema<ICab>(
  {
    vehicleType: { type: String, enum: ['Mini', 'Sedan', 'SUV'], required: true },
    vehicleName: { type: String, required: true },
    passengerCapacity: { type: Number, required: true },
    estimatedFare: { type: Number, required: true },
    estimatedDurationMinutes: { type: Number, required: true },
    image: { type: String },
    features: [{ type: String }],
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const Cab = mongoose.model<ICab>('Cab', cabSchema);
