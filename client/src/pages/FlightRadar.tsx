import { useState, useEffect, useMemo, lazy, Suspense } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plane,
  Search,
  RefreshCw,
  Compass,
  Radio,
  ShieldAlert,
  Table,
  Globe as GlobeIcon,
  Pause,
  Play,
  Navigation,
  MapPin,
  X,
} from 'lucide-react';
import type { NormalizedFlight, LiveFlightResponse } from '../types/flights';

// Lazy load 3D Globe component for optimal initial bundle performance
const FlightRadarCanvas = lazy(() => import('../components/3d/FlightRadarGlobe'));

export default function FlightRadar() {
  const [flights, setFlights] = useState<NormalizedFlight[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedFlight, setSelectedFlight] = useState<NormalizedFlight | null>(null);
  const [viewMode, setViewMode] = useState<'3d' | 'table'>('3d');
  const [autoRotate, setAutoRotate] = useState(true);
  const [autoRefreshEnabled, setAutoRefreshEnabled] = useState(true);
  const [webglSupported, setWebglSupported] = useState(true);
  const [secondsUntilRefresh, setSecondsUntilRefresh] = useState(60);

  // Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [airlineFilter, setAirlineFilter] = useState('');
  const [airportFilter, setAirportFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'AIRBORNE' | 'GROUND'>('ALL');

  // Provider response state
  const [providerStatus, setProviderStatus] = useState<LiveFlightResponse['providerStatus']>('LIVE_DATA');
  const [providerMessage, setProviderMessage] = useState<string>('');
  const [lastUpdatedTime, setLastUpdatedTime] = useState<string | null>(null);

  // WebGL availability check
  useEffect(() => {
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      if (!gl) {
        setWebglSupported(false);
        setViewMode('table');
      }
    } catch {
      setWebglSupported(false);
      setViewMode('table');
    }
  }, []);

  // Fetch live flights from backend API (querying AviationStack through cached backend service)
  const fetchFlights = async (isManual = false) => {
    if (isManual) setRefreshing(true);
    else setLoading(true);

    try {
      const res = await axios.get<LiveFlightResponse>(
        `${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/flights/live`,
        { params: { limit: 25 }, timeout: 12000 }
      );

      const data = res.data;
      setProviderStatus(data.providerStatus);
      setProviderMessage(data.message || '');
      setFlights(data.flights || []);
      setLastUpdatedTime(new Date().toLocaleTimeString());
      setSecondsUntilRefresh(60);
    } catch (err: any) {
      console.error('Failed to fetch live flight telemetry:', err);
      setProviderStatus('PROVIDER_ERROR');
      setProviderMessage(err.response?.data?.message || err.message || 'Unable to connect to AviationStack service');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchFlights();
  }, []);

  // Auto-refresh timer countdown (60s interval to protect Free tier 100 requests/month quota)
  useEffect(() => {
    if (!autoRefreshEnabled) return;

    const interval = setInterval(() => {
      // Don't count down if page is backgrounded to conserve user's monthly quota
      if (typeof document !== 'undefined' && document.hidden) return;

      setSecondsUntilRefresh((prev) => {
        if (prev <= 1) {
          fetchFlights(true);
          return 60;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [autoRefreshEnabled]);

  // Client-side filtering across loaded flight telemetry (instant search without burning API quota)
  const filteredFlights = useMemo(() => {
    return flights.filter((f) => {
      if (statusFilter === 'AIRBORNE' && f.isGround) return false;
      if (statusFilter === 'GROUND' && !f.isGround) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.trim().toLowerCase();
        const fnMatch = f.flightNumber?.toLowerCase().includes(q);
        const icaoMatch = f.icaoNumber?.toLowerCase().includes(q);
        const callsignMatch = f.aircraft?.registration?.toLowerCase().includes(q);
        if (!fnMatch && !icaoMatch && !callsignMatch) return false;
      }

      if (airlineFilter.trim()) {
        const al = airlineFilter.trim().toLowerCase();
        const nameMatch = f.airline?.name?.toLowerCase().includes(al);
        const codeMatch = f.airline?.iataCode?.toLowerCase().includes(al);
        if (!nameMatch && !codeMatch) return false;
      }

      if (airportFilter.trim()) {
        const ap = airportFilter.trim().toLowerCase();
        const depMatch = f.departure?.iataCode?.toLowerCase().includes(ap) || f.departure?.airport?.toLowerCase().includes(ap);
        const arrMatch = f.arrival?.iataCode?.toLowerCase().includes(ap) || f.arrival?.airport?.toLowerCase().includes(ap);
        if (!depMatch && !arrMatch) return false;
      }

      return true;
    });
  }, [flights, statusFilter, searchQuery, airlineFilter, airportFilter]);

  return (
    <div className="min-h-screen bg-[#020712] text-white pt-20 pb-12 flex flex-col">
      {/* ══════════════════════════════════════════════════
          RADAR CONTROLS & TELEMETRY HEADER
      ══════════════════════════════════════════════════ */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full mb-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 py-4 border-b border-white/[0.06]">
          {/* Title and Telemetry Status */}
          <div>
            <div className="flex items-center gap-3 mb-1">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-600/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                <Radio size={20} className="animate-pulse" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight bg-gradient-to-r from-white via-cyan-100 to-cyan-400 bg-clip-text text-transparent">
                  Live Flight Radar
                </h1>
                <p className="text-xs text-slate-400 flex items-center gap-2">
                  <span>AviationStack Telemetry Feed</span>
                  <span>&bull;</span>
                  <span className="font-mono text-cyan-400">
                    {lastUpdatedTime ? `Updated at ${lastUpdatedTime}` : 'Connecting...'}
                  </span>
                </p>
              </div>
            </div>
          </div>

          {/* Right Action Bar */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Telemetry Status Badge */}
            <div
              className={`px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-2 ${
                providerStatus === 'LIVE_DATA'
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                  : providerStatus === 'CACHED'
                  ? 'bg-blue-500/10 border-blue-500/30 text-blue-400'
                  : providerStatus === 'INVALID_API_KEY'
                  ? 'bg-amber-500/10 border-amber-500/30 text-amber-400'
                  : providerStatus === 'RATE_LIMITED'
                  ? 'bg-yellow-500/10 border-yellow-500/30 text-yellow-400'
                  : 'bg-red-500/10 border-red-500/30 text-red-400'
              }`}
            >
              <div
                className={`w-2 h-2 rounded-full ${
                  providerStatus === 'LIVE_DATA'
                    ? 'bg-emerald-400 animate-ping'
                    : providerStatus === 'CACHED'
                    ? 'bg-blue-400'
                    : providerStatus === 'INVALID_API_KEY'
                    ? 'bg-amber-400 animate-pulse'
                    : 'bg-red-400'
                }`}
              />
              <span>
                {providerStatus === 'LIVE_DATA'
                  ? 'LIVE TELEMETRY'
                  : providerStatus === 'CACHED'
                  ? 'CACHED TELEMETRY'
                  : providerStatus === 'INVALID_API_KEY'
                  ? 'PROVIDER NOTICE'
                  : providerStatus === 'RATE_LIMITED'
                  ? 'RATE LIMITED'
                  : 'PROVIDER ERROR'}
              </span>
            </div>

            {/* View Mode Toggle */}
            <div className="flex bg-white/[0.04] p-1 rounded-xl border border-white/[0.08]">
              <button
                onClick={() => setViewMode('3d')}
                disabled={!webglSupported}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  viewMode === '3d'
                    ? 'bg-cyan-500/20 text-cyan-300 shadow-sm border border-cyan-500/30'
                    : 'text-slate-400 hover:text-white'
                } ${!webglSupported ? 'opacity-40 cursor-not-allowed' : ''}`}
                title={!webglSupported ? 'WebGL not supported on this device' : '3D Globe View'}
              >
                <GlobeIcon size={14} />
                <span>3D Earth</span>
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  viewMode === 'table'
                    ? 'bg-cyan-500/20 text-cyan-300 shadow-sm border border-cyan-500/30'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Table size={14} />
                <span>Radar Table</span>
              </button>
            </div>

            {/* Manual Refresh Button */}
            <button
              onClick={() => fetchFlights(true)}
              disabled={refreshing}
              className="px-3.5 py-2 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/20 text-cyan-300 text-xs font-medium flex items-center gap-2 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <RefreshCw size={13} className={refreshing ? 'animate-spin text-cyan-400' : ''} />
              <span>Refresh {autoRefreshEnabled ? `(${secondsUntilRefresh}s)` : '(Paused)'}</span>
            </button>

            {/* Auto-Refresh Pause/Play Toggle (Preserves 100 req/mo quota) */}
            <button
              onClick={() => setAutoRefreshEnabled(!autoRefreshEnabled)}
              className={`p-2 rounded-xl border text-xs transition-all ${
                autoRefreshEnabled
                  ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400'
                  : 'bg-white/[0.04] border-white/[0.08] text-slate-400 hover:text-white'
              }`}
              title={autoRefreshEnabled ? 'Pause auto-refresh (protect quota)' : 'Resume auto-refresh (60s)'}
            >
              {autoRefreshEnabled ? <Pause size={14} /> : <Play size={14} />}
            </button>

            {/* Rotation toggle (for 3D mode) */}
            {viewMode === '3d' && (
              <button
                onClick={() => setAutoRotate(!autoRotate)}
                className={`p-2 rounded-xl border text-xs transition-all ${
                  autoRotate
                    ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400'
                    : 'bg-white/[0.04] border-white/[0.08] text-slate-400 hover:text-white'
                }`}
                title={autoRotate ? 'Pause Globe Rotation' : 'Resume Globe Rotation'}
              >
                {autoRotate ? <Compass size={14} className="animate-spin text-cyan-400" /> : <Play size={14} />}
              </button>
            )}
          </div>
        </div>

        {/* Informative Provider Banner for Missing/Invalid Key or Rate Limit */}
        {providerStatus === 'INVALID_API_KEY' && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-3 p-3.5 rounded-xl bg-amber-500/[0.08] border border-amber-500/25 flex items-start gap-3 text-amber-200/90 text-xs"
          >
            <ShieldAlert size={18} className="text-amber-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-amber-300">
                AviationStack Live Telemetry Notice
              </p>
              <p className="mt-0.5 text-slate-300 leading-relaxed">
                Requests are dispatched to{' '}
                <span className="font-mono text-cyan-300">
                  https://api.aviationstack.com/v1/flights
                </span>
                . The provider responded with <span className="font-mono text-amber-300">'Invalid Access Key'</span>.
                Real flights will stream live across the 3D radar globe as soon as an active AviationStack subscription key is configured in{' '}
                <span className="font-mono text-cyan-300">server/.env</span>.
              </p>
            </div>
          </motion.div>
        )}

        {providerStatus === 'RATE_LIMITED' && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-3 p-3.5 rounded-xl bg-yellow-500/[0.08] border border-yellow-500/25 flex items-start gap-3 text-yellow-200/90 text-xs"
          >
            <ShieldAlert size={18} className="text-yellow-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-yellow-300">
                AviationStack Free Plan Notice (100 Requests/Month)
              </p>
              <p className="mt-0.5 text-slate-300 leading-relaxed">
                {providerMessage || 'AviationStack request limit reached. Telemetry is being served from server cache to protect your quota.'}
              </p>
            </div>
          </motion.div>
        )}

        {/* Search & Filters Ribbon */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 mt-3">
          {/* Flight Number Search */}
          <div className="relative">
            <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder="Search flight (e.g. AI202, 6E101)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-white/[0.03] border border-white/[0.08] text-white text-xs placeholder-slate-500 focus:outline-none focus:border-cyan-500/40 focus:bg-white/[0.06] transition-all"
            />
          </div>

          {/* Airline Filter */}
          <div className="relative">
            <Plane size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder="Filter by airline (IATA or name)..."
              value={airlineFilter}
              onChange={(e) => setAirlineFilter(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-white/[0.03] border border-white/[0.08] text-white text-xs placeholder-slate-500 focus:outline-none focus:border-cyan-500/40 focus:bg-white/[0.06] transition-all"
            />
          </div>

          {/* Airport Filter */}
          <div className="relative">
            <MapPin size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder="Filter airport (e.g. DEL, BOM, DXB)..."
              value={airportFilter}
              onChange={(e) => setAirportFilter(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-white/[0.03] border border-white/[0.08] text-white text-xs placeholder-slate-500 focus:outline-none focus:border-cyan-500/40 focus:bg-white/[0.06] transition-all"
            />
          </div>

          {/* Status Tabs */}
          <div className="flex bg-white/[0.03] p-1 rounded-xl border border-white/[0.08]">
            {(['ALL', 'AIRBORNE', 'GROUND'] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => setStatusFilter(mode)}
                className={`flex-1 py-1 rounded-lg text-xs font-medium transition-all ${
                  statusFilter === mode
                    ? 'bg-cyan-500/20 text-cyan-300 font-semibold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {mode === 'ALL' ? 'All' : mode === 'AIRBORNE' ? 'Airborne' : 'Ground'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════
          MAIN VIEWPORT: 3D GLOBE OR 2D TABLE
      ══════════════════════════════════════════════════ */}
      <div className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full relative min-h-[580px] flex flex-col lg:flex-row gap-4">
        {/* Left: Viewport (3D Earth or 2D Table) */}
        <div className="flex-1 relative rounded-2xl overflow-hidden border border-white/[0.08] bg-[#030b1e]/80 min-h-[550px] flex flex-col">
          {viewMode === '3d' && webglSupported ? (
            <div className="w-full h-full min-h-[550px] relative">
              <Suspense
                fallback={
                  <div className="w-full h-full flex flex-col items-center justify-center gap-3 text-cyan-400">
                    <div className="w-10 h-10 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
                    <p className="text-xs text-slate-400">Loading 3D Radar Telemetry Globe...</p>
                  </div>
                }
              >
                <FlightRadarCanvas
                  flights={filteredFlights}
                  selectedFlight={selectedFlight}
                  onSelectFlight={(flight) => setSelectedFlight(flight)}
                  autoRotate={autoRotate}
                />
              </Suspense>

              {/* 3D Canvas HUD Overlay: Orbit instructions */}
              <div className="absolute top-4 left-4 pointer-events-none">
                <div className="bg-[#030919]/80 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/[0.08] text-[11px] text-slate-300 flex items-center gap-2">
                  <Compass size={13} className="text-cyan-400 animate-spin" />
                  <span>Drag to rotate globe &bull; Scroll to zoom &bull; Click aircraft for telemetry</span>
                </div>
              </div>

              {/* Aircraft Count Indicator */}
              <div className="absolute top-4 right-4 pointer-events-none">
                <div className="bg-[#030919]/80 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/[0.08] text-xs font-medium text-cyan-300 flex items-center gap-2">
                  <Plane size={14} className="text-cyan-400" />
                  <span>
                    {filteredFlights.filter((f) => f.coordinates !== null).length} Plotted on Globe &bull; {filteredFlights.length} in Feed
                  </span>
                </div>
              </div>

              {/* Empty state overlay when no flights returned */}
              {filteredFlights.length === 0 && !loading && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="bg-[#051126]/90 backdrop-blur-xl p-6 rounded-2xl border border-white/10 text-center max-w-sm pointer-events-auto">
                    <Plane size={36} className="mx-auto text-slate-600 mb-3" />
                    <h3 className="text-base font-bold text-white mb-1">No Active Aircraft in Feed</h3>
                    <p className="text-xs text-slate-400 mb-4 leading-relaxed">
                      {providerStatus === 'INVALID_API_KEY'
                        ? 'AviationStack API key returned an invalid credential response. Real aircraft will plot here once an active key is verified in server/.env.'
                        : 'No aircraft currently match your selected filters in provider coverage.'}
                    </p>
                    <button
                      onClick={() => {
                        setSearchQuery('');
                        setAirlineFilter('');
                        setAirportFilter('');
                        fetchFlights(true);
                      }}
                      className="px-4 py-2 rounded-xl bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-xs font-semibold hover:bg-cyan-500/30 transition-all"
                    >
                      Clear Filters & Refresh
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* 2D High-Density Radar Table (WebGL Fallback & Data Mode) */
            <div className="flex-1 overflow-x-auto p-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Table size={16} className="text-cyan-400" />
                  <span className="text-sm font-bold text-white">Live Flight Telemetry Stream</span>
                  <span className="text-xs text-slate-400">({filteredFlights.length} entries)</span>
                </div>
              </div>

              {filteredFlights.length === 0 ? (
                <div className="text-center py-20">
                  <Plane size={40} className="mx-auto text-slate-600 mb-3" />
                  <p className="text-sm text-slate-400 mb-1">No tracked aircraft found</p>
                  <p className="text-xs text-slate-600">
                    {providerMessage || 'Waiting for live provider telemetry from AviationStack'}
                  </p>
                </div>
              ) : (
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-white/[0.08] text-slate-400 uppercase text-[10px] tracking-wider">
                      <th className="py-2.5 px-3">Flight</th>
                      <th className="py-2.5 px-3">Airline</th>
                      <th className="py-2.5 px-3">Aircraft</th>
                      <th className="py-2.5 px-3">Altitude</th>
                      <th className="py-2.5 px-3">Speed</th>
                      <th className="py-2.5 px-3">Heading</th>
                      <th className="py-2.5 px-3">Route</th>
                      <th className="py-2.5 px-3">Status</th>
                      <th className="py-2.5 px-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.04]">
                    {filteredFlights.map((f) => (
                      <tr
                        key={f.id}
                        onClick={() => setSelectedFlight(f)}
                        className={`hover:bg-white/[0.03] cursor-pointer transition-colors ${
                          selectedFlight?.id === f.id ? 'bg-cyan-500/10' : ''
                        }`}
                      >
                        <td className="py-3 px-3 font-semibold text-white font-mono flex items-center gap-2">
                          <Plane size={12} className={f.isGround ? 'text-emerald-400' : 'text-cyan-400'} />
                          {f.flightNumber}
                        </td>
                        <td className="py-3 px-3 text-slate-300">
                          {f.airline.name || f.airline.iataCode || 'Unavailable'}
                        </td>
                        <td className="py-3 px-3 font-mono text-slate-400">
                          {f.aircraft.iataType || f.aircraft.registration || 'ADS-B'}
                        </td>
                        <td className="py-3 px-3 text-slate-300 font-mono">
                          {f.altitudeFeet ? `${f.altitudeFeet.toLocaleString()} ft` : 'Unavailable'}
                        </td>
                        <td className="py-3 px-3 text-slate-300 font-mono">
                          {f.horizontalSpeed ? `${Math.round(f.horizontalSpeed)} km/h` : 'Unavailable'}
                        </td>
                        <td className="py-3 px-3 text-slate-300 font-mono">
                          {f.heading !== null ? `${Math.round(f.heading)}°` : 'Unavailable'}
                        </td>
                        <td className="py-3 px-3 font-mono text-slate-300">
                          {f.departure.iataCode || '---'} &rarr; {f.arrival.iataCode || '---'}
                        </td>
                        <td className="py-3 px-3">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                              f.isGround
                                ? 'bg-emerald-500/15 text-emerald-400'
                                : 'bg-cyan-500/15 text-cyan-400'
                            }`}
                          >
                            {f.isGround ? 'Ground' : 'En-route'}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-right">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedFlight(f);
                            }}
                            className="px-2.5 py-1 rounded-lg bg-cyan-500/10 text-cyan-400 hover:bg-cyan-500/20 text-[11px] font-medium"
                          >
                            Telemetry
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}
        </div>

        {/* Right Sidebar: Tracked Flights List & Selected Detail Drawer */}
        <div className="w-full lg:w-96 flex flex-col gap-4">
          {/* Selected Flight Telemetry HUD Card */}
          <AnimatePresence>
            {selectedFlight && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: -10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -10 }}
                className="bg-[#050f26]/90 backdrop-blur-xl border border-cyan-500/30 rounded-2xl p-5 shadow-2xl relative overflow-hidden"
              >
                {/* Glow backdrop accent */}
                <div className="absolute -top-12 -right-12 w-32 h-32 bg-cyan-500/15 rounded-full blur-2xl pointer-events-none" />

                <div className="flex items-center justify-between pb-3 border-b border-white/[0.08] mb-4">
                  <div className="flex items-center gap-2">
                    <Plane size={18} className="text-cyan-400" />
                    <div>
                      <h3 className="text-lg font-bold text-white font-mono leading-tight">
                        {selectedFlight.flightNumber}
                      </h3>
                      <p className="text-[11px] text-slate-400">
                        {selectedFlight.airline.name || selectedFlight.airline.iataCode || 'AviationStack Telemetry'}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedFlight(null)}
                    className="p-1 rounded-lg text-slate-500 hover:text-white hover:bg-white/5 transition-colors"
                  >
                    <X size={16} />
                  </button>
                </div>

                {/* Telemetry Grid */}
                <div className="grid grid-cols-2 gap-3 text-xs mb-4">
                  <div className="bg-white/[0.03] p-2.5 rounded-xl border border-white/[0.04]">
                    <span className="text-[10px] text-slate-500 uppercase tracking-wider block mb-0.5">Altitude</span>
                    <span className="font-mono font-semibold text-white text-sm">
                      {selectedFlight.altitudeFeet ? `${selectedFlight.altitudeFeet.toLocaleString()} ft` : 'Unavailable'}
                    </span>
                    <span className="text-[10px] text-slate-400 block">
                      {selectedFlight.altitude ? `(${Math.round(selectedFlight.altitude)} m)` : ''}
                    </span>
                  </div>

                  <div className="bg-white/[0.03] p-2.5 rounded-xl border border-white/[0.04]">
                    <span className="text-[10px] text-slate-500 uppercase tracking-wider block mb-0.5">Speed</span>
                    <span className="font-mono font-semibold text-white text-sm">
                      {selectedFlight.horizontalSpeed ? `${Math.round(selectedFlight.horizontalSpeed)} km/h` : 'Unavailable'}
                    </span>
                    <span className="text-[10px] text-slate-400 block">
                      {selectedFlight.horizontalSpeed ? `(${Math.round(selectedFlight.horizontalSpeed * 0.539957)} kts)` : ''}
                    </span>
                  </div>

                  <div className="bg-white/[0.03] p-2.5 rounded-xl border border-white/[0.04]">
                    <span className="text-[10px] text-slate-500 uppercase tracking-wider block mb-0.5">Heading</span>
                    <span className="font-mono font-semibold text-white text-sm flex items-center gap-1">
                      <Navigation size={12} className="text-cyan-400" />
                      {selectedFlight.heading !== null ? `${Math.round(selectedFlight.heading)}°` : 'Unavailable'}
                    </span>
                  </div>

                  <div className="bg-white/[0.03] p-2.5 rounded-xl border border-white/[0.04]">
                    <span className="text-[10px] text-slate-500 uppercase tracking-wider block mb-0.5">Flight Status</span>
                    <span className="font-semibold text-cyan-300 text-xs">
                      {selectedFlight.isGround ? 'On Ground' : 'Airborne'}
                    </span>
                  </div>

                  <div className="bg-white/[0.03] p-2.5 rounded-xl border border-white/[0.04] col-span-2">
                    <span className="text-[10px] text-slate-500 uppercase tracking-wider block mb-0.5">Coordinates</span>
                    {selectedFlight.coordinates ? (
                      <span className="font-mono text-xs text-white">
                        Lat {selectedFlight.coordinates.latitude.toFixed(4)}°, Lng {selectedFlight.coordinates.longitude.toFixed(4)}°
                      </span>
                    ) : (
                      <span className="font-mono text-xs text-slate-400 italic">
                        Live ADS-B coordinates unavailable &bull; Plotted in table only
                      </span>
                    )}
                  </div>

                  <div className="bg-white/[0.03] p-2.5 rounded-xl border border-white/[0.04] col-span-2">
                    <span className="text-[10px] text-slate-500 uppercase tracking-wider block mb-0.5">Aircraft & Callsign</span>
                    <span className="font-mono text-xs text-slate-300 block">
                      Registration: {selectedFlight.aircraft.registration || 'Unavailable'}
                    </span>
                    <span className="font-mono text-[11px] text-slate-500 block">
                      ICAO Type: {selectedFlight.aircraft.icaoType || selectedFlight.aircraft.iataType || 'N/A'} &bull; 24-bit: {selectedFlight.aircraft.icao24 || 'N/A'}
                    </span>
                  </div>
                </div>

                <div className="pt-2 border-t border-white/[0.06] text-[10px] text-slate-500 flex items-center justify-between">
                  <span>Provider timestamp: {new Date(selectedFlight.lastUpdated || Date.now()).toLocaleTimeString()}</span>
                  <span className="text-cyan-400 font-mono">AviationStack Normalized</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Flights Feed List */}
          <div className="flex-1 bg-[#030b1e]/80 border border-white/[0.08] rounded-2xl p-4 flex flex-col max-h-[550px]">
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.06] mb-3">
              <span className="text-xs font-bold text-white uppercase tracking-wider">
                Tracked Aircraft ({filteredFlights.length})
              </span>
              <span className="text-[11px] text-slate-400">
                {flights.length} total in feed
              </span>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2 pr-1 scrollbar-thin scrollbar-thumb-white/10">
              {filteredFlights.length === 0 ? (
                <div className="text-center py-12 text-slate-500 text-xs">
                  <Plane size={24} className="mx-auto text-slate-700 mb-2" />
                  No aircraft matching filters
                </div>
              ) : (
                filteredFlights.map((f) => {
                  const isSelected = selectedFlight?.id === f.id;
                  return (
                    <div
                      key={f.id}
                      onClick={() => setSelectedFlight(f)}
                      className={`p-3 rounded-xl border cursor-pointer transition-all ${
                        isSelected
                          ? 'bg-cyan-500/15 border-cyan-500/40 shadow-lg shadow-cyan-500/10'
                          : 'bg-white/[0.02] border-white/[0.04] hover:bg-white/[0.05] hover:border-cyan-500/20'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="font-mono font-bold text-white text-xs flex items-center gap-1.5">
                          <Plane
                            size={12}
                            className={
                              isSelected ? 'text-amber-400' : f.isGround ? 'text-emerald-400' : 'text-cyan-400'
                            }
                          />
                          {f.flightNumber}
                        </span>
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                            f.isGround
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                              : 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20'
                          }`}
                        >
                          {f.isGround ? 'Ground' : 'En-route'}
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-[11px] text-slate-400">
                        <span className="truncate max-w-[140px]">
                          {f.airline.name || f.airline.iataCode || 'AviationStack'}
                        </span>
                        <span className="font-mono text-cyan-300">
                          {f.altitudeFeet ? `${Math.round(f.altitudeFeet / 1000)}k ft` : '--'}
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-[10px] text-slate-500 mt-1 pt-1.5 border-t border-white/[0.04]">
                        <span className="font-mono">
                          {f.departure.iataCode || '---'} &rarr; {f.arrival.iataCode || '---'}
                        </span>
                        <span className="font-mono">
                          {f.horizontalSpeed ? `${Math.round(f.horizontalSpeed)} km/h` : '--'}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
