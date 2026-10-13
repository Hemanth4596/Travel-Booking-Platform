import mongoose, { Document, Schema } from 'mongoose';

export interface IBooking extends Document {
  bookingReference: string;
  userId: mongoose.Types.ObjectId;
  bookingType: 'FLIGHT' | 'HOTEL' | 'CAB';
  itemId: mongoose.Types.ObjectId;
  itemSnapshot: any;
  travelDetails: any;
  passengerOrGuestDetails: any;
  priceBreakdown: any;
  totalAmount: number;
  paymentStatus: 'PENDING' | 'SUCCESS' | 'FAILED' | 'REFUNDED';
  bookingStatus: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'FAILED';
  createdAt: Date;
  updatedAt: Date;
}

const bookingSchema = new Schema<IBooking>(
  {
    bookingReference: { type: String, required: true, unique: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    bookingType: { type: String, enum: ['FLIGHT', 'HOTEL', 'CAB'], required: true },
    itemId: { type: Schema.Types.ObjectId, required: true },
    itemSnapshot: { type: Schema.Types.Mixed, required: true },
    travelDetails: { type: Schema.Types.Mixed, required: true },
    passengerOrGuestDetails: { type: Schema.Types.Mixed, required: true },
    priceBreakdown: { type: Schema.Types.Mixed, required: true },
    totalAmount: { type: Number, required: true },
    paymentStatus: { type: String, enum: ['PENDING', 'SUCCESS', 'FAILED', 'REFUNDED'], default: 'PENDING' },
    bookingStatus: { type: String, enum: ['PENDING', 'CONFIRMED', 'CANCELLED', 'FAILED'], default: 'PENDING' },
  },
  { timestamps: true }
);

export const Booking = mongoose.model<IBooking>('Booking', bookingSchema);
