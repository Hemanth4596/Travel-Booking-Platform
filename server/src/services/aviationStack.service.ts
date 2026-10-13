/**
 * AviationStack Live Flight Tracking Service
 * Official API: https://api.aviationstack.com/v1/flights?access_key=API_KEY
 * Free tier: 100 requests/month, Real-Time Flights access
 */

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
  flightDate: string | null;
  lastUpdated: string | null;
  isStale: boolean;
}

export interface FlightQueryFilters {
  flightNumber?: string;
  airlineIata?: string;
  depIata?: string;
  arrIata?: string;
  flightStatus?: string;
  limit?: number;
}

export interface LiveFlightResponse {
  success: boolean;
  providerStatus:
    | 'LIVE_DATA'
    | 'CACHED'
    | 'INVALID_API_KEY'
    | 'MISSING_API_KEY'
    | 'RATE_LIMITED'
    | 'PROVIDER_ERROR'
    | 'EMPTY_RESULTS';
  message: string;
  flights: NormalizedFlight[];
  totalReturned: number;
  cachedAt?: string;
  lastProviderCall?: string;
  isStale: boolean;
  pagination?: {
    limit: number;
    offset: number;
    count: number;
    total: number;
  };
}

interface CacheEntry {
  timestamp: number;
  data: LiveFlightResponse;
}

export class AviationStackService {
  private cache: Map<string, CacheEntry> = new Map();
  private inFlightRequests: Map<string, Promise<LiveFlightResponse>> = new Map();
  // Free plan has 100 requests/month; default to 60-second server cache TTL to protect quota
  private readonly defaultCacheTTLMs: number = parseInt(
    process.env.FLIGHT_CACHE_TTL_MS || '60000',
    10
  );
  private readonly requestTimeoutMs: number = 10000; // 10 seconds
  private readonly primaryEndpoint: string = 'https://api.aviationstack.com/v1/flights';
  private readonly fallbackEndpoint: string = 'http://api.aviationstack.com/v1/flights';

  /**
   * Safely retrieves the API key from environment without printing/leaking.
   */
  private getApiKey(): string | null {
    const key =
      process.env.AVIATIONSTACK_API_KEY?.trim() ||
      process.env.AVIATION_EDGE_API_KEY?.trim();

    if (
      !key ||
      key === 'your_api_key_here' ||
      key === 'your_aviationstack_api_key_here'
    ) {
      return null;
    }
    return key;
  }

  /**
   * Redacts sensitive key patterns from strings to prevent accidental exposure.
   */
  private sanitizeError(message: string, apiKey?: string | null): string {
    if (!message) return 'Unknown provider communication error';
    let clean = message;
    if (apiKey) {
      clean = clean.split(apiKey).join('[REDACTED]');
    }
    // Also scrub any 32-char hex token or query param key=...
    clean = clean.replace(/access_key=[a-zA-Z0-9_-]+/gi, 'access_key=[REDACTED]');
    clean = clean.replace(/key=[a-zA-Z0-9_-]+/gi, 'key=[REDACTED]');
    return clean;
  }

