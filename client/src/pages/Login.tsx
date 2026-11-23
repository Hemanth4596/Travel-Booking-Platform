import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, ArrowRight, Plane, UserCheck, Shield } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleQuickFill = (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setError('');
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await login(email.trim().toLowerCase(), password);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050a1a] flex items-center justify-center px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full"
      >
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 mb-3">
            <Plane className="text-cyan-400" size={28} />
            <span className="text-xl font-bold text-white">TravelPlatform</span>
          </div>
          <h2 className="text-3xl font-bold text-white mb-2">Welcome back</h2>
          <p className="text-slate-400 text-sm">Sign in to manage your bookings and travel plans.</p>
        </div>

        {/* Demo Accounts Quick-Fill Card */}
        <div className="mb-5 bg-gradient-to-r from-cyan-950/40 to-blue-950/40 border border-cyan-500/20 rounded-2xl p-4">
          <div className="flex items-center gap-2 text-cyan-400 text-xs font-semibold uppercase tracking-wider mb-2.5">
            <UserCheck size={15} /> Demo Credentials (Instant Access)
          </div>
          <p className="text-slate-400 text-xs mb-3">Click below to auto-fill demo credentials:</p>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => handleQuickFill('user1@travelbooking.com', 'User1@123')}
              className="py-2 px-2.5 bg-white/5 hover:bg-cyan-500/20 border border-white/10 hover:border-cyan-500/40 rounded-xl text-xs font-medium text-slate-200 hover:text-cyan-300 transition-all text-center"
            >
              <span className="block font-semibold">User 1</span>
              <span className="text-[10px] text-slate-400">Regular</span>
            </button>
            <button
              type="button"
              onClick={() => handleQuickFill('user2@travelbooking.com', 'User2@123')}
              className="py-2 px-2.5 bg-white/5 hover:bg-cyan-500/20 border border-white/10 hover:border-cyan-500/40 rounded-xl text-xs font-medium text-slate-200 hover:text-cyan-300 transition-all text-center"
            >
              <span className="block font-semibold">User 2</span>
              <span className="text-[10px] text-slate-400">Regular</span>
            </button>
            <button
              type="button"
              onClick={() => handleQuickFill('admin@travelbooking.com', 'admin123')}
              className="py-2 px-2.5 bg-white/5 hover:bg-purple-500/20 border border-white/10 hover:border-purple-500/40 rounded-xl text-xs font-medium text-slate-200 hover:text-purple-300 transition-all text-center"
            >
              <div className="flex items-center justify-center gap-1">
                <Shield size={11} className="text-purple-400" />
                <span className="font-semibold">Admin</span>
              </div>
              <span className="text-[10px] text-slate-400">Full Access</span>
            </button>
          </div>
        </div>

        <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-7 shadow-2xl backdrop-blur-xl">
          {error && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-xl text-sm mb-5">
              {error}
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Email</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500/50 focus:bg-white/10 transition-all text-sm"
                  placeholder="you@example.com"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Password</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500/50 focus:bg-white/10 transition-all text-sm"
                  placeholder="••••••••"
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold hover:shadow-lg hover:shadow-cyan-500/25 transition-all flex items-center justify-center gap-2 disabled:opacity-50 text-sm mt-2"
            >
              {loading ? 'Signing in...' : 'Sign In'} <ArrowRight size={16} />
            </button>
          </form>
        </div>

        <p className="mt-6 text-center text-sm text-slate-500">
          Don't have an account? <Link to="/register" className="text-cyan-400 hover:text-cyan-300 font-medium">Register</Link>
        </p>
      </motion.div>
    </div>
  );
};

export default Login;
