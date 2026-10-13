/**
 * Aviation Edge / AviationStack Adapter Service
 * Provides backward compatibility while routing to AviationStack
 */

import {
  aviationStackService,
  AviationStackService,
  NormalizedFlight,
  FlightQueryFilters,
  LiveFlightResponse,
} from './aviationStack.service';

export {
  aviationStackService,
  NormalizedFlight,
  FlightQueryFilters,
  LiveFlightResponse,
};

// Aliases for backward compatibility
export const aviationEdgeService = aviationStackService;
export const AviationEdgeService = AviationStackService;
export default aviationStackService;
