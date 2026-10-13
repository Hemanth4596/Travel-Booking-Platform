import { useState, useEffect, lazy, Suspense } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plane, Building, Car, Search, MapPin, Calendar, ArrowRight, ArrowRightLeft,
  Star, ChevronDown, Globe as GlobeIcon, Compass, CreditCard,
  ArrowUpRight, Sparkles
} from 'lucide-react';
import ScrollReveal from '../components/ScrollReveal';
import axios from 'axios';
import { getDestinationImageUrl, getDestinationAltText } from '../data/destinations';

const HeroScene = lazy(() => import('../components/3d/HeroScene'));

// ─── Destination Card Data ────────────────────────────────
const heroDestinations = [
  { name: 'Goa', tagline: 'Tropical Paradise', img: '/images/destinations/goa.jpg' },
  { name: 'Paris', tagline: 'City of Lights', img: '/images/destinations/paris.jpg' },
  { name: 'Tokyo', tagline: 'Neon Wonderland', img: '/images/destinations/tokyo.jpg' },
  { name: 'Dubai', tagline: 'Desert Luxury', img: '/images/destinations/dubai.jpg' },
];

const destinations = [
  { name: 'Goa', desc: 'Sun-kissed beaches and vibrant nightlife', img: '/images/destinations/goa.jpg', large: true },
  { name: 'Kerala', desc: 'Serene backwaters and lush greenery', img: '/images/destinations/kerala.jpg' },
  { name: 'Jaipur', desc: 'Royal palaces and pink city charm', img: '/images/destinations/jaipur.jpg' },
  { name: 'Hyderabad', desc: 'Historic monuments and culinary delights', img: '/images/destinations/hyderabad.jpg', large: true },
  { name: 'Manali', desc: 'Snow-capped peaks and adventure trails', img: '/images/destinations/manali.jpg' },
  { name: 'Tokyo', desc: 'Futuristic cityscape meets ancient tradition', img: '/images/destinations/tokyo.jpg' },
  { name: 'Bali', desc: 'Tropical paradise and spiritual retreats', img: '/images/destinations/bali.jpg', large: true },
  { name: 'Switzerland', desc: 'Alpine grandeur and pristine lakes', img: '/images/destinations/switzerland.jpg' },
];

// ─── Floating Destination Card ────────────────────────────
function DestinationCard({
  dest,
  index,
  onClick,
}: {
  dest: typeof heroDestinations[0];
  index: number;
  onClick: () => void;
}) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.button
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.8,
        delay: 1.2 + index * 0.15,
        ease: [0.25, 0.46, 0.45, 0.94],
      }}
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="group relative w-40 sm:w-44 lg:w-48 aspect-[3/4] rounded-2xl overflow-hidden cursor-pointer focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:ring-offset-2 focus:ring-offset-transparent"
      style={{ transform: isHovered ? 'translateY(-6px)' : 'translateY(0)' }}
      aria-label={`Explore ${dest.name}`}
    >
      {/* Image */}
      <img
        src={dest.img}
        alt={dest.name}
        className="absolute inset-0 w-full h-full object-cover transition-transform duration-700"
        style={{ transform: isHovered ? 'scale(1.08)' : 'scale(1)' }}
        loading="lazy"
        onError={(e) => {
          (e.target as HTMLImageElement).src = `https://placehold.co/400x530/0a1628/0ea5e9?text=${dest.name}`;
        }}
      />
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

      {/* Glass border */}
      <div
        className="absolute inset-0 rounded-2xl border transition-all duration-500"
        style={{
          borderColor: isHovered ? 'rgba(14, 165, 233, 0.4)' : 'rgba(255, 255, 255, 0.1)',
          boxShadow: isHovered
            ? '0 20px 40px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.1)'
            : '0 8px 24px rgba(0,0,0,0.3)',
        }}
      />

      {/* Content */}
      <div className="absolute bottom-0 left-0 right-0 p-4">
        <p className="text-xs text-cyan-400 font-medium uppercase tracking-wider mb-1">{dest.tagline}</p>
        <h3 className="text-lg font-bold text-white mb-2">{dest.name}</h3>
        <div className="flex items-center gap-1 text-white/70 text-xs font-medium">
          <span>Explore</span>
          <ArrowUpRight
            size={12}
            className="transition-transform duration-300"
            style={{ transform: isHovered ? 'translate(2px, -2px)' : 'translate(0, 0)' }}
          />
        </div>
      </div>
    </motion.button>
  );
}