  /**
   * Normalizes raw AviationStack flight object into standard application model.
   * Handles missing `live` data safely without fabricating coordinates.
   */
  public normalizeFlight(raw: any, index: number, isStale: boolean = false): NormalizedFlight | null {
    if (!raw || typeof raw !== 'object') return null;

    const flightInfo = raw.flight || {};
    const airlineInfo = raw.airline || {};
    const departureInfo = raw.departure || {};
    const arrivalInfo = raw.arrival || {};
    const aircraftInfo = raw.aircraft || {};
    const liveInfo = raw.live || null;
    const geoInfo = raw.geography || null;
    const speedInfo = raw.speed || null;

    // Flight number identification
    const flightNumber =
      flightInfo.iata ||
      flightInfo.iataNumber ||
      flightInfo.icao ||
      flightInfo.icaoNumber ||
      (flightInfo.number ? `${airlineInfo.iata || airlineInfo.iataCode || ''}${flightInfo.number}` : null) ||
      `FLIGHT-${index + 1}`;

    const icaoNumber = flightInfo.icao || flightInfo.icaoNumber || null;

    // Geographic coordinates from live ADS-B data (or legacy geo fallback)
    let coordinates: { latitude: number; longitude: number } | null = null;
    let altitude: number | null = null;
    let altitudeFeet: number | null = null;
    let heading: number | null = null;
    let horizontalSpeed: number | null = null;
    let verticalSpeed: number | null = null;
    let isGround = false;

    const activeTelemetry = liveInfo || geoInfo;
    if (activeTelemetry && typeof activeTelemetry === 'object') {
      const rawLat =
        typeof activeTelemetry.latitude === 'number'
          ? activeTelemetry.latitude
          : parseFloat(activeTelemetry.latitude);
      const rawLng =
        typeof activeTelemetry.longitude === 'number'
          ? activeTelemetry.longitude
          : parseFloat(activeTelemetry.longitude);

      if (
        !isNaN(rawLat) &&
        !isNaN(rawLng) &&
        rawLat >= -90 &&
        rawLat <= 90 &&
        rawLng >= -180 &&
        rawLng <= 180
      ) {
        coordinates = {
          latitude: rawLat,
          longitude: rawLng,
        };
      }

      if (typeof activeTelemetry.altitude === 'number') {
        altitude = activeTelemetry.altitude;
      } else if (activeTelemetry.altitude) {
        const parsedAlt = parseFloat(activeTelemetry.altitude);
        altitude = isNaN(parsedAlt) ? null : parsedAlt;
      }

      if (altitude !== null) {
        altitudeFeet = Math.round(altitude * 3.28084);
      }

      const rawDir = activeTelemetry.direction;
      if (typeof rawDir === 'number') {
        heading = rawDir;
      } else if (rawDir) {
        const parsedDir = parseFloat(rawDir);
        heading = isNaN(parsedDir) ? null : parsedDir;
      }

      const rawHSpd = activeTelemetry.speed_horizontal ?? speedInfo?.horizontal;
      if (typeof rawHSpd === 'number') {
        horizontalSpeed = rawHSpd;
      } else if (rawHSpd) {
        const parsedSpeed = parseFloat(rawHSpd);
        horizontalSpeed = isNaN(parsedSpeed) ? null : parsedSpeed;
      }

      const rawVSpd = activeTelemetry.speed_vertical ?? speedInfo?.vspeed;
      if (typeof rawVSpd === 'number') {
        verticalSpeed = rawVSpd;
      } else if (rawVSpd) {
        const parsedVSpeed = parseFloat(rawVSpd);
        verticalSpeed = isNaN(parsedVSpeed) ? null : parsedVSpeed;
      }

      const rawGround = activeTelemetry.is_ground ?? speedInfo?.isGround;
      isGround = Boolean(rawGround === 1 || rawGround === '1' || rawGround === true);
    }

    const flightStatus = raw.flight_status || raw.status || (isGround ? 'landed' : (coordinates ? 'active' : 'scheduled'));
    if (flightStatus === 'landed') {
      isGround = true;
    }

    // Unique deterministic flight ID
    const uniqueId =
      raw.hexIcao24 ||
      flightInfo.iata ||
      flightInfo.iataNumber ||
      flightInfo.icao ||
      flightInfo.icaoNumber ||
      aircraftInfo.registration ||
      aircraftInfo.regNumber ||
      aircraftInfo.icao24 ||
      `${flightNumber}_${raw.flight_date || ''}_${index}`;

    let lastUpdated: string | null = null;
    if (liveInfo?.updated) {
      lastUpdated = new Date(liveInfo.updated).toISOString();
    } else if (raw.system?.updated) {
      const ts = typeof raw.system.updated === 'number' ? raw.system.updated * 1000 : Date.parse(raw.system.updated);
      lastUpdated = !isNaN(ts) ? new Date(ts).toISOString() : new Date().toISOString();
    } else {
      lastUpdated = new Date().toISOString();
    }

    return {
      id: String(uniqueId),
      flightNumber: String(flightNumber),
      icaoNumber: icaoNumber ? String(icaoNumber) : null,
      airline: {
        iataCode: airlineInfo.iata || airlineInfo.iataCode ? String(airlineInfo.iata || airlineInfo.iataCode) : null,
        icaoCode: airlineInfo.icao || airlineInfo.icaoCode ? String(airlineInfo.icao || airlineInfo.icaoCode) : null,
        name: airlineInfo.name ? String(airlineInfo.name) : null,
      },
      aircraft: {
        registration: aircraftInfo.registration || aircraftInfo.regNumber ? String(aircraftInfo.registration || aircraftInfo.regNumber) : null,
        iataType: aircraftInfo.iata || aircraftInfo.iataCode ? String(aircraftInfo.iata || aircraftInfo.iataCode) : null,
        icaoType: aircraftInfo.icao || aircraftInfo.icaoCode ? String(aircraftInfo.icao || aircraftInfo.icaoCode) : null,
        icao24: aircraftInfo.icao24 ? String(aircraftInfo.icao24) : null,
      },
      coordinates,
      altitude,
      altitudeFeet,
      heading,
      horizontalSpeed,
      verticalSpeed,
      isGround,
      departure: {
        iataCode: departureInfo.iata || departureInfo.iataCode ? String(departureInfo.iata || departureInfo.iataCode) : null,
        icaoCode: departureInfo.icao || departureInfo.icaoCode ? String(departureInfo.icao || departureInfo.icaoCode) : null,
        airport: departureInfo.airport ? String(departureInfo.airport) : null,
      },
      arrival: {
        iataCode: arrivalInfo.iata || arrivalInfo.iataCode ? String(arrivalInfo.iata || arrivalInfo.iataCode) : null,
        icaoCode: arrivalInfo.icao || arrivalInfo.icaoCode ? String(arrivalInfo.icao || arrivalInfo.icaoCode) : null,
        airport: arrivalInfo.airport ? String(arrivalInfo.airport) : null,
      },
      status: String(flightStatus),
      flightDate: raw.flight_date ? String(raw.flight_date) : null,
      lastUpdated,
      isStale,
    };
  }

