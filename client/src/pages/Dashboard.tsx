import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { Plane, Building, Car, Calendar, XCircle, CheckCircle, Clock, ArrowRight, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import ScrollReveal from '../components/ScrollReveal';
import { getDestinationImageUrl, getDestinationAltText } from '../data/destinations';

const statusColors: Record<string, string> = {
  CONFIRMED: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  PENDING: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  CANCELLED: 'bg-red-500/10 text-red-400 border-red-500/20',
  FAILED: 'bg-red-500/10 text-red-400 border-red-500/20',
  SUCCESS: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  REFUNDED: 'bg-violet-500/10 text-violet-400 border-violet-500/20',
};

const typeIcons: Record<string, any> = { FLIGHT: Plane, HOTEL: Building, CAB: Car };

const Dashboard = () => {
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchBookings = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/bookings/my`, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      setBookings(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchBookings(); }, []);

  const handleCancel = async (id: string) => {
    if (!confirm('Are you sure you want to cancel this booking?')) return;
    try {
      await axios.patch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/bookings/${id}/cancel`, {}, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      fetchBookings();
    } catch (err) { alert('Cancel failed'); }
  };

  const confirmed = bookings.filter(b => b.bookingStatus === 'CONFIRMED').length;
  const pending = bookings.filter(b => b.bookingStatus === 'PENDING').length;

  return (
    <div className="min-h-screen bg-[#050a1a] pt-24 pb-16">
      <div className="max-w-6xl mx-auto px-4">
        {/* Welcome */}
        <ScrollReveal>
          <div className="mb-10">
            <h1 className="text-4xl font-bold text-white mb-2">
              Welcome back, <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">{user?.name}</span>
            </h1>
            <p className="text-slate-400">Manage your bookings and travel plans.</p>
          </div>
        </ScrollReveal>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          {[
            { label: 'Total Bookings', value: bookings.length, icon: Calendar, color: 'cyan' },
            { label: 'Confirmed', value: confirmed, icon: CheckCircle, color: 'emerald' },
            { label: 'Pending Payment', value: pending, icon: Clock, color: 'amber' },
            { label: 'Cancelled', value: bookings.filter(b => b.bookingStatus === 'CANCELLED').length, icon: XCircle, color: 'red' },
          ].map((stat, i) => (
            <ScrollReveal key={stat.label} delay={i * 0.1}>
              <div className="bg-white/[0.03] border border-white/5 rounded-2xl p-5">
                <stat.icon size={20} className={`text-${stat.color}-400 mb-3`} />
                <p className="text-2xl font-bold text-white">{stat.value}</p>
                <p className="text-xs text-slate-500">{stat.label}</p>
              </div>
            </ScrollReveal>
          ))}
        </div>

        {/* Bookings */}
        <ScrollReveal>
          <h2 className="text-xl font-bold text-white mb-5">My Bookings</h2>
        </ScrollReveal>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="animate-spin text-cyan-500" size={32} />
          </div>
        ) : bookings.length === 0 ? (
          <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-12 text-center">
            <Calendar size={48} className="mx-auto text-slate-700 mb-4" />
            <p className="text-slate-500 mb-4">No bookings yet. Start exploring!</p>
            <Link to="/flights" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-sm font-semibold">
              Search Flights <ArrowRight size={14} />
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {bookings.map((booking, i) => {
              const Icon = typeIcons[booking.bookingType] || Plane;
              const destName = booking.travelDetails?.destination || booking.itemSnapshot?.destination || booking.travelDetails?.city || 'Travel';
              const destImg = getDestinationImageUrl(destName);
              const destAlt = getDestinationAltText(destName);

              return (
                <motion.div
                  key={booking._id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="bg-white/[0.03] border border-white/5 rounded-2xl p-5 hover:border-cyan-500/15 transition-all"
                >
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div className="flex items-center gap-4">
                      {/* Destination Photography Thumbnail */}
                      <div className="w-14 h-14 rounded-xl overflow-hidden shrink-0 border border-white/10 relative">
                        <img
                          src={destImg}
                          alt={destAlt}
                          className="w-full h-full object-cover"
                          loading="lazy"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = '/images/destinations/fallback.jpg';
                          }}
                        />
                        <div className="absolute inset-0 bg-black/20" />
                        <div className="absolute bottom-1 right-1 w-5 h-5 rounded-md bg-black/70 flex items-center justify-center text-cyan-400">
                          <Icon size={12} />
                        </div>
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-white font-semibold">
                            {destName} &bull; {booking.bookingType}
                          </p>
                          <span className="font-mono text-xs text-cyan-400 font-bold bg-cyan-500/10 px-1.5 py-0.5 rounded">
                            {booking.bookingReference}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400">
                          {booking.itemSnapshot?.hotelName || booking.itemSnapshot?.airline || booking.travelDetails?.vehicleName || 'Booking Details'} &bull; {new Date(booking.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className={`text-xs font-medium px-2.5 py-1 rounded-full border ${statusColors[booking.bookingStatus]}`}>
                        {booking.bookingStatus}
                      </span>
                      <span className={`text-xs font-medium px-2.5 py-1 rounded-full border ${statusColors[booking.paymentStatus]}`}>
                        {booking.paymentStatus}
                      </span>
                    </div>

                    <div className="flex items-center gap-4">
                      <p className="text-lg font-bold text-white">₹{booking.totalAmount?.toLocaleString()}</p>
                      {booking.bookingStatus === 'PENDING' && (
                        <Link
                          to={`/booking/${booking._id}/payment`}
                          className="px-4 py-1.5 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-medium hover:bg-cyan-500/20 transition-all"
                        >
                          Pay Now
                        </Link>
                      )}
                      {booking.bookingStatus === 'CONFIRMED' && (
                        <button
                          onClick={() => handleCancel(booking._id)}
                          className="px-4 py-1.5 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-medium hover:bg-red-500/20 transition-all"
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