// ─── Main Home Component ──────────────────────────────────
const Home = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'flights' | 'hotels' | 'cabs'>('flights');

  // Flight form
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [departureDate, setDepartureDate] = useState('');
  const [returnDate, setReturnDate] = useState('');
  const [passengers, setPassengers] = useState('1');
  const [cabinClass, setCabinClass] = useState('Economy');
  const [tripType, setTripType] = useState<'oneway' | 'roundtrip'>('oneway');

  // Hotel form
  const [hotelDest, setHotelDest] = useState('');
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [guests, setGuests] = useState('2');
  const [rooms, setRooms] = useState('1');

  // Cab form
  const [pickupLocation, setPickupLocation] = useState('');
  const [dropoffLocation, setDropoffLocation] = useState('');
  const [pickupDate, setPickupDate] = useState('');
  const [pickupTime, setPickupTime] = useState('');
  const [cabPassengers, setCabPassengers] = useState('1');

  // Data
  const [featuredFlights, setFeaturedFlights] = useState<any[]>([]);
  const [featuredHotels, setFeaturedHotels] = useState<any[]>([]);

  useEffect(() => {
    axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/flights`)
      .then(r => setFeaturedFlights(r.data.slice(0, 4))).catch(() => {});
    axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/hotels`)
      .then(r => setFeaturedHotels(r.data.slice(0, 4))).catch(() => {});
  }, []);

  const handleFlightSearch = () => {
    const params = new URLSearchParams();
    if (origin) params.set('origin', origin);
    if (destination) params.set('destination', destination);
    if (departureDate) params.set('date', departureDate);
    navigate(`/flights?${params.toString()}`);
  };

  const handleHotelSearch = () => {
    const params = new URLSearchParams();
    if (hotelDest) params.set('destination', hotelDest);
    navigate(`/hotels?${params.toString()}`);
  };

  const handleCabSearch = () => navigate('/cabs');

  const swapLocations = () => {
    const temp = origin;
    setOrigin(destination);
    setDestination(temp);
  };

  const handleDestinationClick = (name: string) => {
    setHotelDest(name);
    setDestination(name);
    setActiveTab('flights');
    // Scroll to search panel on mobile
    const panel = document.getElementById('search-panel');
    if (panel && window.innerWidth < 1024) {
      panel.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  return (
    <div className="bg-[#030712]">
      {/* ═══════════════════════════════════════════════
          CINEMATIC HERO
       ═══════════════════════════════════════════════ */}
      <section className="relative min-h-screen overflow-hidden">
        {/* Sunset background gradient */}
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-b from-[#020816] via-[#0a1628] to-[#030712]" />
          {/* Warm sunset glow behind globe */}
          <div
            className="absolute top-1/4 right-1/4 w-[800px] h-[800px] rounded-full opacity-30 blur-[120px]"
            style={{
              background: 'radial-gradient(circle, rgba(249,115,22,0.3) 0%, rgba(14,165,233,0.1) 50%, transparent 70%)',
            }}
          />
          {/* Cool blue ambient */}
          <div
            className="absolute bottom-0 left-0 w-[600px] h-[600px] rounded-full opacity-20 blur-[100px]"
            style={{
              background: 'radial-gradient(circle, rgba(14,165,233,0.3) 0%, transparent 60%)',
            }}
          />
        </div>

        {/* 3D Globe Canvas */}
        <div className="absolute inset-0 z-[1]">
          <Suspense fallback={<div className="w-full h-full bg-[#030712]" />}>
            <HeroScene />
          </Suspense>
        </div>

        {/* Gradient overlay for text readability */}
        <div className="absolute inset-0 z-[2] pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-r from-[#030712]/90 via-[#030712]/40 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-[#030712] to-transparent" />
        </div>

        {/* Hero Content */}
        <div className="relative z-[5] max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full pt-28 lg:pt-32">
          <div className="min-h-[calc(100vh-8rem)] flex flex-col justify-between pb-8">
            {/* Top area: Heading + Stats */}
            <div className="max-w-2xl">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3, duration: 0.7 }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cyan-500/[0.08] border border-cyan-500/20 text-cyan-300 text-sm font-medium mb-8"
              >
                <Sparkles size={14} />
                Explore 50+ destinations worldwide
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
                className="mb-6"
              >
                <span className="block text-6xl sm:text-7xl lg:text-8xl font-bold text-white tracking-tight leading-[0.9]" style={{ fontFamily: "'Inter', sans-serif" }}>
                  TRAVEL
                </span>
                <span className="block text-6xl sm:text-7xl lg:text-8xl font-bold tracking-tight leading-[0.9] mt-2"
                  style={{
                    background: 'linear-gradient(135deg, #22d3ee 0%, #3b82f6 50%, #a78bfa 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    fontFamily: "'Inter', sans-serif",
                  }}
                >
                  BOOKING
                </span>
                <span className="block text-6xl sm:text-7xl lg:text-8xl font-bold text-white/90 tracking-tight leading-[0.9] mt-2" style={{ fontFamily: "'Inter', sans-serif" }}>
                  PLATFORM
                </span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8, duration: 0.7 }}
                className="text-base sm:text-lg text-slate-400 max-w-lg leading-relaxed mb-8"
              >
                Explore the World &bull; Plan Your Journey &bull; Create Unforgettable Memories
              </motion.p>

              {/* Stats row */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.0, duration: 0.7 }}
                className="flex gap-8"
              >
                {[
                  { value: '50+', label: 'Destinations' },
                  { value: '15+', label: 'Airlines' },
                  { value: '100+', label: 'Hotels' },
                ].map((stat, i) => (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.0 + i * 0.1 }}
                  >
                    <p className="text-2xl font-bold text-white">{stat.value}</p>
                    <p className="text-xs text-slate-500 uppercase tracking-wider">{stat.label}</p>
                  </motion.div>
                ))}
              </motion.div>
            </div>

            {/* Bottom area: Floating cards + Booking panel */}
            <div className="mt-auto">
              {/* Floating Destination Cards */}
              <div className="flex gap-3 sm:gap-4 mb-8 overflow-x-auto pb-4 -mx-4 px-4 lg:mx-0 lg:px-0 scrollbar-hide">
                {heroDestinations.map((dest, i) => (
                  <DestinationCard
                    key={dest.name}
                    dest={dest}
                    index={i}
                    onClick={() => handleDestinationClick(dest.name)}
                  />
                ))}
              </div>

              {/* ═══════════════════════════════════════
                  GLASSMORPHISM BOOKING PANEL
               ═══════════════════════════════════════ */}
              <motion.div
                id="search-panel"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.8, duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
                className="relative max-w-5xl"
              >
                <div
                  className="relative rounded-2xl p-5 sm:p-6 lg:p-8"
                  style={{
                    background: 'rgba(6, 15, 35, 0.7)',
                    backdropFilter: 'blur(24px)',
                    WebkitBackdropFilter: 'blur(24px)',
                    border: '1px solid rgba(14, 165, 233, 0.12)',
                    boxShadow: '0 32px 64px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.04)',
                  }}
                >
                  {/* Tabs */}
                  <div className="flex gap-1 mb-6 bg-white/[0.03] rounded-xl p-1 w-fit border border-white/[0.04]">
                    {[
                      { key: 'flights' as const, icon: Plane, label: 'Flights' },
                      { key: 'hotels' as const, icon: Building, label: 'Hotels' },
                      { key: 'cabs' as const, icon: Car, label: 'Cabs' },
                    ].map(tab => (
                      <button
                        key={tab.key}
                        onClick={() => setActiveTab(tab.key)}
                        className={`relative flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all duration-300
                          ${activeTab === tab.key
                            ? 'text-white'
                            : 'text-slate-400 hover:text-white'
                          }`}
                      >
                        {activeTab === tab.key && (
                          <motion.div
                            layoutId="activeTab"
                            className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-lg shadow-lg shadow-cyan-500/20"
                            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                          />
                        )}
                        <span className="relative z-10 flex items-center gap-2">
                          <tab.icon size={15} />
                          {tab.label}
                        </span>
                      </button>
                    ))}
                  </div>

                  <AnimatePresence mode="wait">
                    {/* ─── Flight Search ─── */}
                    {activeTab === 'flights' && (
                      <motion.div
                        key="flights"
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        transition={{ duration: 0.3 }}
                      >
                        {/* Trip type toggle */}
                        <div className="flex gap-4 mb-4">
                          {(['oneway', 'roundtrip'] as const).map(type => (
                            <label key={type} className="flex items-center gap-2 cursor-pointer group">
                              <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all
                                ${tripType === type ? 'border-cyan-400' : 'border-slate-600 group-hover:border-slate-400'}`}>
                                {tripType === type && <div className="w-2 h-2 rounded-full bg-cyan-400" />}
                              </div>
                              <input type="radio" name="tripType" value={type} checked={tripType === type}
                                onChange={() => setTripType(type)} className="sr-only" />
                              <span className={`text-sm ${tripType === type ? 'text-white' : 'text-slate-500'}`}>
                                {type === 'oneway' ? 'One Way' : 'Round Trip'}
                              </span>
                            </label>
                          ))}
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3">
                          {/* Origin */}
                          <div className="lg:col-span-3 relative">
                            <label htmlFor="origin" className="text-xs text-slate-500 mb-1 block">From</label>
                            <div className="relative">
                              <MapPin size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                              <input
                                id="origin" type="text" placeholder="Origin city"
                                value={origin} onChange={e => setOrigin(e.target.value)}
                                className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500/40 focus:bg-white/[0.06] transition-all text-sm"
                              />
                            </div>
                          </div>

                          {/* Swap */}
                          <div className="lg:col-span-1 flex items-end justify-center pb-1">
                            <button onClick={swapLocations}
                              className="p-2 rounded-full bg-white/[0.04] border border-white/[0.08] text-cyan-400 hover:bg-cyan-500/10 hover:border-cyan-500/20 transition-all hover:rotate-180 duration-500"
                              aria-label="Swap origin and destination">
                              <ArrowRightLeft size={14} />
                            </button>
                          </div>

                          {/* Destination */}
                          <div className="lg:col-span-3 relative">
                            <label htmlFor="dest" className="text-xs text-slate-500 mb-1 block">To</label>
                            <div className="relative">
                              <MapPin size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                              <input
                                id="dest" type="text" placeholder="Destination city"
                                value={destination} onChange={e => setDestination(e.target.value)}
                                className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500/40 focus:bg-white/[0.06] transition-all text-sm"
                              />
                            </div>
                          </div>

                          {/* Departure */}
                          <div className="lg:col-span-2">
                            <label htmlFor="depart-date" className="text-xs text-slate-500 mb-1 block">Departure</label>
                            <div className="relative">
                              <Calendar size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                              <input
                                id="depart-date" type="date" value={departureDate} onChange={e => setDepartureDate(e.target.value)}
                                className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white focus:outline-none focus:border-cyan-500/40 transition-all text-sm [color-scheme:dark]"
                              />
                            </div>
                          </div>

                          {/* Return (conditional) */}
                          {tripType === 'roundtrip' && (
                            <div className="lg:col-span-2">
                              <label htmlFor="return-date" className="text-xs text-slate-500 mb-1 block">Return</label>
                              <div className="relative">
                                <Calendar size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                                <input
                                  id="return-date" type="date" value={returnDate} onChange={e => setReturnDate(e.target.value)}
                                  className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white focus:outline-none focus:border-cyan-500/40 transition-all text-sm [color-scheme:dark]"
                                />
                              </div>
                            </div>
                          )}

                          {/* Passengers + Class */}
                          <div className={tripType === 'roundtrip' ? 'lg:col-span-1' : 'lg:col-span-3'}>
                            <label htmlFor="passengers" className="text-xs text-slate-500 mb-1 block">Travelers</label>
                            <div className="flex gap-2">
                              <select id="passengers" value={passengers} onChange={e => setPassengers(e.target.value)}
                                className="flex-1 px-3 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white focus:outline-none focus:border-cyan-500/40 transition-all text-sm [color-scheme:dark] appearance-none">
                                {[1,2,3,4,5,6].map(n => <option key={n} value={n}>{n}</option>)}
                              </select>
                              {tripType !== 'roundtrip' && (
                                <select value={cabinClass} onChange={e => setCabinClass(e.target.value)}
                                  className="flex-1 px-3 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white focus:outline-none focus:border-cyan-500/40 transition-all text-sm [color-scheme:dark] appearance-none">
                                  {['Economy', 'Business', 'First'].map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Search button */}
                        <button onClick={handleFlightSearch}
                          className="mt-5 w-full sm:w-auto px-8 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold hover:shadow-xl hover:shadow-cyan-500/25 transition-all hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-2 text-sm">
                          <Search size={16} />
                          Search Flights
                        </button>
                      </motion.div>
                    )}

                    {/* ─── Hotel Search ─── */}
                    {activeTab === 'hotels' && (
                      <motion.div
                        key="hotels"
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        transition={{ duration: 0.3 }}
                      >
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                          <div className="lg:col-span-1">
                            <label htmlFor="hotel-dest" className="text-xs text-slate-500 mb-1 block">Destination</label>
                            <div className="relative">
                              <MapPin size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                              <input id="hotel-dest" type="text" placeholder="Where to?"
                                value={hotelDest} onChange={e => setHotelDest(e.target.value)}
                                className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500/40 transition-all text-sm" />
                            </div>
                          </div>
                          <div>
                            <label htmlFor="check-in" className="text-xs text-slate-500 mb-1 block">Check-in</label>
                            <input id="check-in" type="date" value={checkIn} onChange={e => setCheckIn(e.target.value)}
                              className="w-full px-3 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white focus:outline-none focus:border-cyan-500/40 transition-all text-sm [color-scheme:dark]" />
                          </div>
                          <div>
                            <label htmlFor="check-out" className="text-xs text-slate-500 mb-1 block">Check-out</label>
                            <input id="check-out" type="date" value={checkOut} onChange={e => setCheckOut(e.target.value)}
                              className="w-full px-3 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white focus:outline-none focus:border-cyan-500/40 transition-all text-sm [color-scheme:dark]" />
                          </div>
                          <div>
                            <label htmlFor="guests" className="text-xs text-slate-500 mb-1 block">Guests</label>
                            <select id="guests" value={guests} onChange={e => setGuests(e.target.value)}
                              className="w-full px-3 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white focus:outline-none focus:border-cyan-500/40 transition-all text-sm [color-scheme:dark] appearance-none">
                              {[1,2,3,4,5,6].map(n => <option key={n} value={n}>{n} Guest{n > 1 ? 's' : ''}</option>)}
                            </select>
                          </div>
                          <div>
                            <label htmlFor="rooms" className="text-xs text-slate-500 mb-1 block">Rooms</label>
                            <select id="rooms" value={rooms} onChange={e => setRooms(e.target.value)}
                              className="w-full px-3 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white focus:outline-none focus:border-cyan-500/40 transition-all text-sm [color-scheme:dark] appearance-none">
                              {[1,2,3,4].map(n => <option key={n} value={n}>{n} Room{n > 1 ? 's' : ''}</option>)}
                            </select>
                          </div>
                        </div>
                        <button onClick={handleHotelSearch}
                          className="mt-5 w-full sm:w-auto px-8 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold hover:shadow-xl hover:shadow-cyan-500/25 transition-all hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-2 text-sm">
                          <Search size={16} />
                          Search Hotels
                        </button>
                      </motion.div>
                    )}

                    {/* ─── Cab Search ─── */}
                    {activeTab === 'cabs' && (
                      <motion.div
                        key="cabs"
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        transition={{ duration: 0.3 }}
                      >
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                          <div>
                            <label htmlFor="pickup" className="text-xs text-slate-500 mb-1 block">Pickup</label>
                            <div className="relative">
                              <MapPin size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                              <input id="pickup" type="text" placeholder="Pickup location"
                                value={pickupLocation} onChange={e => setPickupLocation(e.target.value)}
                                className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500/40 transition-all text-sm" />
                            </div>
                          </div>
                          <div>
                            <label htmlFor="dropoff" className="text-xs text-slate-500 mb-1 block">Drop-off</label>
                            <div className="relative">
                              <MapPin size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                              <input id="dropoff" type="text" placeholder="Drop-off location"
                                value={dropoffLocation} onChange={e => setDropoffLocation(e.target.value)}
                                className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500/40 transition-all text-sm" />
                            </div>
                          </div>
                          <div>
                            <label htmlFor="pickup-date" className="text-xs text-slate-500 mb-1 block">Date</label>
                            <input id="pickup-date" type="date" value={pickupDate} onChange={e => setPickupDate(e.target.value)}
                              className="w-full px-3 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white focus:outline-none focus:border-cyan-500/40 transition-all text-sm [color-scheme:dark]" />
                          </div>
                          <div>
                            <label htmlFor="pickup-time" className="text-xs text-slate-500 mb-1 block">Time</label>
                            <input id="pickup-time" type="time" value={pickupTime} onChange={e => setPickupTime(e.target.value)}
                              className="w-full px-3 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white focus:outline-none focus:border-cyan-500/40 transition-all text-sm [color-scheme:dark]" />
                          </div>
                          <div>
                            <label htmlFor="cab-passengers" className="text-xs text-slate-500 mb-1 block">Passengers</label>
                            <select id="cab-passengers" value={cabPassengers} onChange={e => setCabPassengers(e.target.value)}
                              className="w-full px-3 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white focus:outline-none focus:border-cyan-500/40 transition-all text-sm [color-scheme:dark] appearance-none">
                              {[1,2,3,4,5,6].map(n => <option key={n} value={n}>{n}</option>)}
                            </select>
                          </div>
                        </div>
                        <button onClick={handleCabSearch}
                          className="mt-5 w-full sm:w-auto px-8 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold hover:shadow-xl hover:shadow-cyan-500/25 transition-all hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-2 text-sm">
                          <Search size={16} />
                          Search Cabs
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            </div>
          </div>

          {/* Scroll indicator */}
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 z-10"
          >
            <span className="text-[10px] text-slate-600 uppercase tracking-[0.25em]">Scroll to explore</span>
            <ChevronDown className="text-cyan-500/40" size={18} />
          </motion.div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════
          SECTION A: EXPLORE DESTINATIONS
       ═══════════════════════════════════════════════ */}
      <section className="max-w-7xl mx-auto px-4 py-24">
        <ScrollReveal>
          <div className="text-center mb-14">
            <p className="text-cyan-400 text-sm font-semibold uppercase tracking-[0.2em] mb-3">Explore the World</p>
            <h2 className="text-4xl sm:text-5xl font-bold text-white mb-4">Dream Destinations</h2>
            <p className="text-slate-400 max-w-2xl mx-auto">From tropical beaches to snow-capped mountains, discover your next adventure.</p>
          </div>
        </ScrollReveal>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {destinations.map((dest, i) => (
            <ScrollReveal key={dest.name} delay={i * 0.08} className={dest.large ? 'md:col-span-2 md:row-span-2' : ''}>
              <Link
                to={`/hotels?destination=${dest.name}`}
                className={`group relative block overflow-hidden rounded-2xl ${dest.large ? 'h-80 md:h-full' : 'h-60'}`}
              >
                <img
                  src={dest.img}
                  alt={dest.name}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  loading="lazy"
                  onError={(e) => { (e.target as HTMLImageElement).src = `https://placehold.co/800x600/0a1628/0ea5e9?text=${dest.name}`; }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                <div className="absolute inset-0 rounded-2xl border border-white/[0.06] group-hover:border-cyan-500/20 transition-colors duration-500" />
                <div className="absolute bottom-0 left-0 right-0 p-5">
                  <h3 className="text-xl font-bold text-white mb-1">{dest.name}</h3>
                  <p className="text-sm text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity duration-300">{dest.desc}</p>
                  <div className="flex items-center gap-1 mt-2 text-cyan-400 text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    Explore <ArrowRight size={14} />
                  </div>
                </div>
              </Link>
            </ScrollReveal>
          ))}
        </div>
      </section>

      {/* ═══════════════════════════════════════════════
          SECTION C: FEATURED FLIGHTS
       ═══════════════════════════════════════════════ */}
      <section className="max-w-7xl mx-auto px-4 py-24">
        <ScrollReveal>
          <div className="flex items-end justify-between mb-10">
            <div>
              <p className="text-cyan-400 text-sm font-semibold uppercase tracking-[0.2em] mb-3">Demo Inventory</p>
              <h2 className="text-4xl font-bold text-white">Featured Flights</h2>
            </div>
            <Link to="/flights" className="text-cyan-400 hover:text-cyan-300 font-medium flex items-center gap-1 transition-colors">
              View All <ArrowRight size={16} />
            </Link>
          </div>
        </ScrollReveal>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {featuredFlights.map((flight, i) => (
            <ScrollReveal key={flight._id} delay={i * 0.1}>
              <Link
                to="/flights"
                className="group block rounded-2xl p-6 hover:border-cyan-500/20 transition-all duration-300"
                style={{
                  background: 'rgba(255,255,255,0.02)',
                  border: '1px solid rgba(255,255,255,0.04)',
                }}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500/20 to-blue-500/20 flex items-center justify-center text-cyan-400 font-bold text-sm">
                      {flight.airline?.substring(0, 2)}
                    </div>
                    <div>
                      <p className="text-white font-semibold">{flight.airline}</p>
                      <p className="text-xs text-slate-500">{flight.flightNumber}</p>
                    </div>
                  </div>
                  <span className="text-xs font-medium px-2 py-1 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/10">{flight.cabin}</span>
                </div>
                <div className="flex items-center gap-4 mb-3">
                  <div><p className="text-lg font-bold text-white">{flight.origin}</p></div>
                  <div className="flex-1 flex items-center gap-2">
                    <div className="h-px flex-1 bg-gradient-to-r from-cyan-500/50 to-transparent" />
                    <Plane size={14} className="text-cyan-500 -rotate-45" />
                    <div className="h-px flex-1 bg-gradient-to-l from-cyan-500/50 to-transparent" />
                  </div>
                  <div className="text-right"><p className="text-lg font-bold text-white">{flight.destination}</p></div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-500">{flight.durationMinutes} min · {flight.stops === 0 ? 'Non-stop' : `${flight.stops} stop(s)`}</span>
                  <p className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">₹{flight.price?.toLocaleString()}</p>
                </div>
              </Link>
            </ScrollReveal>
          ))}
        </div>
      </section>

      {/* ═══════════════════════════════════════════════
          SECTION C: FEATURED HOTELS
       ═══════════════════════════════════════════════ */}
      <section className="max-w-7xl mx-auto px-4 py-24">
        <ScrollReveal>
          <div className="flex items-end justify-between mb-10">
            <div>
              <p className="text-cyan-400 text-sm font-semibold uppercase tracking-[0.2em] mb-3">Curated Stays</p>
              <h2 className="text-4xl font-bold text-white">Recommended Hotels</h2>
            </div>
            <Link to="/hotels" className="text-cyan-400 hover:text-cyan-300 font-medium flex items-center gap-1 transition-colors">
              View All <ArrowRight size={16} />
            </Link>
          </div>
        </ScrollReveal>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {featuredHotels.map((hotel, i) => (
            <ScrollReveal key={hotel._id} delay={i * 0.1}>
              <Link to="/hotels" className="group block rounded-2xl overflow-hidden hover:border-cyan-500/20 transition-all duration-300"
                style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)' }}>
                <div className="h-44 relative overflow-hidden">
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
                </div>
                <div className="p-5">
                  <h3 className="text-white font-bold mb-1">{hotel.name}</h3>
                  <p className="text-sm text-slate-400 flex items-center gap-1 mb-3"><MapPin size={12} /> {hotel.destination}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <Star size={12} className="text-amber-400 fill-amber-400" />
                      <span className="text-xs text-slate-400">{hotel.rating} (demo)</span>
                    </div>
                    <p className="text-sm font-bold text-cyan-400">₹{hotel.rooms?.[0]?.pricePerNight?.toLocaleString()}<span className="text-xs text-slate-500 font-normal">/night</span></p>
                  </div>
                </div>
              </Link>
            </ScrollReveal>
          ))}
        </div>
      </section>

      {/* ═══════════════════════════════════════════════
          SECTION D: HOW IT WORKS
       ═══════════════════════════════════════════════ */}
      <section className="max-w-6xl mx-auto px-4 py-24">
        <ScrollReveal>
          <div className="text-center mb-14">
            <p className="text-cyan-400 text-sm font-semibold uppercase tracking-[0.2em] mb-3">Simple Process</p>
            <h2 className="text-4xl font-bold text-white">How It Works</h2>
          </div>
        </ScrollReveal>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
          {[
            { step: '01', title: 'Search', desc: 'Browse flights, hotels, and cabs from our demo inventory.', icon: Search },
            { step: '02', title: 'Compare', desc: 'Compare prices and options to find your perfect match.', icon: Compass },
            { step: '03', title: 'Book', desc: 'Complete your simulated booking in seconds.', icon: CreditCard },
            { step: '04', title: 'Plan', desc: 'Organize your itinerary from the dashboard.', icon: Calendar },
            { step: '05', title: 'Travel', desc: 'Set off on your next adventure with confidence.', icon: Plane },
          ].map((item, i) => (
            <ScrollReveal key={item.step} delay={i * 0.1}>
              <div className="relative rounded-2xl p-6 text-center group hover:border-cyan-500/20 transition-all duration-300 h-full"
                style={{ background: 'rgba(255,255,255,0.015)', border: '1px solid rgba(255,255,255,0.04)' }}>
                <div className="w-12 h-12 mx-auto mb-4 rounded-xl bg-gradient-to-br from-cyan-500/10 to-blue-600/10 border border-cyan-500/15 flex items-center justify-center">
                  <item.icon size={22} className="text-cyan-400" />
                </div>
                <p className="text-3xl font-bold text-white/[0.04] absolute top-3 right-4">{item.step}</p>
                <h3 className="text-base font-bold text-white mb-2">{item.title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed">{item.desc}</p>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </section>

      {/* ═══════════════════════════════════════════════
          SECTION E: CTA
       ═══════════════════════════════════════════════ */}
      <section className="max-w-5xl mx-auto px-4 py-24">
        <ScrollReveal>
          <div className="relative overflow-hidden rounded-3xl p-12 sm:p-16 text-center"
            style={{
              background: 'linear-gradient(135deg, rgba(14,165,233,0.1) 0%, rgba(59,130,246,0.08) 50%, rgba(139,92,246,0.06) 100%)',
              border: '1px solid rgba(14,165,233,0.15)',
            }}>
            {/* Decorative elements */}
            <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-cyan-500/5 blur-[80px]" />
            <div className="absolute bottom-0 left-0 w-48 h-48 rounded-full bg-blue-500/5 blur-[60px]" />

            <GlobeIcon size={40} className="mx-auto text-cyan-400/60 mb-6" />
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">Ready for Your Next Adventure?</h2>
            <p className="text-slate-400 max-w-xl mx-auto mb-8">
              Start planning your journey today. Explore destinations, compare flights and hotels, and create unforgettable travel memories.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Link
                to="/flights"
                className="group inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold shadow-xl shadow-cyan-500/20 hover:shadow-cyan-500/30 transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                Explore Destinations
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                to="/dashboard"
                className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl border border-white/10 text-slate-300 font-semibold hover:bg-white/[0.04] hover:border-white/20 transition-all"
              >
                Plan Your Journey
              </Link>
            </div>
          </div>
        </ScrollReveal>
      </section>

      {/* ═══════════════════════════════════════════════
          FOOTER
       ═══════════════════════════════════════════════ */}
      <footer className="border-t border-white/[0.04] bg-[#020712]">
        <div className="max-w-7xl mx-auto px-4 py-16">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-10">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
                  <Plane className="text-white" size={18} />
                </div>
                <span className="text-lg font-bold text-white">TravelPlatform</span>
              </div>
              <p className="text-sm text-slate-500 leading-relaxed">A demonstration travel booking platform built for educational purposes. All inventory is sample data.</p>
            </div>
            {[
              { title: 'Travel', links: [{ name: 'Flights', to: '/flights' }, { name: 'Hotels', to: '/hotels' }, { name: 'Cabs', to: '/cabs' }] },
              { title: 'Account', links: [{ name: 'Dashboard', to: '/dashboard' }, { name: 'Login', to: '/login' }, { name: 'Register', to: '/register' }] },
              { title: 'Info', links: [{ name: 'About', to: '#' }, { name: 'Contact', to: '#' }] },
            ].map(section => (
              <div key={section.title}>
                <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">{section.title}</h4>
                <ul className="space-y-2">
                  {section.links.map(link => (
                    <li key={link.name}>
                      <Link to={link.to} className="text-sm text-slate-500 hover:text-cyan-400 transition-colors">{link.name}</Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="border-t border-white/[0.04] pt-8 text-center">
            <p className="text-xs text-slate-600">&copy; 2026 TravelPlatform. Demo Purpose Only. All travel data is simulated.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
