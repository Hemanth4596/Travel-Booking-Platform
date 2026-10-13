import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Plane, Building, Car, LogOut, Menu, X, Globe, MapPin, User, Radio } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const isHome = location.pathname === '/';

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [location]);

  const navBg = scrolled || !isHome
    ? 'bg-[#060c1f]/90 backdrop-blur-2xl shadow-2xl shadow-black/30 border-b border-white/[0.06]'
    : 'bg-transparent';

  return (
    <>
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-700 ${navBg}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-20">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-3 group">
              <motion.div
                whileHover={{ rotate: -15, scale: 1.1 }}
                transition={{ type: 'spring', stiffness: 300 }}
                className="relative"
              >
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
                  <Plane className="text-white" size={20} />
                </div>
              </motion.div>
              <div className="flex flex-col">
                <span className="text-lg font-bold tracking-tight bg-gradient-to-r from-white to-cyan-200 bg-clip-text text-transparent leading-tight">
                  TravelPlatform
                </span>
                <span className="text-[10px] text-cyan-500/60 font-medium tracking-[0.2em] uppercase leading-tight">
                  Premium Travel
                </span>
              </div>
            </Link>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center gap-1">
              {[
                { to: '/', icon: Globe, label: 'Explore' },
                { to: '/flights', icon: Plane, label: 'Flights' },
                { to: '/radar', icon: Radio, label: 'Live Radar' },
                { to: '/hotels', icon: Building, label: 'Hotels' },
                { to: '/cabs', icon: Car, label: 'Cabs' },
              ].map(item => (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`px-4 py-2 rounded-xl text-sm font-medium flex items-center gap-2 transition-all duration-300
                    ${location.pathname === item.to
                      ? 'bg-cyan-500/10 text-cyan-300 shadow-inner shadow-cyan-500/5'
                      : 'text-slate-400 hover:bg-white/[0.04] hover:text-white'
                    }`}
                >
                  <item.icon size={15} />
                  {item.label}
                </Link>
              ))}

              {user && (
                <Link
                  to="/dashboard"
                  className={`px-4 py-2 rounded-xl text-sm font-medium flex items-center gap-2 transition-all duration-300
                    ${location.pathname === '/dashboard'
                      ? 'bg-cyan-500/10 text-cyan-300'
                      : 'text-slate-400 hover:bg-white/[0.04] hover:text-white'
                    }`}
                >
                  <MapPin size={15} />
                  My Bookings
                </Link>
              )}
            </div>

            {/* Right side */}
            <div className="hidden md:flex items-center gap-3">
              {user ? (
                <>
                  <Link
                    to="/dashboard"
                    className="flex items-center gap-2.5 text-sm text-slate-300 hover:text-cyan-300 transition-colors px-3 py-2 rounded-xl hover:bg-white/[0.04]"
                  >
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center text-xs font-bold text-white ring-2 ring-cyan-500/20">
                      {user.name?.charAt(0)?.toUpperCase()}
                    </div>
                    <span className="font-medium">{user.name}</span>
                  </Link>
                  <button
                    onClick={logout}
                    className="text-slate-500 hover:text-red-400 transition-colors p-2 rounded-xl hover:bg-white/[0.04]"
                    aria-label="Logout"
                  >
                    <LogOut size={18} />
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="text-sm text-slate-300 hover:text-white font-medium px-4 py-2 rounded-xl hover:bg-white/[0.04] transition-all flex items-center gap-2"
                  >
                    <User size={15} />
                    Login
                  </Link>
                  <Link
                    to="/flights"
                    className="text-sm font-semibold px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white hover:shadow-xl hover:shadow-cyan-500/25 transition-all hover:scale-[1.02] active:scale-[0.98]"
                  >
                    Plan a Trip
                  </Link>
                </>
              )}
            </div>

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden text-white p-2 rounded-xl hover:bg-white/[0.06] transition-colors"
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-40 bg-[#060c1f]/98 backdrop-blur-2xl pt-20 px-6 md:hidden overflow-y-auto"
          >
            <div className="flex flex-col gap-1">
              {[
                { to: '/', label: 'Explore', icon: Globe },
                { to: '/flights', label: 'Flights', icon: Plane },
                { to: '/radar', label: 'Live Flight Radar', icon: Radio },
                { to: '/hotels', label: 'Hotels', icon: Building },
                { to: '/cabs', label: 'Cabs', icon: Car },
              ].map(item => (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`flex items-center gap-3 text-lg font-medium py-4 px-4 rounded-xl transition-all
                    ${location.pathname === item.to
                      ? 'text-cyan-300 bg-cyan-500/10'
                      : 'text-slate-300 hover:text-white hover:bg-white/[0.04]'
                    }`}
                >
                  <item.icon size={20} />
                  {item.label}
                </Link>
              ))}

              <div className="h-px bg-white/5 my-2" />

              {user ? (
                <>
                  <Link
                    to="/dashboard"
                    className="flex items-center gap-3 text-lg font-medium text-slate-300 hover:text-cyan-300 py-4 px-4 rounded-xl hover:bg-white/[0.04] transition-all"
                  >
                    <MapPin size={20} />
                    My Bookings
                  </Link>
                  <button
                    onClick={logout}
                    className="flex items-center gap-3 text-lg font-medium text-red-400 py-4 px-4 text-left rounded-xl hover:bg-red-500/5 transition-all"
                  >
                    <LogOut size={20} />
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="flex items-center gap-3 text-lg font-medium text-slate-300 py-4 px-4 rounded-xl hover:bg-white/[0.04] transition-all"
                  >
                    <User size={20} />
                    Login
                  </Link>
                  <Link
                    to="/register"
                    className="mt-2 text-center text-lg font-semibold py-4 px-4 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white"
                  >
                    Plan a Trip
                  </Link>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;