  /**
   * Generates a stable cache key based on query filters.
   */
  private buildCacheKey(filters: FlightQueryFilters): string {
    const parts = [
      filters.flightNumber ? `fn:${filters.flightNumber.toUpperCase()}` : '',
      filters.airlineIata ? `al:${filters.airlineIata.toUpperCase()}` : '',
      filters.depIata ? `dep:${filters.depIata.toUpperCase()}` : '',
      filters.arrIata ? `arr:${filters.arrIata.toUpperCase()}` : '',
      filters.flightStatus ? `st:${filters.flightStatus.toLowerCase()}` : '',
      filters.limit ? `lim:${filters.limit}` : 'lim:25',
    ].filter(Boolean);

    return parts.length > 0 ? parts.join('|') : 'all_active_flights';
  }

  /**
   * Fetches flights from AviationStack with caching, deduplication, and quota protection.
   */
  public async getLiveFlights(filters: FlightQueryFilters = {}): Promise<LiveFlightResponse> {
    const cacheKey = this.buildCacheKey(filters);
    const now = Date.now();

    // 1. Check in-memory cache
    const cached = this.cache.get(cacheKey);
    if (cached && now - cached.timestamp < this.defaultCacheTTLMs) {
      return {
        ...cached.data,
        providerStatus: 'CACHED',
        cachedAt: new Date(cached.timestamp).toISOString(),
        isStale: false,
      };
    }

    // 2. Request deduplication - reuse active in-flight request if present
    const inFlight = this.inFlightRequests.get(cacheKey);
    if (inFlight) {
      return inFlight;
    }

    // 3. Initiate new fetch
    const requestPromise = this.executeFetchWithFallback(filters, cacheKey, cached);
    this.inFlightRequests.set(cacheKey, requestPromise);

    try {
      const result = await requestPromise;
      return result;
    } finally {
      this.inFlightRequests.delete(cacheKey);
    }
  }

  /**
   * Executes fetch with automatic HTTPS to HTTP fallback if plan restricts HTTPS.
   */
  private async executeFetchWithFallback(
    filters: FlightQueryFilters,
    cacheKey: string,
    existingCache?: CacheEntry
  ): Promise<LiveFlightResponse> {
    const apiKey = this.getApiKey();

    if (!apiKey) {
      return {
        success: false,
        providerStatus: 'MISSING_API_KEY',
        message:
          'AviationStack API key is not configured. Please set AVIATIONSTACK_API_KEY in server/.env.',
        flights: [],
        totalReturned: 0,
        isStale: false,
      };
    }

    // Attempt primary HTTPS endpoint first
    const primaryResult = await this.doFetch(this.primaryEndpoint, apiKey, filters, existingCache);

    // If HTTPS is restricted by current subscription plan, fall back to HTTP
    if (
      !primaryResult.success &&
      primaryResult.message?.includes('https_access_restricted')
    ) {
      return this.doFetch(this.fallbackEndpoint, apiKey, filters, existingCache);
    }

    // Save successful result in cache
    if (primaryResult.success) {
      this.cache.set(cacheKey, {
        timestamp: Date.now(),
        data: primaryResult,
      });
    }

    return primaryResult;
  }

