import { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  CreditCard,
  QrCode,
  Building2,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ArrowLeft,
  Loader2,
  Lock,
  Info,
  RefreshCw,
  Receipt,
  Sparkles,
  MapPin,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getDestinationImageUrl, getDestinationAltText } from '../data/destinations';

type PaymentMethodType = 'CARD' | 'UPI' | 'NET_BANKING';
type SimulationOutcomeType = 'SIMULATED_SUCCESS' | 'SIMULATED_FAILURE' | 'SIMULATED_CANCELLED';

export default function BookingPayment() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [booking, setBooking] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Selected simulated payment method
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethodType>('CARD');

  // Simulated test outcome configuration
  const [selectedOutcome, setSelectedOutcome] = useState<SimulationOutcomeType>('SIMULATED_SUCCESS');

  // Card mock state
  const [cardNumber, setCardNumber] = useState('4242 •••• •••• 4242');
  const [cardHolder, setCardHolder] = useState(user?.name || 'Jane Traveler');
  const [cardExpiry, setCardExpiry] = useState('12/28');
  const [cardCvv, setCardCvv] = useState('•••');

  // UPI mock state
  const [upiId, setUpiId] = useState('traveler@demoupi');
  const [upiApp, setUpiApp] = useState('Google Pay');

  // Net banking mock state
  const [selectedBank, setSelectedBank] = useState('HDFC Bank');

  // Demo billing state
  const [agreedTerms, setAgreedTerms] = useState(true);

  // Result state
  const [simulationResult, setSimulationResult] = useState<any | null>(null);

  useEffect(() => {
    const fetchBooking = async () => {
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/bookings/${id}`,
          { headers: { Authorization: `Bearer ${user?.token}` } }
        );
        setBooking(res.data);
      } catch (err: any) {
        setErrorMsg(err.response?.data?.error || 'Failed to load booking details.');
      } finally {
        setLoading(false);
      }
    };
    if (id && user?.token) {
      fetchBooking();
    }
  }, [id, user]);

  // Destination name from booking for photography
  const destinationName =
    booking?.travelDetails?.destination ||
    booking?.itemSnapshot?.destination ||
    booking?.travelDetails?.city ||
    'Global';

  const destinationImage = getDestinationImageUrl(destinationName);
  const destinationAlt = getDestinationAltText(destinationName);

  // Execute Simulated Payment
  const handleSubmitPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreedTerms) {
      alert('Please acknowledge the simulated demo terms to proceed.');
      return;
    }

    setProcessing(true);
    setErrorMsg(null);

    // Realistic processing animation delay (1.8 seconds)
    await new Promise((resolve) => setTimeout(resolve, 1800));

    try {
      const payload = {
        bookingId: id,
        requestedOutcome: selectedOutcome,
        paymentMethod: selectedMethod,
        methodDetails: {
          cardBrand: 'Demo Visa',
          cardNumberMasked: cardNumber,
          upiHandle: selectedMethod === 'UPI' ? upiId : undefined,
          bankName: selectedMethod === 'NET_BANKING' ? selectedBank : undefined,
        },
        idempotencyKey: `idem-${Date.now()}`,
      };

      const res = await axios.post(
        `${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/payments/simulate`,
        payload,
        { headers: { Authorization: `Bearer ${user?.token}` } }
      );

      setSimulationResult(res.data);
      if (res.data.booking) {
        setBooking(res.data.booking);
      }
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.response?.data?.error || 'Simulated payment processing encountered an error.');
    } finally {
      setProcessing(false);
    }
  };

  const handleRetry = () => {
    setSimulationResult(null);
    setSelectedOutcome('SIMULATED_SUCCESS');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#020712] flex items-center justify-center text-cyan-400">
        <Loader2 className="animate-spin" size={36} />
      </div>
    );
  }

  if (errorMsg && !booking) {
    return (
      <div className="min-h-screen bg-[#020712] flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white/[0.03] border border-white/10 rounded-2xl p-8 text-center">
          <AlertTriangle size={48} className="mx-auto text-amber-400 mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">Booking Not Found</h2>
          <p className="text-slate-400 text-sm mb-6">{errorMsg}</p>
          <button
            onClick={() => navigate('/dashboard')}
            className="px-6 py-2.5 rounded-xl bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-sm font-semibold hover:bg-cyan-500/30 transition-all"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  // ══════════════════════════════════════════════════
  // SIMULATION RESULT VIEW (SUCCESS / FAILURE / CANCELLED)
  // ══════════════════════════════════════════════════
  if (simulationResult) {
    const isSuccess = simulationResult.outcome === 'SIMULATED_SUCCESS';
    const isCancelled = simulationResult.outcome === 'SIMULATED_CANCELLED';

    return (
      <div className="min-h-screen bg-[#020712] pt-28 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto">
          {/* Mandatory Disclosure Alert Ribbon */}
          <div className="mb-6 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs flex items-start gap-3 shadow-lg shadow-amber-500/5">
            <Info size={18} className="text-amber-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-amber-300 uppercase tracking-wide">
                Demo Mode &mdash; Simulated Payment Confirmation
              </p>
              <p className="mt-0.5 leading-relaxed text-slate-300">
                This is a demonstration payment confirmation. No real money was charged, and no real financial transaction took place.
              </p>
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white/[0.03] border border-white/10 rounded-3xl overflow-hidden backdrop-blur-xl shadow-2xl"
          >
            {/* Destination Photography Header Banner */}
            <div className="relative h-44 overflow-hidden">
              <img
                src={destinationImage}
                alt={destinationAlt}
                className="w-full h-full object-cover filter brightness-75"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#020712] via-[#020712]/50 to-transparent" />

              <div className="absolute bottom-4 left-6 right-6 flex items-end justify-between">
                <div>
                  <span className="text-[10px] text-cyan-400 uppercase tracking-widest font-semibold block mb-0.5">
                    {booking.bookingType} &bull; {destinationName}
                  </span>
                  <h3 className="text-2xl font-bold text-white leading-tight">
                    {booking.itemSnapshot?.hotelName ||
                      booking.itemSnapshot?.airline ||
                      booking.itemSnapshot?.vehicleName ||
                      'Travel Reservation'}
                  </h3>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-400 block">Total Simulated</span>
                  <span className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                    ₹{booking.totalAmount?.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Status Outcome Block */}
            <div className="p-8 text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', damping: 15 }}
                className="mb-5 inline-block"
              >
                {isSuccess ? (
                  <div className="w-20 h-20 rounded-full bg-emerald-500/15 border-2 border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow-xl shadow-emerald-500/10">
                    <CheckCircle2 size={44} />
                  </div>
                ) : isCancelled ? (
                  <div className="w-20 h-20 rounded-full bg-slate-500/15 border-2 border-slate-500/30 flex items-center justify-center text-slate-400 shadow-xl">
                    <AlertTriangle size={44} />
                  </div>
                ) : (
                  <div className="w-20 h-20 rounded-full bg-red-500/15 border-2 border-red-500/30 flex items-center justify-center text-red-400 shadow-xl shadow-red-500/10">
                    <XCircle size={44} />
                  </div>
                )}
              </motion.div>

              <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">
                {isSuccess
                  ? 'Demo Payment Successful'
                  : isCancelled
                  ? 'Simulation Cancelled'
                  : 'Simulated Payment Declined'}
              </h2>
              <p className="text-sm text-slate-400 max-w-md mx-auto mb-6 leading-relaxed">
                {isSuccess
                  ? 'Your simulated booking has been confirmed in the database. Simulation only — no real funds were transferred.'
                  : isCancelled
                  ? 'The simulated checkout flow was cancelled. Your booking has been marked as cancelled.'
                  : 'The test simulation resulted in a simulated card/bank decline. You can retry with another method.'}
              </p>

              {/* Simulation Reference & Audit Metadata */}
              <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-4 text-left space-y-2.5 mb-8 max-w-md mx-auto text-xs">
                <div className="flex justify-between items-center py-1 border-b border-white/[0.04]">
                  <span className="text-slate-400">Simulation Reference:</span>
                  <span className="font-mono text-cyan-300 font-semibold">
                    {simulationResult.simulationReference}
                  </span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-white/[0.04]">
                  <span className="text-slate-400">Booking Reference:</span>
                  <span className="font-mono text-white font-semibold">
                    {booking.bookingReference}
                  </span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-white/[0.04]">
                  <span className="text-slate-400">Demo Method:</span>
                  <span className="text-white font-medium">{simulationResult.paymentMethod}</span>
                </div>
                <div className="flex justify-between items-center py-1">
                  <span className="text-slate-400">Database Status:</span>
                  <span
                    className={`font-semibold px-2 py-0.5 rounded text-[10px] ${
                      isSuccess
                        ? 'bg-emerald-500/10 text-emerald-400'
                        : 'bg-red-500/10 text-red-400'
                    }`}
                  >
                    BOOKING_{booking.bookingStatus}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 justify-center max-w-md mx-auto">
                {isSuccess ? (
                  <>
                    <button
                      onClick={() => navigate('/dashboard')}
                      className="flex-1 py-3.5 px-6 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold text-sm shadow-xl shadow-cyan-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
                    >
                      View in Dashboard
                    </button>
                    <button
                      onClick={() => window.print()}
                      className="py-3.5 px-5 rounded-xl border border-white/10 hover:bg-white/[0.04] text-slate-300 font-medium text-sm flex items-center justify-center gap-2 transition-all"
                    >
                      <Receipt size={16} /> Print Receipt
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={handleRetry}
                      className="flex-1 py-3.5 px-6 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold text-sm shadow-xl shadow-cyan-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                    >
                      <RefreshCw size={16} /> Retry Simulated Checkout
                    </button>
                    <button
                      onClick={() => navigate('/dashboard')}
                      className="py-3.5 px-6 rounded-xl border border-white/10 hover:bg-white/[0.04] text-slate-300 font-medium text-sm transition-all"
                    >
                      Dashboard
                    </button>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  // ══════════════════════════════════════════════════
  // CHECKOUT FORM VIEW
  // ══════════════════════════════════════════════════
  return (
    <div className="min-h-screen bg-[#020712] text-white pt-24 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Navigation Breadcrumb / Back */}
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-400 hover:text-white transition-colors mb-6"
        >
          <ArrowLeft size={14} /> Back to selection
        </button>

        {/* ═══════════════════════════════════════════════
            MANDATORY DISCLOSURE NOTICE (ALWAYS VISIBLE)
        ═══════════════════════════════════════════════ */}
        <div className="mb-8 p-4 rounded-2xl bg-cyan-950/40 border border-cyan-500/30 backdrop-blur-md shadow-xl flex items-start gap-3.5">
          <div className="w-8 h-8 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 shrink-0">
            <ShieldCheck size={18} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-xs tracking-wider uppercase text-cyan-300">
                DEMO MODE &mdash; SIMULATED PAYMENT
              </span>
              <span className="px-1.5 py-0.2 bg-cyan-500/20 text-cyan-300 text-[10px] font-mono rounded">
                SIMULATION ONLY
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-1 leading-relaxed">
              This is a demonstration payment flow. No real money will be charged, and no real payment transaction will be processed. Sensitive financial credentials are not accepted or stored.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* ─────────────────────────────────────────────
              LEFT COLUMN: PAYMENT METHOD & FORM (7 COLS)
          ───────────────────────────────────────────── */}
          <div className="lg:col-span-7 space-y-6">
            {/* Step 1: Payment Method Tabs */}
            <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-6 backdrop-blur-xl">
              <h2 className="text-lg font-bold text-white mb-1 flex items-center gap-2">
                <CreditCard size={18} className="text-cyan-400" />
                Select Simulated Payment Method
              </h2>
              <p className="text-xs text-slate-400 mb-5">
                Choose an interface layout to experience the simulated travel checkout:
              </p>

              <div className="grid grid-cols-3 gap-3">
                {[
                  { id: 'CARD' as const, label: 'Card Demo', icon: CreditCard },
                  { id: 'UPI' as const, label: 'UPI Demo', icon: QrCode },
                  { id: 'NET_BANKING' as const, label: 'Net Banking', icon: Building2 },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setSelectedMethod(tab.id)}
                    className={`p-3.5 rounded-xl border text-center transition-all flex flex-col items-center justify-center gap-2 ${
                      selectedMethod === tab.id
                        ? 'bg-cyan-500/15 border-cyan-500/40 text-cyan-300 shadow-lg shadow-cyan-500/10'
                        : 'bg-white/[0.02] border-white/[0.06] text-slate-400 hover:text-white hover:bg-white/[0.04]'
                    }`}
                  >
                    <tab.icon size={20} className={selectedMethod === tab.id ? 'text-cyan-400' : 'text-slate-400'} />
                    <span className="text-xs font-semibold">{tab.label}</span>
                  </button>
                ))}
              </div>

              {/* Simulated Card Interface */}
              {selectedMethod === 'CARD' && (
                <div className="mt-6 pt-6 border-t border-white/[0.06] space-y-4">
                  <div>
                    <label className="text-xs text-slate-400 mb-1.5 block">Cardholder Name (Demo)</label>
                    <input
                      type="text"
                      value={cardHolder}
                      onChange={(e) => setCardHolder(e.target.value)}
                      placeholder="Jane Traveler"
                      className="w-full px-4 py-2.5 rounded-xl bg-white/[0.03] border border-white/10 text-white text-sm focus:outline-none focus:border-cyan-500/50 transition-all"
                    />
                  </div>

                  <div>
                    <label className="text-xs text-slate-400 mb-1.5 block">Mock Card Number</label>
                    <div className="relative">
                      <CreditCard size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                      <input
                        type="text"
                        value={cardNumber}
                        onChange={(e) => setCardNumber(e.target.value)}
                        placeholder="4242 4242 4242 4242"
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/[0.03] border border-white/10 text-white font-mono text-sm focus:outline-none focus:border-cyan-500/50 transition-all"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs text-slate-400 mb-1.5 block">Expiry Date</label>
                      <input
                        type="text"
                        value={cardExpiry}
                        onChange={(e) => setCardExpiry(e.target.value)}
                        placeholder="MM/YY"
                        className="w-full px-4 py-2.5 rounded-xl bg-white/[0.03] border border-white/10 text-white font-mono text-sm focus:outline-none focus:border-cyan-500/50 transition-all"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-slate-400 mb-1.5 block">CVV (Demo Mock)</label>
                      <input
                        type="password"
                        maxLength={3}
                        value={cardCvv}
                        onChange={(e) => setCardCvv(e.target.value)}
                        placeholder="•••"
                        className="w-full px-4 py-2.5 rounded-xl bg-white/[0.03] border border-white/10 text-white font-mono text-sm focus:outline-none focus:border-cyan-500/50 transition-all"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Simulated UPI Interface */}
              {selectedMethod === 'UPI' && (
                <div className="mt-6 pt-6 border-t border-white/[0.06] space-y-4">
                  <div className="flex gap-2">
                    {['Google Pay', 'PhonePe', 'Paytm', 'BHIM'].map((app) => (
                      <button
                        key={app}
                        type="button"
                        onClick={() => setUpiApp(app)}
                        className={`flex-1 py-2 px-1 text-center rounded-xl border text-xs font-medium transition-all ${
                          upiApp === app
                            ? 'bg-cyan-500/15 border-cyan-500/40 text-cyan-300'
                            : 'bg-white/[0.02] border-white/5 text-slate-400'
                        }`}
                      >
                        {app}
                      </button>
                    ))}
                  </div>

                  <div>
                    <label className="text-xs text-slate-400 mb-1.5 block">Virtual Payment Address (VPA / UPI ID)</label>
                    <input
                      type="text"
                      value={upiId}
                      onChange={(e) => setUpiId(e.target.value)}
                      placeholder="username@demoupi"
                      className="w-full px-4 py-2.5 rounded-xl bg-white/[0.03] border border-white/10 text-white font-mono text-sm focus:outline-none focus:border-cyan-500/50 transition-all"
                    />
                  </div>

                  <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 flex items-center gap-3">
                    <QrCode size={24} className="text-cyan-400 shrink-0" />
                    <p className="text-xs text-slate-400 leading-snug">
                      QR code display simulation enabled. No bank server handshake will occur.
                    </p>
                  </div>
                </div>
              )}

              {/* Simulated Net Banking Interface */}
              {selectedMethod === 'NET_BANKING' && (
                <div className="mt-6 pt-6 border-t border-white/[0.06] space-y-4">
                  <div>
                    <label className="text-xs text-slate-400 mb-1.5 block">Select Demonstration Bank</label>
                    <div className="grid grid-cols-2 gap-2.5">
                      {['HDFC Bank', 'ICICI Bank', 'State Bank of India', 'Axis Bank', 'Kotak Mahindra', 'Global Bank'].map((bank) => (
                        <button
                          key={bank}
                          type="button"
                          onClick={() => setSelectedBank(bank)}
                          className={`p-2.5 rounded-xl border text-left text-xs font-medium transition-all ${
                            selectedBank === bank
                              ? 'bg-cyan-500/15 border-cyan-500/40 text-cyan-300'
                              : 'bg-white/[0.02] border-white/5 text-slate-400 hover:text-white'
                          }`}
                        >
                          {bank}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Step 2: Simulation Outcome Selector (Explicit Deterministic Test Control) */}
            <div className="bg-gradient-to-br from-cyan-950/20 to-blue-950/20 border border-cyan-500/20 rounded-2xl p-6 backdrop-blur-xl">
              <div className="flex items-center gap-2 mb-1">
                <Sparkles size={16} className="text-cyan-400" />
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                  Test Mechanism &mdash; Deterministic Outcome Selection
                </h3>
              </div>
              <p className="text-xs text-slate-400 mb-4">
                Verify application robustness across distinct testable scenarios:
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {[
                  {
                    id: 'SIMULATED_SUCCESS' as const,
                    title: 'Simulate Success',
                    desc: 'Authorizes booking to CONFIRMED',
                    badge: 'Happy Path',
                    color: 'emerald',
                  },
                  {
                    id: 'SIMULATED_FAILURE' as const,
                    title: 'Simulate Failure',
                    desc: 'Declines and permits retry',
                    badge: 'Decline Test',
                    color: 'red',
                  },
                  {
                    id: 'SIMULATED_CANCELLED' as const,
                    title: 'Simulate Cancel',
                    desc: 'Cancels checkout flow',
                    badge: 'Cancel Test',
                    color: 'slate',
                  },
                ].map((outcome) => (
                  <button
                    key={outcome.id}
                    type="button"
                    onClick={() => setSelectedOutcome(outcome.id)}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      selectedOutcome === outcome.id
                        ? 'bg-cyan-500/20 border-cyan-400 text-white shadow-lg shadow-cyan-500/10'
                        : 'bg-white/[0.02] border-white/5 text-slate-400 hover:text-white hover:bg-white/[0.04]'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-white">{outcome.title}</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/5 font-mono text-cyan-300">
                        {outcome.badge}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 leading-tight">{outcome.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Step 3: Terms & Submission Action */}
            <form onSubmit={handleSubmitPayment} className="space-y-4">
              <label className="flex items-start gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={agreedTerms}
                  onChange={(e) => setAgreedTerms(e.target.checked)}
                  className="mt-1 rounded bg-white/10 border-white/20 text-cyan-500 focus:ring-cyan-500"
                />
                <span className="text-xs text-slate-400 group-hover:text-slate-300 leading-relaxed">
                  I understand that this is an explicitly simulated transaction for demonstration and educational testing. No real money will be charged to any account.
                </span>
              </label>

              <button
                type="submit"
                disabled={processing}
                className={`w-full py-4 px-6 rounded-2xl font-bold text-sm tracking-wide transition-all shadow-xl flex items-center justify-center gap-2 ${
                  processing
                    ? 'bg-slate-700 text-slate-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white hover:shadow-cyan-500/25 hover:scale-[1.01] active:scale-[0.99]'
                }`}
              >
                {processing ? (
                  <>
                    <Loader2 size={18} className="animate-spin text-cyan-400" />
                    <span>Processing Demo Simulation...</span>
                  </>
                ) : (
                  <>
                    <Lock size={16} />
                    <span>
                      Complete Simulated Payment &bull; ₹{booking.totalAmount?.toLocaleString()}
                    </span>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* ─────────────────────────────────────────────
              RIGHT COLUMN: TRIP SUMMARY & FARE BREAKDOWN (5 COLS)
          ───────────────────────────────────────────── */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white/[0.03] border border-white/10 rounded-3xl overflow-hidden backdrop-blur-xl shadow-2xl">
              {/* Destination Photography Banner */}
              <div className="relative h-48 overflow-hidden">
                <img
                  src={destinationImage}
                  alt={destinationAlt}
                  className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#030919] via-transparent to-transparent" />

                <div className="absolute top-3 left-3">
                  <span className="px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-[10px] font-bold text-cyan-300 uppercase tracking-wider">
                    {booking.bookingType} RESERVATION
                  </span>
                </div>

                <div className="absolute bottom-3 left-4 right-4">
                  <h3 className="text-xl font-bold text-white mb-0.5">{destinationName}</h3>
                  <p className="text-xs text-slate-300 flex items-center gap-1">
                    <MapPin size={12} className="text-cyan-400" />
                    {booking.travelDetails?.address || booking.itemSnapshot?.airline || destinationName}
                  </p>
                </div>
              </div>

              {/* Trip Summary Details */}
              <div className="p-6 space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
                  <span className="text-xs text-slate-400">Booking Reference</span>
                  <span className="font-mono text-xs font-bold text-cyan-300 bg-cyan-500/10 px-2.5 py-1 rounded-md border border-cyan-500/20">
                    {booking.bookingReference}
                  </span>
                </div>

                {/* Specific booking details */}
                {booking.bookingType === 'FLIGHT' && (
                  <div className="space-y-2 py-1 text-xs">
                    <div className="flex justify-between text-slate-300">
                      <span>Airline</span>
                      <span className="font-semibold text-white">
                        {booking.itemSnapshot?.airline} ({booking.itemSnapshot?.flightNumber})
                      </span>
                    </div>
                    <div className="flex justify-between text-slate-300">
                      <span>Route</span>
                      <span className="font-semibold text-white">
                        {booking.travelDetails?.origin} &rarr; {booking.travelDetails?.destination}
                      </span>
                    </div>
                    <div className="flex justify-between text-slate-300">
                      <span>Cabin Class</span>
                      <span className="font-semibold text-white">{booking.itemSnapshot?.cabin || 'Economy'}</span>
                    </div>
                  </div>
                )}

                {booking.bookingType === 'HOTEL' && (
                  <div className="space-y-2 py-1 text-xs">
                    <div className="flex justify-between text-slate-300">
                      <span>Property</span>
                      <span className="font-semibold text-white">{booking.itemSnapshot?.hotelName}</span>
                    </div>
                    <div className="flex justify-between text-slate-300">
                      <span>Room Type</span>
                      <span className="font-semibold text-white">{booking.itemSnapshot?.roomName || 'Standard'}</span>
                    </div>
                  </div>
                )}

                {booking.bookingType === 'CAB' && (
                  <div className="space-y-2 py-1 text-xs">
                    <div className="flex justify-between text-slate-300">
                      <span>Vehicle</span>
                      <span className="font-semibold text-white">
                        {booking.travelDetails?.vehicleName} ({booking.travelDetails?.vehicleType})
                      </span>
                    </div>
                  </div>
                )}

                {/* Authoritative Fare Breakdown directly from DB */}
                <div className="pt-4 border-t border-white/[0.06] space-y-2 text-xs">
                  <div className="flex justify-between text-slate-400">
                    <span>Base Fare / Tariff</span>
                    <span className="font-mono text-white">
                      ₹{booking.priceBreakdown?.baseFare?.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Taxes & Regulatory Surcharges</span>
                    <span className="font-mono text-white">
                      ₹{booking.priceBreakdown?.taxes?.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Demo Booking Fee</span>
                    <span className="font-mono text-emerald-400">₹0 (Waived)</span>
                  </div>
                  <div className="flex justify-between items-baseline pt-3 border-t border-white/10 text-base">
                    <span className="font-bold text-white">Total Payable Amount</span>
                    <span className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent font-mono">
                      ₹{booking.totalAmount?.toLocaleString()}
                    </span>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 text-[11px] text-slate-500 leading-relaxed text-center">
                  Authoritative fare verified against database record ID <span className="font-mono">{booking._id}</span>.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
