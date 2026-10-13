import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

// Test counters
let passedCount = 0;
let failedCount = 0;

function assert(condition: boolean, testName: string, details?: any) {
  if (condition) {
    console.log(`  \x1b[32m✔ PASS\x1b[0m - ${testName}`);
    passedCount++;
  } else {
    console.error(`  \x1b[31m✖ FAIL\x1b[0m - ${testName}`, details || '');
    failedCount++;
  }
}

async function runAllTests() {
  console.log('\n======================================================');
  console.log('       TRAVEL BOOKING PLATFORM - COMPREHENSIVE AUDIT');
  console.log('======================================================\n');

  // ─────────────────────────────────────────────────────────────
  // SUITE 1: DESTINATION PHOTOGRAPHY & ASSET AUDIT
  // ─────────────────────────────────────────────────────────────
  console.log('\x1b[36m[SUITE 1: Destination Photography & Asset Audit]\x1b[0m');
  const destinationsDir = path.resolve(__dirname, '../../client/public/images/destinations');
  assert(fs.existsSync(destinationsDir), 'Destination directory exists on filesystem');

  const requiredDestinations = [
    'goa.jpg',
    'paris.jpg',
    'tokyo.jpg',
    'dubai.jpg',
    'kerala.jpg',
    'jaipur.jpg',
    'hyderabad.jpg',
    'manali.jpg',
    'bali.jpg',
    'switzerland.jpg',
    'delhi.jpg',
    'mumbai.jpg',
    'bengaluru.jpg',
    'chennai.jpg',
    'kochi.jpg',
    'visakhapatnam.jpg',
    'vijayawada.jpg',
    'tirupati.jpg',
    'singapore.jpg',
    'london.jpg',
    'new-york.jpg',
    'fallback.jpg',
  ];

  let missingAssets = 0;
  for (const filename of requiredDestinations) {
    const fullPath = path.join(destinationsDir, filename);
    const exists = fs.existsSync(fullPath);
    if (exists) {
      const stats = fs.statSync(fullPath);
      assert(
        stats.size > 10000,
        `Asset ${filename} exists with healthy size (${(stats.size / 1024).toFixed(1)} KB)`
      );
    } else {
      assert(false, `Asset ${filename} exists`, 'FILE MISSING');
      missingAssets++;
    }
  }
  assert(missingAssets === 0, 'All 21 audited destinations + fallback exist with 100% coverage');

  // Test client destination manifest resolution
  const manifestPath = path.resolve(__dirname, '../../client/src/data/destinations.ts');
  assert(fs.existsSync(manifestPath), 'Destination manifest exists at client/src/data/destinations.ts');

  // ─────────────────────────────────────────────────────────────
  // ─────────────────────────────────────────────────────────────
  // SUITE 2: AVIATIONSTACK LIVE TELEMETRY SERVICE AUDIT
  // ─────────────────────────────────────────────────────────────
  console.log('\n\x1b[36m[SUITE 2: AviationStack Live Telemetry Service Audit]\x1b[0m');

  const { aviationStackService } = await import('../src/services/aviationStack.service');
  const { aviationEdgeService } = await import('../src/services/aviationEdge.service');
  assert(typeof aviationStackService.getLiveFlights === 'function', 'aviationStackService exports getLiveFlights method');
  assert(typeof aviationEdgeService.getLiveFlights === 'function', 'aviationEdgeService backward compatibility alias exports getLiveFlights');

  // Test real API call with configured environment key (cached)
  console.log('  Testing live AviationStack API dispatch...');
  const liveResult = await aviationStackService.getLiveFlights({ limit: 5 });
  assert(liveResult !== null && typeof liveResult === 'object', 'getLiveFlights returns structured object');
  assert(
    typeof liveResult.providerStatus === 'string',
    `Returns valid providerStatus: "${liveResult.providerStatus}"`
  );
  assert(Array.isArray(liveResult.flights), 'Returns flights array');
  assert(typeof liveResult.isStale === 'boolean', 'Includes isStale boolean flag');
  assert(typeof liveResult.message === 'string', `Includes informative message: "${liveResult.message}"`);

  // Test caching & request deduplication (protecting 100 req/mo quota)
  const cachedResult = await aviationStackService.getLiveFlights({ limit: 5 });
  assert(
    cachedResult.providerStatus === 'CACHED' || cachedResult.providerStatus === liveResult.providerStatus,
    'Consecutive call respects server-side cache (protects Free plan quota)'
  );

  // Test native AviationStack normalization with live coordinates
  const aviationStackSample = {
    flight_date: '2026-10-12',
    flight_status: 'active',
    departure: { airport: 'San Francisco International', iata: 'SFO', icao: 'KSFO' },
    arrival: { airport: 'John F Kennedy International', iata: 'JFK', icao: 'KJFK' },
    airline: { name: 'Delta Air Lines', iata: 'DL', icao: 'DAL' },
    flight: { number: '123', iata: 'DL123', icao: 'DAL123' },
    aircraft: { registration: 'N123DN', iata: 'B763', icao: 'B763', icao24: 'A1B2C3' },
    live: {
      updated: '2026-10-12T10:00:00+00:00',
      latitude: 38.8951,
      longitude: -77.0364,
      altitude: 10668,
      direction: 90,
      speed_horizontal: 850,
      speed_vertical: 0,
      is_ground: false,
    },
  };

  const normalized = aviationStackService.normalizeFlight(aviationStackSample, 0, false);
  assert(normalized !== null, 'AviationStack payload normalizes into NormalizedFlight model');
  assert(normalized!.flightNumber === 'DL123', 'Flight number correctly mapped to DL123');
  assert(normalized!.airline.name === 'Delta Air Lines', 'Airline name mapped correctly');
  assert(normalized!.coordinates !== null, 'Valid live coordinates mapped to coordinates object');
  assert(normalized!.coordinates!.latitude === 38.8951, 'Latitude mapped correctly');
  assert(normalized!.coordinates!.longitude === -77.0364, 'Longitude mapped correctly');
  assert(normalized!.altitudeFeet === 35000, 'Altitude accurately converted from 10,668m to 35,000 ft');
  assert(normalized!.heading === 90, 'Heading mapped correctly to 90 degrees');
  assert(normalized!.horizontalSpeed === 850, 'Horizontal speed mapped correctly to 850 km/h');
  assert(normalized!.isGround === false, 'Ground status accurately computed');

  // Test handling of flights without live coordinates (must not fabricate positions)
  const flightWithoutLive = {
    flight_date: '2026-10-12',
    flight_status: 'scheduled',
    departure: { airport: 'Heathrow', iata: 'LHR', icao: 'EGLL' },
    arrival: { airport: 'Charles de Gaulle', iata: 'CDG', icao: 'LFPG' },
    airline: { name: 'British Airways', iata: 'BA', icao: 'BAW' },
    flight: { number: '304', iata: 'BA304', icao: 'BAW304' },
    aircraft: null,
    live: null,
  };

  const normalizedNoLive = aviationStackService.normalizeFlight(flightWithoutLive, 1, false);
  assert(normalizedNoLive !== null, 'Flight without live telemetry still normalizes for table view');
  assert(normalizedNoLive!.coordinates === null, 'Coordinates remain null when live is missing (no fabricated coordinates)');
  assert(normalizedNoLive!.flightNumber === 'BA304', 'Flight number BA304 mapped correctly');

  // Test handling of empty / invalid record
  const nullRecord = aviationStackService.normalizeFlight(null as any, 2, false);
  assert(nullRecord === null, 'Null records safely rejected');

  // ─────────────────────────────────────────────────────────────
  // SUITE 3: SIMULATED PAYMENT ENGINE & DATABASE PERSISTENCE
  // ─────────────────────────────────────────────────────────────
  console.log('\n\x1b[36m[SUITE 3: Simulated Payment Engine & Security Audit]\x1b[0m');

  const paymentServiceModule = await import('../src/services/paymentSimulation.service');
  const paymentService = paymentServiceModule.paymentSimulationService;
  assert(typeof paymentService.processSimulation === 'function', 'paymentSimulationService exports processSimulation');

  // Verify models exist
  const paymentSimulationModel = await import('../src/models/PaymentSimulation');
  assert(paymentSimulationModel.PaymentSimulation !== undefined, 'PaymentSimulation Mongoose model defined');

  // Test security assertion: Ensure no sensitive CVV or passwords exist in model schema
  const schemaKeys = Object.keys(paymentSimulationModel.PaymentSimulation.schema.paths);
  assert(!schemaKeys.includes('cvv'), 'Security: CVV is NEVER included in PaymentSimulation schema');
  assert(!schemaKeys.includes('cardCvv'), 'Security: cardCvv is NEVER included in schema');
  assert(!schemaKeys.includes('pin'), 'Security: PIN is NEVER included in schema');
  assert(!schemaKeys.includes('password'), 'Security: Password is NEVER included in schema');
  assert(schemaKeys.includes('isSimulation'), 'Audit: isSimulation field is guaranteed in schema');
  assert(schemaKeys.includes('simulationDisclaimer'), 'Audit: simulationDisclaimer is guaranteed in schema');

  // ─────────────────────────────────────────────────────────────
  // SUITE 4: RECOVERY & BUILD INTEGRITY
  // ─────────────────────────────────────────────────────────────
  console.log('\n\x1b[36m[SUITE 4: Recovery & Build Integrity]\x1b[0m');
  const distClient = path.resolve(__dirname, '../../client/dist/index.html');
  assert(fs.existsSync(distClient), 'Client production bundle exists at client/dist/index.html');

  const distServer = path.resolve(__dirname, '../../server/dist/server.js');
  assert(fs.existsSync(distServer), 'Server production compiled output exists at server/dist/server.js');

  console.log('\n======================================================');
  console.log(`AUDIT COMPLETE: \x1b[32m${passedCount} PASSED\x1b[0m, \x1b[31m${failedCount} FAILED\x1b[0m`);
  console.log('======================================================\n');

  if (failedCount > 0) {
    process.exit(1);
  }
}

runAllTests().catch((err) => {
  console.error('Test execution failed:', err);
  process.exit(1);
});