  /**
   * Internal HTTP/HTTPS request executor.
   */
  private async doFetch(
    endpoint: string,
    apiKey: string,
    filters: FlightQueryFilters,
    existingCache?: CacheEntry
  ): Promise<LiveFlightResponse> {
    const url = new URL(endpoint);
    url.searchParams.set('access_key', apiKey);

    // Free plan: Keep default result limit small (25, max 100)
    const limit = Math.min(Math.max(filters.limit || 25, 1), 100);
    url.searchParams.set('limit', String(limit));

    // Optional AviationStack query filters
    if (filters.flightNumber) {
      url.searchParams.set('flight_iata', filters.flightNumber.trim());
    }
    if (filters.airlineIata) {
      url.searchParams.set('airline_iata', filters.airlineIata.trim().toUpperCase());
    }
    if (filters.depIata) {
      url.searchParams.set('dep_iata', filters.depIata.trim().toUpperCase());
    }
    if (filters.arrIata) {
      url.searchParams.set('arr_iata', filters.arrIata.trim().toUpperCase());
    }
    if (filters.flightStatus) {
      url.searchParams.set('flight_status', filters.flightStatus.trim().toLowerCase());
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.requestTimeoutMs);

    try {
      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: {
          Accept: 'application/json',
          'User-Agent': 'TravelPlatform-FlightTracker/1.0',
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      const rawJson: any = await response.json();

      // Check for AviationStack provider error payload
      if (rawJson?.error) {
        const errObj = rawJson.error;
        const errCode = String(errObj.code || '').toLowerCase();
        const rawErrMsg = String(errObj.message || errObj.info || 'Unknown error');
        const cleanMsg = this.sanitizeError(rawErrMsg, apiKey);

        // Handle specific error codes
        if (
          errCode === 'invalid_access_key' ||
          errCode === 'missing_access_key' ||
          cleanMsg.toLowerCase().includes('access key')
        ) {
          return {
            success: false,
            providerStatus: 'INVALID_API_KEY',
            message:
              'AviationStack reported: Invalid Access Key. Please verify your AviationStack API key in server/.env.',
            flights: [],
            totalReturned: 0,
            isStale: false,
          };
        }

        if (
          errCode === 'usage_limit_reached' ||
          errCode === 'rate_limit_reached' ||
          response.status === 429
        ) {
          if (existingCache) {
            return {
              ...existingCache.data,
              providerStatus: 'RATE_LIMITED',
              message:
                'AviationStack monthly request quota reached (100 req/month limit). Displaying cached telemetry.',
              isStale: true,
            };
          }
          return {
            success: false,
            providerStatus: 'RATE_LIMITED',
            message:
              'AviationStack monthly request limit reached (100 req/month on Free Plan). Please wait before retrying.',
            flights: [],
            totalReturned: 0,
            isStale: false,
          };
        }

        if (errCode === 'https_access_restricted') {
          return {
            success: false,
            providerStatus: 'PROVIDER_ERROR',
            message: `https_access_restricted: ${cleanMsg}`,
            flights: [],
            totalReturned: 0,
            isStale: false,
          };
        }

        return {
          success: false,
          providerStatus: 'PROVIDER_ERROR',
          message: `AviationStack error (${errCode || response.status}): ${cleanMsg}`,
          flights: [],
          totalReturned: 0,
          isStale: false,
        };
      }

      // Check for valid data array
      if (!rawJson || !Array.isArray(rawJson.data)) {
        return {
          success: true,
          providerStatus: 'EMPTY_RESULTS',
          message: 'No flight data returned by AviationStack for current parameters.',
          flights: [],
          totalReturned: 0,
          isStale: false,
        };
      }

      // Normalize flights
      const rawFlights: any[] = rawJson.data;
      const normalizedList: NormalizedFlight[] = [];

      for (let i = 0; i < rawFlights.length; i++) {
        const item = this.normalizeFlight(rawFlights[i], i, false);
        if (item) {
          normalizedList.push(item);
        }
      }

      const totalWithCoords = normalizedList.filter((f) => f.coordinates !== null).length;

      return {
        success: true,
        providerStatus: normalizedList.length > 0 ? 'LIVE_DATA' : 'EMPTY_RESULTS',
        message:
          normalizedList.length > 0
            ? `Successfully retrieved ${normalizedList.length} flight(s) from AviationStack (${totalWithCoords} with real-time 3D telemetry).`
            : 'No flights currently matching filters in provider coverage.',
        flights: normalizedList,
        totalReturned: normalizedList.length,
        lastProviderCall: new Date().toISOString(),
        isStale: false,
        pagination: rawJson.pagination,
      };
    } catch (err: any) {
      clearTimeout(timeoutId);

      const isTimeout = err?.name === 'AbortError' || err?.code === 'ETIMEDOUT';
      const cleanErr = this.sanitizeError(err?.message, apiKey);
      const msg = isTimeout
        ? 'AviationStack request timed out (10s). The provider may be temporarily busy.'
        : `AviationStack communication error: ${cleanErr}`;

      if (existingCache) {
        return {
          ...existingCache.data,
          providerStatus: 'CACHED',
          message: `${msg} Serving previously cached data.`,
          isStale: true,
        };
      }

      return {
        success: false,
        providerStatus: 'PROVIDER_ERROR',
        message: msg,
        flights: [],
        totalReturned: 0,
        isStale: false,
      };
    }
  }

  /**
   * Search for a specific flight by number/callsign.
   */
  public async getFlightByNumber(flightNumber: string): Promise<LiveFlightResponse> {
    return this.getLiveFlights({ flightNumber });
  }

  /**
   * Clears in-memory cache (useful for testing).
   */
  public clearCache(): void {
    this.cache.clear();
    this.inFlightRequests.clear();
  }
}

export const aviationStackService = new AviationStackService();
export default aviationStackService;
