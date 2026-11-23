import { Request, Response } from 'express';
import { Flight } from '../models/Flight';
import aviationStackService, { FlightQueryFilters } from '../services/aviationStack.service';
import { escapeRegex, isValidObjectId } from '../utils/security';
import { ensureDatabaseSeeded } from '../utils/autoSeed';

/**
 * DB Flights (Bookable inventory)
 */
export const getFlights = async (req: Request, res: Response) => {
  try {
    // 1. Ensure database is seeded with initial inventory
    const totalFlights = await Flight.countDocuments();
    if (totalFlights === 0) {
      await ensureDatabaseSeeded();
    }

    const { origin, destination, date } = req.query;
    const query: any = { isActive: true };

    const originStr = typeof origin === 'string' ? origin.trim() : '';
    const destStr = typeof destination === 'string' ? destination.trim() : '';

    if (originStr) {
      const sanitizedOrigin = escapeRegex(originStr);
      if (sanitizedOrigin) {
        query.origin = new RegExp(sanitizedOrigin, 'i');
      }
    }

    if (destStr) {
      const sanitizedDest = escapeRegex(destStr);
      if (sanitizedDest) {
        query.destination = new RegExp(sanitizedDest, 'i');
      }
    }

    // Attempt date matching if provided
    let queryWithDate = { ...query };
    if (date && typeof date === 'string') {
      const queryDate = new Date(date);
      if (!isNaN(queryDate.getTime())) {
        const nextDate = new Date(queryDate);
        nextDate.setDate(nextDate.getDate() + 1);
        queryWithDate.departureTime = { $gte: queryDate, $lt: nextDate };
      }
    }

    // Try finding exact match with date
    let flights = await Flight.find(queryWithDate).limit(100);

    // If no flights found with strict date filter, fall back to matching route without date
    if (flights.length === 0 && date) {
      flights = await Flight.find(query).limit(100);
    }

    // If still no flights for this specific route, dynamically generate available flights for this route!
    if (flights.length === 0 && (originStr || destStr)) {
      const cleanOrigin = originStr || 'Delhi';
      const cleanDest = destStr || 'Mumbai';

      const baseDate = date && !isNaN(new Date(date as string).getTime()) ? new Date(date as string) : new Date(Date.now() + 86400000);
      baseDate.setHours(10, 0, 0, 0);

      const generatedFlights = [
        {
          airline: 'IndiGo',
          flightNumber: `6E-${Math.floor(100 + Math.random() * 900)}`,
          origin: cleanOrigin,
          destination: cleanDest,
          departureTime: new Date(baseDate.getTime() + 2 * 3600000),
          arrivalTime: new Date(baseDate.getTime() + 4 * 3600000),
          durationMinutes: 120,
          stops: 0,
          price: 4500,
          cabin: 'Economy',
          baggageAllowance: '15 kg',
          isActive: true,
        },
        {
          airline: 'Air India',
          flightNumber: `AI-${Math.floor(100 + Math.random() * 900)}`,
          origin: cleanOrigin,
          destination: cleanDest,
          departureTime: new Date(baseDate.getTime() + 6 * 3600000),
          arrivalTime: new Date(baseDate.getTime() + 8 * 3600000 + 1800000),
          durationMinutes: 150,
          stops: 0,
          price: 5800,
          cabin: 'Business',
          baggageAllowance: '25 kg',
          isActive: true,
        },
        {
          airline: 'Vistara',
          flightNumber: `UK-${Math.floor(100 + Math.random() * 900)}`,
          origin: cleanOrigin,
          destination: cleanDest,
          departureTime: new Date(baseDate.getTime() + 10 * 3600000),
          arrivalTime: new Date(baseDate.getTime() + 12 * 3600000),
          durationMinutes: 120,
          stops: 0,
          price: 4900,
          cabin: 'Economy',
          baggageAllowance: '15 kg',
          isActive: true,
        },
      ];

      try {
        flights = await Flight.insertMany(generatedFlights);
      } catch (insertErr) {
        flights = generatedFlights as any;
      }
    }

    // If still empty (e.g. no query and database was unseeded), return all active flights
    if (flights.length === 0) {
      flights = await Flight.find({ isActive: true }).limit(50);
    }

    res.json(flights);
  } catch (error: any) {
    console.error('[getFlights error]:', error);
    res.status(500).json({ error: 'Failed to search flights' });
  }
};

export const getFlightById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) {
      return res.status(400).json({ error: 'Invalid flight ID format' });
    }

    const flight = await Flight.findById(id);
    if (flight) {
      return res.json(flight);
    }
    return res.status(404).json({ error: 'Flight not found' });
  } catch (error: any) {
    console.error('[getFlightById error]:', error);
    return res.status(500).json({ error: 'Failed to fetch flight details' });
  }
};

/**
 * AviationStack Live Flight Tracking
 */
export const getLiveFlights = async (req: Request, res: Response) => {
  try {
    const {
      flightNumber,
      airline,
      depAirport,
      arrAirport,
      flightStatus,
      limit,
    } = req.query;

    const filters: FlightQueryFilters = {};

    if (flightNumber && typeof flightNumber === 'string') {
      filters.flightNumber = flightNumber.trim().slice(0, 20);
    }
    if (airline && typeof airline === 'string') {
      filters.airlineIata = airline.trim().toUpperCase().slice(0, 10);
    }
    if (depAirport && typeof depAirport === 'string') {
      filters.depIata = depAirport.trim().toUpperCase().slice(0, 10);
    }
    if (arrAirport && typeof arrAirport === 'string') {
      filters.arrIata = arrAirport.trim().toUpperCase().slice(0, 10);
    }
    if (flightStatus && typeof flightStatus === 'string') {
      filters.flightStatus = flightStatus.trim().toLowerCase().slice(0, 20);
    }
    if (limit) {
      const limitNum = parseInt(limit as string, 10);
      if (!isNaN(limitNum) && limitNum > 0) {
        filters.limit = Math.min(limitNum, 50);
      }
    }

    const data = await aviationStackService.getLiveFlights(filters);
    res.json(data);
  } catch (error: any) {
    res.status(500).json({
      success: false,
      providerStatus: 'PROVIDER_ERROR',
      message: error?.message || 'Error fetching live flight data from AviationStack',
      flights: [],
      totalReturned: 0,
      isStale: false,
    });
  }
};

export const getLiveFlightByNumber = async (req: Request, res: Response) => {
  try {
    const { flightNumber } = req.params;
    if (!flightNumber || typeof flightNumber !== 'string') {
      return res.status(400).json({ error: 'Flight number is required' });
    }
    const cleanFlightNumber = flightNumber.trim().slice(0, 20);
    const data = await aviationStackService.getFlightByNumber(cleanFlightNumber);
    res.json(data);
  } catch (error: any) {
    res.status(500).json({
      success: false,
      providerStatus: 'PROVIDER_ERROR',
      message: error?.message || 'Error fetching live flight details from AviationStack',
      flights: [],
      totalReturned: 0,
      isStale: false,
    });
  }
};
