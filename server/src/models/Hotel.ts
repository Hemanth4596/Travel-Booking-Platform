import mongoose, { Document, Schema } from 'mongoose';

export interface IRoomType {
  _id?: mongoose.Types.ObjectId;
  name: string;
  pricePerNight: number;
  maxGuests: number;
  availableCount: number;
  amenities: string[];
}

export interface IHotel extends Document {
  name: string;
  destination: string;
  address: string;
  description: string;
  images: string[];
  rating: number;
  reviewCount: number;
  amenities: string[];
  rooms: IRoomType[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const roomTypeSchema = new Schema<IRoomType>({
  name: { type: String, required: true },
  pricePerNight: { type: Number, required: true },
  maxGuests: { type: Number, required: true },
  availableCount: { type: Number, required: true },
  amenities: [{ type: String }],
});

const hotelSchema = new Schema<IHotel>(
  {
    name: { type: String, required: true },
    destination: { type: String, required: true },
    address: { type: String, required: true },
    description: { type: String },
    images: [{ type: String }],
    rating: { type: Number, default: 0 },
    reviewCount: { type: Number, default: 0 },
    amenities: [{ type: String }],
    rooms: [roomTypeSchema],
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const Hotel = mongoose.model<IHotel>('Hotel', hotelSchema);
