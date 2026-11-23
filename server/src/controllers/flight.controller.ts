import { Request, Response } from 'express';
import { Flight } from '../models/Flight';
import aviationStackService, { FlightQueryFilters } from '../services/aviationStack.service';
import { escapeRegex, isValidObjectId } from '../utils/security';

/**
 * DB Flights (Bookable inventory)
 */
export const getFlights = async (req: Request, res: Response) => {
  try {
    const { origin, destination, date } = req.query;
    const query: any = { isActive: true };

    if (origin && typeof origin === 'string') {
      const sanitizedOrigin = escapeRegex(origin.trim());
      if (sanitizedOrigin) {
        query.origin = new RegExp(sanitizedOrigin, 'i');
      }
    }

    if (destination && typeof destination === 'string') {
      const sanitizedDest = escapeRegex(destination.trim());
      if (sanitizedDest) {
        query.destination = new RegExp(sanitizedDest, 'i');
      }
    }

    // Date matching
    if (date && typeof date === 'string') {
      const queryDate = new Date(date);
      if (!isNaN(queryDate.getTime())) {
        const nextDate = new Date(queryDate);
        nextDate.setDate(nextDate.getDate() + 1);
        query.departureTime = { $gte: queryDate, $lt: nextDate };
      }
    }

    const flights = await Flight.find(query).limit(100);
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
