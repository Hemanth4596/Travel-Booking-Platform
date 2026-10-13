import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Building, MapPin, Star, Users, Loader2 } from 'lucide-react';
import ScrollReveal from '../components/ScrollReveal';
import { getDestinationImageUrl, getDestinationAltText } from '../data/destinations';

const Hotels = () => {
  const [hotels, setHotels] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const fetchHotels = async () => {
      try {
        const params: any = {};
        const dest = searchParams.get('destination');
        if (dest) params.destination = dest;
        const res = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/hotels`, { params });
        setHotels(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchHotels();
  }, [searchParams]);

  const handleBook = async (hotel: any, room: any) => {
    if (!user) { navigate('/login'); return; }
    try {
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/bookings`,
        {
          bookingType: 'HOTEL', itemId: hotel._id,
          itemSnapshot: { hotelName: hotel.name, roomName: room.name, destination: hotel.destination },
          travelDetails: { destination: hotel.destination, address: hotel.address },
          passengerOrGuestDetails: { count: 1 },
          priceBreakdown: { baseFare: room.pricePerNight, taxes: Math.round(room.pricePerNight * 0.1) },
          totalAmount: Math.round(room.pricePerNight * 1.1)
        },
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      navigate(`/booking/${res.data._id}/payment`);
    } catch (err) { alert('Booking failed. Please try again.'); }
  };

  return (
    <div className="min-h-screen bg-[#050a1a] pt-24 pb-16">
      <div className="max-w-6xl mx-auto px-4">
        <ScrollReveal>
          <div className="mb-8">
            <p className="text-cyan-400 text-sm font-semibold uppercase tracking-widest mb-2">Demo Inventory</p>
            <h1 className="text-4xl font-bold text-white">Available Hotels</h1>
          </div>
        </ScrollReveal>

        {loading ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="animate-spin text-cyan-500" size={32} />
          </div>
        ) : hotels.length === 0 ? (
          <div className="text-center py-24">
            <Building size={48} className="mx-auto text-slate-700 mb-4" />
            <p className="text-slate-500">No hotels found. Try a different destination.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence>
              {hotels.map((hotel, i) => (
                <motion.div
                  key={hotel._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.06 }}
                  className="group bg-white/[0.03] border border-white/5 rounded-2xl overflow-hidden hover:border-cyan-500/20 transition-all duration-300"
                >
                  {/* Hotel Destination Photography */}
                  <div className="h-48 relative overflow-hidden">
                    <img
                      src={getDestinationImageUrl(hotel.destination)}
                      alt={getDestinationAltText(hotel.destination)}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      loading="lazy"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/images/destinations/fallback.jpg';
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                    <div className="absolute top-3 right-3 flex items-center gap-1 px-2 py-1 rounded-full bg-black/60 backdrop-blur-sm border border-white/10">
                      <Star size={12} className="text-amber-400 fill-amber-400" />
                      <span className="text-xs text-white font-medium">{hotel.rating}</span>
                    </div>
                    <div className="absolute top-3 left-3 px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-sm border border-white/10 text-[10px] text-cyan-300 font-semibold uppercase tracking-wider">
                      {hotel.destination}
                    </div>
                  </div>

                  <div className="p-5">
                    <h3 className="text-lg font-bold text-white mb-1">{hotel.name}</h3>
                    <p className="text-sm text-slate-400 flex items-center gap-1 mb-1">
                      <MapPin size={12} /> {hotel.destination}
                    </p>
                    <p className="text-xs text-slate-500 mb-4">{hotel.description}</p>

                    {/* Amenities */}
                    {hotel.amenities?.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mb-4">
                        {hotel.amenities.slice(0, 3).map((a: string) => (
                          <span key={a} className="text-xs px-2 py-0.5 rounded-full bg-white/5 text-slate-400 border border-white/5">{a}</span>
                        ))}
                      </div>
                    )}

                    {/* Rooms */}
                    <div className="space-y-2 border-t border-white/5 pt-3">
                      {hotel.rooms.map((room: any) => (
                        <div key={room.name || room._id} className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-white font-medium">{room.name}</p>
                            <p className="text-xs text-slate-500 flex items-center gap-1"><Users size={10} /> Up to {room.maxGuests} guests</p>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="text-right">
                              <p className="text-sm font-bold text-cyan-400">₹{room.pricePerNight?.toLocaleString()}</p>
                              <p className="text-xs text-slate-600">per night</p>
                            </div>
                            <button
                              onClick={() => handleBook(hotel, room)}
                              className="px-3 py-1.5 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-medium hover:bg-cyan-500/20 transition-all"
                            >
                              Book
                            </button>
                          </div>
                        </div>
                      ))}
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

export default Hotels;
