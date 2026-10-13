import { Request, Response } from 'express';
import { Flight } from '../models/Flight';
import aviationStackService, { FlightQueryFilters } from '../services/aviationStack.service';

/**
 * DB Flights (Bookable inventory)
 */
export const getFlights = async (req: Request, res: Response) => {
  try {
    const { origin, destination, date } = req.query;
    let query: any = { isActive: true };
    if (origin) query.origin = new RegExp(origin as string, 'i');
    if (destination) query.destination = new RegExp(destination as string, 'i');
    // Simplified date matching for demo
    if (date) {
      const queryDate = new Date(date as string);
      const nextDate = new Date(queryDate);
      nextDate.setDate(nextDate.getDate() + 1);
      query.departureTime = { $gte: queryDate, $lt: nextDate };
    }
    const flights = await Flight.find(query);
    res.json(flights);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getFlightById = async (req: Request, res: Response) => {
  try {
    const flight = await Flight.findById(req.params.id);
    if (flight) res.json(flight);
    else res.status(404).json({ error: 'Flight not found' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
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
      filters.flightNumber = flightNumber.trim();
    }
    if (airline && typeof airline === 'string') {
      filters.airlineIata = airline.trim().toUpperCase();
    }
    if (depAirport && typeof depAirport === 'string') {
      filters.depIata = depAirport.trim().toUpperCase();
    }
    if (arrAirport && typeof arrAirport === 'string') {
      filters.arrIata = arrAirport.trim().toUpperCase();
    }
    if (flightStatus && typeof flightStatus === 'string') {
      filters.flightStatus = flightStatus.trim().toLowerCase();
    }
    if (limit) {
      const limitNum = parseInt(limit as string, 10);
      if (!isNaN(limitNum)) filters.limit = limitNum;
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
    if (!flightNumber) {
      return res.status(400).json({ error: 'Flight number is required' });
    }
    const data = await aviationStackService.getFlightByNumber(flightNumber);
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
