import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Plane, Clock, ArrowRight, SortAsc, Loader2, Search, RotateCcw, MapPin } from 'lucide-react';
import ScrollReveal from '../components/ScrollReveal';
import { API_BASE } from '../config/api';

const defaultFallbackFlights = [
  { _id: 'def-f1', airline: 'IndiGo', flightNumber: '6E-101', origin: 'Delhi', destination: 'Mumbai', departureTime: new Date(Date.now() + 86400000).toISOString(), arrivalTime: new Date(Date.now() + 93600000).toISOString(), durationMinutes: 120, stops: 0, price: 4500, cabin: 'Economy' },
  { _id: 'def-f2', airline: 'Air India', flightNumber: 'AI-202', origin: 'Mumbai', destination: 'Bengaluru', departureTime: new Date(Date.now() + 86400000 * 2).toISOString(), arrivalTime: new Date(Date.now() + 86400000 * 2 + 7200000).toISOString(), durationMinutes: 120, stops: 0, price: 5500, cabin: 'Economy' },
  { _id: 'def-f3', airline: 'Vistara', flightNumber: 'UK-303', origin: 'Bengaluru', destination: 'Hyderabad', departureTime: new Date(Date.now() + 86400000 * 3).toISOString(), arrivalTime: new Date(Date.now() + 86400000 * 3 + 3600000).toISOString(), durationMinutes: 60, stops: 0, price: 3500, cabin: 'Business' },
  { _id: 'def-f4', airline: 'SpiceJet', flightNumber: 'SG-404', origin: 'Hyderabad', destination: 'Chennai', departureTime: new Date(Date.now() + 86400000 * 4).toISOString(), arrivalTime: new Date(Date.now() + 86400000 * 4 + 4500000).toISOString(), durationMinutes: 75, price: 2800, cabin: 'Economy' },
  { _id: 'def-f5', airline: 'Akasa Air', flightNumber: 'QP-505', origin: 'Chennai', destination: 'Goa', departureTime: new Date(Date.now() + 86400000 * 5).toISOString(), arrivalTime: new Date(Date.now() + 86400000 * 5 + 5400000).toISOString(), durationMinutes: 90, price: 4200, cabin: 'Economy' },
  { _id: 'def-f6', airline: 'IndiGo', flightNumber: '6E-606', origin: 'Delhi', destination: 'Goa', departureTime: new Date(Date.now() + 86400000 * 6).toISOString(), arrivalTime: new Date(Date.now() + 86400000 * 6 + 9000000).toISOString(), durationMinutes: 150, price: 6000, cabin: 'Economy' },
];

