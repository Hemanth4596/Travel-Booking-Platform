import mongoose, { Document, Schema } from 'mongoose';

export interface IActivity {
  _id?: mongoose.Types.ObjectId;
  title: string;
  date: Date;
  time?: string;
  location: string;
  description?: string;
  associatedBookingId?: mongoose.Types.ObjectId;
}

export interface IItinerary extends Document {
  userId: mongoose.Types.ObjectId;
  title: string;
  destination: string;
  startDate: Date;
  endDate: Date;
  activities: IActivity[];
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const activitySchema = new Schema<IActivity>({
  title: { type: String, required: true },
  date: { type: Date, required: true },
  time: { type: String },
  location: { type: String, required: true },
  description: { type: String },
  associatedBookingId: { type: Schema.Types.ObjectId, ref: 'Booking' },
});

const itinerarySchema = new Schema<IItinerary>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true },
    destination: { type: String, required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    activities: [activitySchema],
    notes: { type: String },
  },
  { timestamps: true }
);

export const Itinerary = mongoose.model<IItinerary>('Itinerary', itinerarySchema);
