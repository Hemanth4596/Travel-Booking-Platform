export interface NormalizedFlight {
  id: string;
  flightNumber: string;
  icaoNumber: string | null;
  airline: {
    iataCode: string | null;
    icaoCode: string | null;
    name: string | null;
  };
  aircraft: {
    registration: string | null;
    iataType: string | null;
    icaoType: string | null;
    icao24: string | null;
  };
  coordinates: {
    latitude: number;
    longitude: number;
  } | null;
  altitude: number | null; // meters
  altitudeFeet: number | null; // feet
  heading: number | null; // degrees (0-360)
  horizontalSpeed: number | null; // km/h
  verticalSpeed: number | null; // m/s or vspeed
  isGround: boolean;
  departure: {
    iataCode: string | null;
    icaoCode: string | null;
    airport?: string | null;
  };
  arrival: {
    iataCode: string | null;
    icaoCode: string | null;
    airport?: string | null;
  };
  status: string;
  flightDate?: string | null;
  lastUpdated: string | null;
  isStale: boolean;
}

export interface LiveFlightResponse {
  success: boolean;
  providerStatus: 'LIVE_DATA' | 'CACHED' | 'INVALID_API_KEY' | 'MISSING_API_KEY' | 'RATE_LIMITED' | 'PROVIDER_ERROR' | 'EMPTY_RESULTS';
  message: string;
  flights: NormalizedFlight[];
  totalReturned: number;
  cachedAt?: string;
  lastProviderCall?: string;
  isStale: boolean;
}