const Flights = () => {
  const [flights, setFlights] = useState<any[]>(defaultFallbackFlights);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState('price');
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  // Search filter states
  const [originInput, setOriginInput] = useState(searchParams.get('origin') || '');
  const [destInput, setDestInput] = useState(searchParams.get('destination') || '');

  const fetchFlights = async () => {
    setLoading(true);
    try {
      const params: any = {};
      const origin = searchParams.get('origin');
      const dest = searchParams.get('destination');
      const date = searchParams.get('date');
      if (origin) params.origin = origin;
      if (dest) params.destination = dest;
      if (date) params.date = date;

      const res = await axios.get(`${API_BASE}/flights`, { params });
      if (Array.isArray(res.data) && res.data.length > 0) {
        setFlights(res.data);
      } else {
        // Fallback filter
        const filtered = defaultFallbackFlights.filter(f => {
          const matchOrig = !origin || f.origin.toLowerCase().includes(origin.toLowerCase());
          const matchDest = !dest || f.destination.toLowerCase().includes(dest.toLowerCase());
          return matchOrig || matchDest;
        });
        setFlights(filtered.length > 0 ? filtered : defaultFallbackFlights);
      }
    } catch (err) {
      console.error('Failed to fetch flights:', err);
      setFlights(defaultFallbackFlights);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setOriginInput(searchParams.get('origin') || '');
    setDestInput(searchParams.get('destination') || '');
    fetchFlights();
  }, [searchParams]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (originInput.trim()) params.set('origin', originInput.trim());
    if (destInput.trim()) params.set('destination', destInput.trim());
    setSearchParams(params);
  };

  const handleClearFilters = () => {
    setOriginInput('');
    setDestInput('');
    setSearchParams(new URLSearchParams());
  };

  const handleQuickRoute = (orig: string, dest: string) => {
    setOriginInput(orig);
    setDestInput(dest);
    const params = new URLSearchParams();
    params.set('origin', orig);
    params.set('destination', dest);
    setSearchParams(params);
  };

  const handleBook = async (flight: any) => {
    if (!user) { navigate('/login'); return; }
    try {
      const res = await axios.post(
        `${API_BASE}/bookings`,
        {
          bookingType: 'FLIGHT',
          itemId: flight._id.startsWith('def-') ? '6630f9a2b7e1234567890123' : flight._id,
          itemSnapshot: flight,
          travelDetails: { origin: flight.origin, destination: flight.destination, departureTime: flight.departureTime },
          passengerOrGuestDetails: { count: 1 },
          priceBreakdown: { baseFare: flight.price, taxes: Math.round(flight.price * 0.1) },
          totalAmount: Math.round(flight.price * 1.1),
        },
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      navigate(`/booking/${res.data._id}/payment`);
    } catch (err) {
      alert('Booking failed. Please check your network or try again.');
    }
  };

  const sorted = [...flights].sort((a, b) => {
    if (sortBy === 'price') return a.price - b.price;
    if (sortBy === 'duration') return a.durationMinutes - b.durationMinutes;
    return 0;
  });

  const hasActiveFilter = Boolean(searchParams.get('origin') || searchParams.get('destination'));

  return (
    <div className="min-h-screen bg-[#050a1a] pt-24 pb-16">
      <div className="max-w-6xl mx-auto px-4">
        <ScrollReveal>
          <div className="mb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <p className="text-cyan-400 text-sm font-semibold uppercase tracking-widest mb-2">Live Inventory</p>
              <h1 className="text-4xl font-bold text-white">Available Flights</h1>
              <p className="text-slate-400 text-sm mt-1">Book direct or connecting domestic & international flights.</p>
            </div>
            {hasActiveFilter && (
              <button
                onClick={handleClearFilters}
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-cyan-400 hover:text-cyan-300 border border-white/10 text-xs font-medium transition-all"
              >
                <RotateCcw size={13} /> View All Flights
              </button>
            )}
          </div>
        </ScrollReveal>

        {/* Search & Filter Bar */}
        <div className="mb-6 bg-white/[0.03] border border-white/10 rounded-2xl p-4 shadow-xl backdrop-blur-xl">
          <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
            <div className="sm:col-span-5 relative">
              <MapPin size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-cyan-400" />
              <input
                type="text"
                value={originInput}
                onChange={e => setOriginInput(e.target.value)}
                placeholder="From (e.g. Delhi, Mumbai)"
                className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500/50 text-sm"
              />
            </div>
            <div className="sm:col-span-5 relative">
              <Plane size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-blue-400" />
              <input
                type="text"
                value={destInput}
                onChange={e => setDestInput(e.target.value)}
                placeholder="To (e.g. Goa, Bengaluru, Paris)"
                className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500/50 text-sm"
              />
            </div>
            <div className="sm:col-span-2 flex gap-2">
              <button
                type="submit"
                className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold text-sm hover:shadow-lg hover:shadow-cyan-500/25 transition-all flex items-center justify-center gap-1.5"
              >
                <Search size={15} /> Search
              </button>
            </div>
          </form>

          {/* Popular Route Shortcuts */}
          <div className="mt-3.5 pt-3 border-t border-white/5 flex items-center gap-2 flex-wrap">
            <span className="text-xs text-slate-500">Popular:</span>
            {[
              { from: 'Delhi', to: 'Mumbai' },
              { from: 'Delhi', to: 'Goa' },
              { from: 'Mumbai', to: 'Bengaluru' },
              { from: 'Bengaluru', to: 'Hyderabad' },
              { from: 'Chennai', to: 'Goa' },
            ].map(r => (
              <button
                key={`${r.from}-${r.to}`}
                type="button"
                onClick={() => handleQuickRoute(r.from, r.to)}
                className="text-xs px-2.5 py-1 rounded-lg bg-white/5 hover:bg-cyan-500/10 border border-white/5 hover:border-cyan-500/30 text-slate-400 hover:text-cyan-300 transition-all"
              >
                {r.from} → {r.to}
              </button>
            ))}
          </div>
        </div>

        {/* Sort bar & count */}
        <div className="flex items-center justify-between mb-5">
          <p className="text-xs text-slate-400">
            Showing <span className="text-white font-semibold">{sorted.length}</span> flight(s)
          </p>
          <div className="flex items-center gap-2">
            <SortAsc size={14} className="text-slate-500" />
            <span className="text-xs text-slate-400">Sort:</span>
            {['price', 'duration'].map(key => (
              <button
                key={key}
                onClick={() => setSortBy(key)}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-all
                  ${sortBy === key ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/20' : 'text-slate-500 hover:text-white bg-white/5 border border-white/5'}`}
              >
                {key.charAt(0).toUpperCase() + key.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="animate-spin text-cyan-500" size={32} />
          </div>
        ) : sorted.length === 0 ? (
          <div className="text-center py-20 bg-white/[0.02] border border-white/5 rounded-2xl p-8">
            <Plane size={48} className="mx-auto text-slate-700 mb-4" />
            <h3 className="text-lg font-bold text-white mb-2">No flights found matching your criteria</h3>
            <p className="text-slate-400 text-sm mb-5">Try clearing your search filters or explore all popular routes.</p>
            <button
              onClick={handleClearFilters}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-sm font-semibold hover:shadow-lg transition-all"
            >
              View All Flights
            </button>
          </div>
        ) : (
          <div className="grid gap-4">
            <AnimatePresence>
              {sorted.map((flight, i) => (
                <motion.div
                  key={flight._id || `flight-${i}`}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className="group bg-white/[0.03] border border-white/5 rounded-2xl p-6 hover:bg-white/[0.06] hover:border-cyan-500/20 transition-all duration-300"
                >
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 font-bold text-sm shrink-0">
                        {flight.airline?.substring(0, 2) || 'FL'}
                      </div>
                      <div>
                        <p className="text-white font-semibold">{flight.airline}</p>
                        <p className="text-xs text-slate-500">{flight.flightNumber} · {flight.cabin}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-6 flex-1 justify-center">
                      <div className="text-center">
                        <p className="text-lg font-bold text-white">{flight.origin}</p>
                        <p className="text-xs text-slate-500">
                          {flight.departureTime ? new Date(flight.departureTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '10:00 AM'}
                        </p>
                      </div>
                      <div className="flex flex-col items-center gap-1 flex-1 max-w-[200px]">
                        <span className="text-xs text-slate-500 flex items-center gap-1"><Clock size={10} /> {flight.durationMinutes} min</span>
                        <div className="w-full flex items-center gap-1">
                          <div className="h-px flex-1 bg-gradient-to-r from-cyan-500/50 to-transparent" />
                          <Plane size={12} className="text-cyan-500 -rotate-45" />
                          <div className="h-px flex-1 bg-gradient-to-l from-cyan-500/50 to-transparent" />
                        </div>
                        <span className="text-xs text-slate-600">{flight.stops === 0 ? 'Non-stop' : `${flight.stops} stop(s)`}</span>
                      </div>
                      <div className="text-center">
                        <p className="text-lg font-bold text-white">{flight.destination}</p>
                        <p className="text-xs text-slate-500">
                          {flight.arrivalTime ? new Date(flight.arrivalTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '12:00 PM'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 justify-between md:justify-end">
                      <div className="text-right">
                        <p className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">₹{flight.price?.toLocaleString()}</p>
                        <p className="text-xs text-slate-500">per person</p>
                      </div>
                      <button
                        onClick={() => handleBook(flight)}
                        className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-sm font-semibold hover:shadow-lg hover:shadow-cyan-500/25 transition-all flex items-center gap-2"
                      >
                        Book <ArrowRight size={14} />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
};

export default Flights;
