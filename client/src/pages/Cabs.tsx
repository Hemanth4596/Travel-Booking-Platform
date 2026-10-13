import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Car, Users, ArrowRight, Loader2 } from 'lucide-react';
import ScrollReveal from '../components/ScrollReveal';

const Cabs = () => {
  const [cabs, setCabs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    const fetchCabs = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/cabs`);
        setCabs(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchCabs();
  }, []);

  const handleBook = async (cab: any) => {
    if (!user) { navigate('/login'); return; }
    try {
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/bookings`,
        {
          bookingType: 'CAB', itemId: cab._id, itemSnapshot: cab,
          travelDetails: { vehicleType: cab.vehicleType, vehicleName: cab.vehicleName },
          passengerOrGuestDetails: { count: 1 },
          priceBreakdown: { baseFare: cab.estimatedFare, taxes: Math.round(cab.estimatedFare * 0.1) },
          totalAmount: Math.round(cab.estimatedFare * 1.1)
        },
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      navigate(`/booking/${res.data._id}/payment`);
    } catch (err) { alert('Booking failed'); }
  };

  const categoryColors: Record<string, string> = {
    Mini: 'from-green-500/10 to-emerald-500/10 border-green-500/20 text-green-400',
    Sedan: 'from-blue-500/10 to-cyan-500/10 border-blue-500/20 text-blue-400',
    SUV: 'from-purple-500/10 to-violet-500/10 border-purple-500/20 text-purple-400',
  };

  return (
    <div className="min-h-screen bg-[#050a1a] pt-24 pb-16">
      <div className="max-w-6xl mx-auto px-4">
        <ScrollReveal>
          <div className="mb-8">
            <p className="text-cyan-400 text-sm font-semibold uppercase tracking-widest mb-2">Demo Inventory</p>
            <h1 className="text-4xl font-bold text-white">Available Cabs</h1>
            <p className="text-slate-400 mt-2">Estimated fares are demo values, not live pricing.</p>
          </div>
        </ScrollReveal>

        {loading ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="animate-spin text-cyan-500" size={32} />
          </div>
        ) : cabs.length === 0 ? (
          <div className="text-center py-24">
            <Car size={48} className="mx-auto text-slate-700 mb-4" />
            <p className="text-slate-500">No cabs available.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence>
              {cabs.map((cab, i) => (
                <motion.div
                  key={cab._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.06 }}
                  className="group bg-white/[0.03] border border-white/5 rounded-2xl p-6 hover:border-cyan-500/15 transition-all duration-300"
                >
                  <div className="flex items-center justify-between mb-5">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border border-cyan-500/20 flex items-center justify-center">
                      <Car size={24} className="text-cyan-400" />
                    </div>
                    <span className={`text-xs font-medium px-3 py-1 rounded-full bg-gradient-to-r border ${categoryColors[cab.vehicleType] || 'text-slate-400'}`}>
                      {cab.vehicleType}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-white mb-1">{cab.vehicleName}</h3>
                  <p className="text-sm text-slate-400 flex items-center gap-1 mb-4">
                    <Users size={12} /> {cab.passengerCapacity} passengers
                  </p>

                  {cab.features?.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-5">
                      {cab.features.map((f: string) => (
                        <span key={f} className="text-xs px-2 py-0.5 rounded-full bg-white/5 text-slate-400 border border-white/5">{f}</span>
                      ))}
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-4 border-t border-white/5">
                    <div>
                      <p className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">₹{cab.estimatedFare?.toLocaleString()}</p>
                      <p className="text-xs text-slate-500">estimated fare</p>
                    </div>
                    <button
                      onClick={() => handleBook(cab)}
                      className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-sm font-semibold hover:shadow-lg hover:shadow-cyan-500/25 transition-all flex items-center gap-2"
                    >
                      Book <ArrowRight size={14} />
                    </button>
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

export default Cabs;
