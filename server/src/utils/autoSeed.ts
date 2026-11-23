import mongoose from 'mongoose';
// @ts-ignore
import bcrypt from 'bcryptjs';
import { User } from '../models/User';
import { Flight } from '../models/Flight';
import { Hotel } from '../models/Hotel';
import { Cab } from '../models/Cab';

const flightsData = [
  { airline: 'IndiGo', flightNumber: '6E-101', origin: 'Delhi', destination: 'Mumbai', departureTime: new Date(Date.now() + 86400000), arrivalTime: new Date(Date.now() + 93600000), durationMinutes: 120, price: 4500, cabin: 'Economy' },
  { airline: 'Air India', flightNumber: 'AI-202', origin: 'Mumbai', destination: 'Bengaluru', departureTime: new Date(Date.now() + 86400000 * 2), arrivalTime: new Date(Date.now() + 86400000 * 2 + 7200000), durationMinutes: 120, price: 5500, cabin: 'Economy' },
  { airline: 'Vistara', flightNumber: 'UK-303', origin: 'Bengaluru', destination: 'Hyderabad', departureTime: new Date(Date.now() + 86400000 * 3), arrivalTime: new Date(Date.now() + 86400000 * 3 + 3600000), durationMinutes: 60, price: 3500, cabin: 'Business' },
  { airline: 'SpiceJet', flightNumber: 'SG-404', origin: 'Hyderabad', destination: 'Chennai', departureTime: new Date(Date.now() + 86400000 * 4), arrivalTime: new Date(Date.now() + 86400000 * 4 + 4500000), durationMinutes: 75, price: 2800, cabin: 'Economy' },
  { airline: 'Akasa Air', flightNumber: 'QP-505', origin: 'Chennai', destination: 'Goa', departureTime: new Date(Date.now() + 86400000 * 5), arrivalTime: new Date(Date.now() + 86400000 * 5 + 5400000), durationMinutes: 90, price: 4200, cabin: 'Economy' },
  { airline: 'IndiGo', flightNumber: '6E-606', origin: 'Delhi', destination: 'Goa', departureTime: new Date(Date.now() + 86400000 * 6), arrivalTime: new Date(Date.now() + 86400000 * 6 + 9000000), durationMinutes: 150, price: 6000, cabin: 'Economy' },
  { airline: 'Air India', flightNumber: 'AI-707', origin: 'Mumbai', destination: 'Delhi', departureTime: new Date(Date.now() + 86400000 * 7), arrivalTime: new Date(Date.now() + 86400000 * 7 + 7200000), durationMinutes: 120, price: 4800, cabin: 'Business' },
  { airline: 'Vistara', flightNumber: 'UK-808', origin: 'Kochi', destination: 'Bengaluru', departureTime: new Date(Date.now() + 86400000 * 8), arrivalTime: new Date(Date.now() + 86400000 * 8 + 3600000), durationMinutes: 60, price: 3200, cabin: 'Economy' },
  { airline: 'SpiceJet', flightNumber: 'SG-909', origin: 'Jaipur', destination: 'Mumbai', departureTime: new Date(Date.now() + 86400000 * 9), arrivalTime: new Date(Date.now() + 86400000 * 9 + 7200000), durationMinutes: 120, price: 3900, cabin: 'Economy' },
  { airline: 'IndiGo', flightNumber: '6E-1010', origin: 'Visakhapatnam', destination: 'Hyderabad', departureTime: new Date(Date.now() + 86400000 * 10), arrivalTime: new Date(Date.now() + 86400000 * 10 + 3600000), durationMinutes: 60, price: 2900, cabin: 'Economy' },
  { airline: 'Air India', flightNumber: 'AI-1111', origin: 'Vijayawada', destination: 'Chennai', departureTime: new Date(Date.now() + 86400000 * 11), arrivalTime: new Date(Date.now() + 86400000 * 11 + 3600000), durationMinutes: 60, price: 2500, cabin: 'Economy' },
  { airline: 'Vistara', flightNumber: 'UK-1212', origin: 'Delhi', destination: 'Bengaluru', departureTime: new Date(Date.now() + 86400000 * 12), arrivalTime: new Date(Date.now() + 86400000 * 12 + 10800000), durationMinutes: 180, price: 7500, cabin: 'Business' },
];

