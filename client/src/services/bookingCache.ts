/**
 * Local client-side cache and persistence layer for bookings and payments.
 * Ensures the entire booking, simulated payment, and dashboard experience
 * works with 100% functionality even when MongoDB or backend is offline.
 */

const STORAGE_KEY = 'travel_platform_cached_bookings';

export interface CachedBooking {
  _id: string;
  bookingReference: string;
  userId: string;
  bookingType: 'FLIGHT' | 'HOTEL' | 'CAB';
  itemId: string;
  itemSnapshot: any;
  travelDetails: any;
  passengerOrGuestDetails: any;
  priceBreakdown: {
    baseFare: number;
    taxes: number;
  };
  totalAmount: number;
  paymentStatus: 'PENDING' | 'SUCCESS' | 'FAILED' | 'REFUNDED';
  bookingStatus: 'PENDING' | 'CONFIRMED' | 'CANCELLED';
  createdAt: string;
  updatedAt: string;
}

export const getLocalBookings = (userId?: string): CachedBooking[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const list: CachedBooking[] = JSON.parse(raw);
    if (!Array.isArray(list)) return [];
    if (userId) {
      return list.filter((b) => !b.userId || b.userId === userId);
    }
    return list;
  } catch {
    return [];
  }
};

export const getLocalBookingById = (id: string): CachedBooking | null => {
  const list = getLocalBookings();
  return list.find((b) => b._id === id || b.bookingReference === id) || null;
};

export const saveLocalBooking = (bookingData: Partial<CachedBooking>): CachedBooking => {
  const list = getLocalBookings();
  const now = new Date().toISOString();

  const id = bookingData._id || `local-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
  const ref = bookingData.bookingReference || `TP-${Date.now().toString(36).slice(-5).toUpperCase()}`;

  const existingIdx = list.findIndex((b) => b._id === id);

  const fullBooking: CachedBooking = {
    _id: id,
    bookingReference: ref,
    userId: bookingData.userId || 'demo-user',
    bookingType: bookingData.bookingType || 'FLIGHT',
    itemId: bookingData.itemId || 'demo-item',
    itemSnapshot: bookingData.itemSnapshot || {},
    travelDetails: bookingData.travelDetails || {},
    passengerOrGuestDetails: bookingData.passengerOrGuestDetails || { count: 1 },
    priceBreakdown: bookingData.priceBreakdown || {
      baseFare: bookingData.totalAmount ? Math.round(bookingData.totalAmount / 1.1) : 4500,
      taxes: bookingData.totalAmount ? Math.round(bookingData.totalAmount * 0.1) : 450,
    },
    totalAmount: bookingData.totalAmount || 4950,
    paymentStatus: bookingData.paymentStatus || 'PENDING',
    bookingStatus: bookingData.bookingStatus || 'PENDING',
    createdAt: bookingData.createdAt || now,
    updatedAt: now,
  };

  if (existingIdx !== -1) {
    list[existingIdx] = { ...list[existingIdx], ...fullBooking };
  } else {
    list.unshift(fullBooking);
  }

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  } catch (err) {
    console.warn('Failed to save to localStorage cache:', err);
  }

  return fullBooking;
};

export const updateLocalBooking = (id: string, updates: Partial<CachedBooking>): CachedBooking | null => {
  const list = getLocalBookings();
  const idx = list.findIndex((b) => b._id === id || b.bookingReference === id);
  if (idx === -1) return null;

  list[idx] = {
    ...list[idx],
    ...updates,
    updatedAt: new Date().toISOString(),
  };

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  } catch (err) {
    console.warn('Failed to update localStorage cache:', err);
  }

  return list[idx];
};

export const cancelLocalBooking = (id: string): CachedBooking | null => {
  return updateLocalBooking(id, {
    bookingStatus: 'CANCELLED',
    paymentStatus: 'REFUNDED',
  });
};
