import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Plane, Clock, ArrowRight, SortAsc, Loader2 } from 'lucide-react';
import ScrollReveal from '../components/ScrollReveal';

const Flights = () => {
  const [flights, setFlights] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState('price');
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const fetchFlights = async () => {
      try {
        const params: any = {};
        const origin = searchParams.get('origin');
        const dest = searchParams.get('destination');
        if (origin) params.origin = origin;
        if (dest) params.destination = dest;
        const res = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/flights`, { params });
        setFlights(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchFlights();
  }, [searchParams]);

  const handleBook = async (flight: any) => {
    if (!user) { navigate('/login'); return; }
    try {
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/bookings`,
        {
          bookingType: 'FLIGHT', itemId: flight._id, itemSnapshot: flight,
          travelDetails: { origin: flight.origin, destination: flight.destination, departureTime: flight.departureTime },
          passengerOrGuestDetails: { count: 1 },
          priceBreakdown: { baseFare: flight.price, taxes: Math.round(flight.price * 0.1) },
          totalAmount: Math.round(flight.price * 1.1)
        },
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      navigate(`/booking/${res.data._id}/payment`);
    } catch (err) { alert('Booking failed. Please try again.'); }
  };

  const sorted = [...flights].sort((a, b) => {
    if (sortBy === 'price') return a.price - b.price;
    if (sortBy === 'duration') return a.durationMinutes - b.durationMinutes;
    return 0;
  });

  return (
    <div className="min-h-screen bg-[#050a1a] pt-24 pb-16">
      <div className="max-w-6xl mx-auto px-4">
        <ScrollReveal>
          <div className="mb-8">
            <p className="text-cyan-400 text-sm font-semibold uppercase tracking-widest mb-2">Demo Inventory</p>
            <h1 className="text-4xl font-bold text-white">Available Flights</h1>
          </div>
        </ScrollReveal>

        {/* Sort bar */}
        <div className="flex items-center gap-3 mb-6">
          <SortAsc size={16} className="text-slate-500" />
          <span className="text-sm text-slate-400">Sort by:</span>
          {['price', 'duration'].map(key => (
            <button
              key={key}
              onClick={() => setSortBy(key)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all
                ${sortBy === key ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/20' : 'text-slate-500 hover:text-white bg-white/5 border border-white/5'}`}
            >
              {key.charAt(0).toUpperCase() + key.slice(1)}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="animate-spin text-cyan-500" size={32} />
          </div>
        ) : sorted.length === 0 ? (
          <div className="text-center py-24">
            <Plane size={48} className="mx-auto text-slate-700 mb-4" />
            <p className="text-slate-500">No flights found. Try a different search.</p>
          </div>
        ) : (
          <div className="grid gap-4">
            <AnimatePresence>
              {sorted.map((flight, i) => (
                <motion.div
                  key={flight._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="group bg-white/[0.03] border border-white/5 rounded-2xl p-6 hover:bg-white/[0.06] hover:border-cyan-500/15 transition-all duration-300"
                >
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 font-bold text-sm shrink-0">
                        {flight.airline?.substring(0, 2)}
                      </div>
                      <div>
                        <p className="text-white font-semibold">{flight.airline}</p>
                        <p className="text-xs text-slate-500">{flight.flightNumber} · {flight.cabin}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-6 flex-1 justify-center">
                      <div className="text-center">
                        <p className="text-lg font-bold text-white">{flight.origin}</p>
                        <p className="text-xs text-slate-500">{new Date(flight.departureTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
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
                        <p className="text-xs text-slate-500">{new Date(flight.arrivalTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
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