const hotelsData = [
  { name: 'Taj Mahal Palace', destination: 'Mumbai', address: 'Apollo Bunder, Mumbai', description: 'Luxury heritage hotel.', rating: 4.9, amenities: ['Pool', 'Spa', 'WiFi'], rooms: [{ name: 'Standard', pricePerNight: 12000, maxGuests: 2, availableCount: 5 }] },
  { name: 'ITC Maurya', destination: 'Delhi', address: 'Sardar Patel Marg, Delhi', description: 'Luxury hotel in the heart of Delhi.', rating: 4.8, amenities: ['Pool', 'Gym', 'WiFi'], rooms: [{ name: 'Deluxe', pricePerNight: 15000, maxGuests: 2, availableCount: 4 }] },
  { name: 'The Leela Palace', destination: 'Bengaluru', address: 'Old Airport Road, Bengaluru', description: 'Palatial luxury.', rating: 4.9, amenities: ['Spa', 'Restaurants', 'WiFi'], rooms: [{ name: 'Suite', pricePerNight: 20000, maxGuests: 3, availableCount: 2 }] },
  { name: 'Falaknuma Palace', destination: 'Hyderabad', address: 'Engine Bowli, Hyderabad', description: 'Live like the Nizams.', rating: 5.0, amenities: ['Pool', 'Heritage Walks', 'WiFi'], rooms: [{ name: 'Royal Suite', pricePerNight: 35000, maxGuests: 2, availableCount: 1 }] },
  { name: 'ITC Grand Chola', destination: 'Chennai', address: 'Guindy, Chennai', description: 'Majestic luxury hotel.', rating: 4.8, amenities: ['Pool', 'Spa', 'WiFi'], rooms: [{ name: 'Standard', pricePerNight: 11000, maxGuests: 2, availableCount: 8 }] },
  { name: 'W Goa', destination: 'Goa', address: 'Vagator, Goa', description: 'Vibrant beach resort.', rating: 4.7, amenities: ['Beach Access', 'Pool', 'Party Area'], rooms: [{ name: 'Ocean View', pricePerNight: 18000, maxGuests: 2, availableCount: 3 }] },
  { name: 'Grand Hyatt', destination: 'Kochi', address: 'Bolgatty, Kochi', description: 'Waterfront luxury.', rating: 4.8, amenities: ['Pool', 'Spa', 'Backwater Views'], rooms: [{ name: 'Lake View', pricePerNight: 14000, maxGuests: 2, availableCount: 6 }] },
  { name: 'Rambagh Palace', destination: 'Jaipur', address: 'Bhawani Singh Road, Jaipur', description: 'Former royal residence.', rating: 4.9, amenities: ['Pool', 'Spa', 'Gardens'], rooms: [{ name: 'Palace Room', pricePerNight: 25000, maxGuests: 2, availableCount: 4 }] },
  { name: 'Novotel', destination: 'Visakhapatnam', address: 'Beach Road, Visakhapatnam', description: 'Sea-facing modern hotel.', rating: 4.5, amenities: ['Pool', 'Gym', 'WiFi'], rooms: [{ name: 'Sea View', pricePerNight: 8000, maxGuests: 2, availableCount: 10 }] },
];

const cabsData = [
  { vehicleType: 'Mini', vehicleName: 'Maruti Swift', passengerCapacity: 4, estimatedFare: 300, estimatedDurationMinutes: 30, features: ['AC', 'Compact'] },
  { vehicleType: 'Sedan', vehicleName: 'Honda City', passengerCapacity: 4, estimatedFare: 500, estimatedDurationMinutes: 30, features: ['AC', 'Spacious'] },
  { vehicleType: 'SUV', vehicleName: 'Toyota Innova', passengerCapacity: 6, estimatedFare: 800, estimatedDurationMinutes: 30, features: ['AC', 'Large Boot'] },
  { vehicleType: 'Mini', vehicleName: 'Hyundai i10', passengerCapacity: 4, estimatedFare: 280, estimatedDurationMinutes: 30, features: ['AC', 'Compact'] },
  { vehicleType: 'Sedan', vehicleName: 'Maruti Dzire', passengerCapacity: 4, estimatedFare: 450, estimatedDurationMinutes: 30, features: ['AC', 'Spacious'] },
  { vehicleType: 'SUV', vehicleName: 'Mahindra XUV500', passengerCapacity: 6, estimatedFare: 850, estimatedDurationMinutes: 30, features: ['AC', 'Premium'] },
];

let isSeeding = false;

export const ensureDatabaseSeeded = async () => {
  if (isSeeding) return;
  isSeeding = true;

  try {
    const flightCount = await Flight.countDocuments();
    if (flightCount === 0) {
      await Flight.insertMany(flightsData);
      console.log('[AutoSeed]: Flights seeded successfully');
    }

    const hotelCount = await Hotel.countDocuments();
    if (hotelCount === 0) {
      await Hotel.insertMany(hotelsData);
      console.log('[AutoSeed]: Hotels seeded successfully');
    }

    const cabCount = await Cab.countDocuments();
    if (cabCount === 0) {
      await Cab.insertMany(cabsData);
      console.log('[AutoSeed]: Cabs seeded successfully');
    }

    // Seed demo accounts if missing
    const userCount = await User.countDocuments();
    if (userCount === 0) {
      const salt = await bcrypt.genSalt(10);
      const adminPass = await bcrypt.hash('admin123', salt);
      const u1Pass = await bcrypt.hash('User1@123', salt);
      const u2Pass = await bcrypt.hash('User2@123', salt);

      await User.create([
        { name: 'Admin User', email: 'admin@travelbooking.com', passwordHash: adminPass, role: 'ADMIN', phone: '+1-555-0100' },
        { name: 'Demo User 1', email: 'user1@travelbooking.com', passwordHash: u1Pass, role: 'USER', phone: '+1-555-0101' },
        { name: 'Demo User 2', email: 'user2@travelbooking.com', passwordHash: u2Pass, role: 'USER', phone: '+1-555-0102' },
      ]);
      console.log('[AutoSeed]: Demo accounts (admin, user1, user2) seeded successfully');
    }
  } catch (error) {
    console.error('[AutoSeed error]:', error);
  } finally {
    isSeeding = false;
  }
};
