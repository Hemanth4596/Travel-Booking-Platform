import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcrypt';
import { User } from '../src/models/User';
import { Flight } from '../src/models/Flight';
import { Hotel } from '../src/models/Hotel';
import { Cab } from '../src/models/Cab';

dotenv.config();

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
  { airline: 'SpiceJet', flightNumber: 'SG-1313', origin: 'Mumbai', destination: 'Goa', departureTime: new Date(Date.now() + 86400000 * 13), arrivalTime: new Date(Date.now() + 86400000 * 13 + 3600000), durationMinutes: 60, price: 3100, cabin: 'Economy' },
  { airline: 'Akasa Air', flightNumber: 'QP-1414', origin: 'Bengaluru', destination: 'Kochi', departureTime: new Date(Date.now() + 86400000 * 14), arrivalTime: new Date(Date.now() + 86400000 * 14 + 3600000), durationMinutes: 60, price: 2800, cabin: 'Economy' },
  { airline: 'IndiGo', flightNumber: '6E-1515', origin: 'Hyderabad', destination: 'Tirupati', departureTime: new Date(Date.now() + 86400000 * 15), arrivalTime: new Date(Date.now() + 86400000 * 15 + 3600000), durationMinutes: 60, price: 2400, cabin: 'Economy' },
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
  { name: 'Gateway Hotel', destination: 'Vijayawada', address: 'MG Road, Vijayawada', description: 'Comfortable business hotel.', rating: 4.3, amenities: ['Restaurant', 'Gym', 'WiFi'], rooms: [{ name: 'Standard Room', pricePerNight: 5000, maxGuests: 2, availableCount: 12 }] },
  { name: 'Trident', destination: 'Hyderabad', address: 'HITEC City, Hyderabad', description: 'Modern luxury in IT hub.', rating: 4.7, amenities: ['Pool', 'Spa', 'WiFi'], rooms: [{ name: 'Club Room', pricePerNight: 10000, maxGuests: 2, availableCount: 8 }] },
  { name: 'Radisson Blu', destination: 'Delhi', address: 'Dwarka, Delhi', description: 'Convenient 5-star hotel.', rating: 4.4, amenities: ['Pool', 'Spa', 'WiFi'], rooms: [{ name: 'Superior Room', pricePerNight: 7000, maxGuests: 2, availableCount: 15 }] },
];

const cabsData = [
  { vehicleType: 'Mini', vehicleName: 'Maruti Swift', passengerCapacity: 4, estimatedFare: 300, estimatedDurationMinutes: 30, features: ['AC', 'Compact'] },
  { vehicleType: 'Sedan', vehicleName: 'Honda City', passengerCapacity: 4, estimatedFare: 500, estimatedDurationMinutes: 30, features: ['AC', 'Spacious'] },
  { vehicleType: 'SUV', vehicleName: 'Toyota Innova', passengerCapacity: 6, estimatedFare: 800, estimatedDurationMinutes: 30, features: ['AC', 'Large Boot'] },
  { vehicleType: 'Mini', vehicleName: 'Hyundai i10', passengerCapacity: 4, estimatedFare: 280, estimatedDurationMinutes: 30, features: ['AC', 'Compact'] },
  { vehicleType: 'Sedan', vehicleName: 'Maruti Dzire', passengerCapacity: 4, estimatedFare: 450, estimatedDurationMinutes: 30, features: ['AC', 'Spacious'] },
  { vehicleType: 'SUV', vehicleName: 'Mahindra XUV500', passengerCapacity: 6, estimatedFare: 850, estimatedDurationMinutes: 30, features: ['AC', 'Premium'] },
  { vehicleType: 'Sedan', vehicleName: 'Hyundai Verna', passengerCapacity: 4, estimatedFare: 550, estimatedDurationMinutes: 30, features: ['AC', 'Premium'] },
  { vehicleType: 'SUV', vehicleName: 'Tata Safari', passengerCapacity: 6, estimatedFare: 900, estimatedDurationMinutes: 30, features: ['AC', 'Spacious'] },
];

const seedDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/travel_booking_db');
    console.log('MongoDB Connected for Seeding');

    // Prevent duplicate insertion
    const flightCount = await Flight.countDocuments();
    if (flightCount === 0) {
      await Flight.insertMany(flightsData);
      console.log('Flights Seeded');
    } else {
      console.log('Flights already exist, skipping seed');
    }

    const hotelCount = await Hotel.countDocuments();
    if (hotelCount === 0) {
      await Hotel.insertMany(hotelsData);
      console.log('Hotels Seeded');
    } else {
      console.log('Hotels already exist, skipping seed');
    }

    const cabCount = await Cab.countDocuments();
    if (cabCount === 0) {
      await Cab.insertMany(cabsData);
      console.log('Cabs Seeded');
    } else {
      console.log('Cabs already exist, skipping seed');
    }

    // Seed Admin User if not exists
    const adminExists = await User.findOne({ email: 'admin@travelbooking.com' });
    if (!adminExists) {
      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash('admin123', salt);
      await User.create({
        name: 'Admin User',
        email: 'admin@travelbooking.com',
        passwordHash,
        role: 'ADMIN'
      });
      console.log('Admin User Created');
    }

    process.exit();
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

seedDB();
