import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Flights from './pages/Flights';
import Hotels from './pages/Hotels';
import Cabs from './pages/Cabs';
import BookingPayment from './pages/BookingPayment';
import FlightRadar from './pages/FlightRadar';

const ProtectedRoute = ({ children }: any) => {
  const { user, loading } = useAuth();
  if (loading) return (
    <div className="min-h-screen bg-[#050a1a] flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );
  if (!user) return <Navigate to="/login" />;
  return children;
};

function AppContent() {
  const location = useLocation();
  const isHome = location.pathname === '/';

  return (
    <div className="min-h-screen bg-[#050a1a]">
      <Navbar />
      {isHome ? (
        <Routes>
          <Route path="/" element={<Home />} />
        </Routes>
      ) : (
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/flights" element={<Flights />} />
          <Route path="/radar" element={<FlightRadar />} />
          <Route path="/flight-radar" element={<FlightRadar />} />
          <Route path="/hotels" element={<Hotels />} />
          <Route path="/cabs" element={<Cabs />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/booking/:id/payment"
            element={
              <ProtectedRoute>
                <BookingPayment />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={
            <div className="min-h-screen bg-[#050a1a] flex items-center justify-center text-white">
              <div className="text-center">
                <h1 className="text-6xl font-bold mb-4 bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">404</h1>
                <p className="text-slate-400">Page not found.</p>
              </div>
            </div>
          } />
        </Routes>
      )}
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
}

export default App;
