import { v4 as uuidv4 } from 'uuid';

export interface InMemoryBooking {
  _id: string;
  bookingReference: string;
  userId: string;
  bookingType: 'FLIGHT' | 'HOTEL' | 'CAB';
  itemId: string;
  itemSnapshot: any;
  travelDetails: any;
  passengerOrGuestDetails: any;
  priceBreakdown: any;
  totalAmount: number;
  paymentStatus: 'PENDING' | 'SUCCESS' | 'FAILED' | 'REFUNDED';
  bookingStatus: 'PENDING' | 'CONFIRMED' | 'CANCELLED';
  createdAt: Date;
  updatedAt: Date;
}

const memoryBookings: Map<string, InMemoryBooking> = new Map();

export const createMemoryBooking = (data: Partial<InMemoryBooking>): InMemoryBooking => {
  const id = '6630f9a2b7e123456789' + Math.floor(1000 + Math.random() * 9000);
  const ref = uuidv4().split('-')[0].toUpperCase();

  const booking: InMemoryBooking = {
    _id: id,
    bookingReference: ref,
    userId: String(data.userId || 'demo-user'),
    bookingType: data.bookingType || 'FLIGHT',
    itemId: String(data.itemId || 'demo-item'),
    itemSnapshot: data.itemSnapshot || {},
    travelDetails: data.travelDetails || {},
    passengerOrGuestDetails: data.passengerOrGuestDetails || { count: 1 },
    priceBreakdown: data.priceBreakdown || { baseFare: 4500, taxes: 450 },
    totalAmount: data.totalAmount || 4950,
    paymentStatus: data.paymentStatus || 'PENDING',
    bookingStatus: data.bookingStatus || 'PENDING',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  memoryBookings.set(id, booking);
  return booking;
};

export const getMemoryBookingsByUser = (userId: string): InMemoryBooking[] => {
  const userStr = String(userId);
  return Array.from(memoryBookings.values())
    .filter((b) => String(b.userId) === userStr || userStr.includes('demo') || userStr.includes('6630f9'))
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
};

export const getMemoryBookingById = (id: string): InMemoryBooking | null => {
  return memoryBookings.get(id) || Array.from(memoryBookings.values()).find((b) => b.bookingReference === id) || null;
};

export const updateMemoryBooking = (id: string, updates: Partial<InMemoryBooking>): InMemoryBooking | null => {
  const booking = getMemoryBookingById(id);
  if (!booking) return null;

  Object.assign(booking, updates, { updatedAt: new Date() });
  memoryBookings.set(booking._id, booking);
  return booking;
};
