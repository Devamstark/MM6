import React, { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import { Address } from '../types';
import { api } from '../services/api';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Loader2, CreditCard, Lock, ShieldCheck, CheckCircle, LogIn, UserPlus, DollarSign, Tag, Percent, X, Package, Truck, MapPin, ChevronRight, Sparkles, Info, ArrowLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';

// Initialize Stripe with test public key
const stripePromise = loadStripe('pk_test_51T5FLjCXoN7dV1O9567fmjKf8uLw05HOVNDAbYjQb6b7kSCr53X0EdIjINqvQt7gDZsxSKBB5n649eDNSJrgNoZb00ezrvROlP');

// ─── Stripe Payment Form ───────────────────────────────────────────────────────
const StripePaymentForm = ({ total, onOrderPlaced, onBack, items, shippingData, useEarnings, appliedCoupon, earnings }: {
  total: number;
  onOrderPlaced: (orderId: string) => void;
  onBack: () => void;
  items: any[];
  shippingData: any;
  useEarnings: boolean;
  appliedCoupon: any;
  earnings: any;
}) => {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cardComplete, setCardComplete] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setLoading(true);
    setError(null);

    try {
      const response = await api.createPaymentIntent(items, appliedCoupon?.code, useEarnings);
      const clientSecret = response.clientSecret;

      const result = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: elements.getElement(CardElement)!,
          billing_details: {
            name: shippingData.name,
            email: shippingData.email,
            address: {
              line1: shippingData.address,
              city: shippingData.city,
              state: shippingData.state,
              postal_code: shippingData.zip,
            }
          },
        },
      });

      if (result.error) {
        setError(result.error.message || 'Payment failed');
      } else {
        if (result.paymentIntent.status === 'succeeded') {
          const order = await api.createOrder({
            items,
            shippingAddress: shippingData,
            totalPrice: total,
            useEarnings,
            couponCode: appliedCoupon?.code,
            transactionId: result.paymentIntent.id
          });
          onOrderPlaced(order.id);
        }
      }
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      key="payment"
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -50 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
    >
      {/* Header */}
      <div className="p-6 sm:p-8 border-b border-gray-100">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-indigo-600 to-violet-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-200">
              <CreditCard className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-black text-gray-900">Payment Details</h2>
              <p className="text-sm text-gray-500">Secure checkout powered by Stripe</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {['Visa_2021', 'Mastercard-logo'].map((card, i) => (
              <div key={i} className="w-10 h-7 bg-white border border-gray-200 rounded-lg flex items-center justify-center p-1.5 shadow-sm">
                <img src={`https://upload.wikimedia.org/wikipedia/commons/${i === 0 ? 'd/d6/Visa_2021' : '2/2a/Mastercard-logo'}.svg`} alt={card} className="w-full h-auto" />
              </div>
            ))}
            <div className="h-5 w-px bg-gray-200" />
            <div className="flex items-center gap-1 text-emerald-600 text-xs font-bold">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>SSL</span>
            </div>
          </div>
        </div>
      </div>

      {/* Test Mode Banner */}
      <div className="mx-6 sm:mx-8 mt-6">
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200/60 rounded-2xl p-4 flex items-start gap-3">
          <div className="w-8 h-8 bg-amber-100 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5">
            <Info className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-sm">
            <p className="font-bold text-amber-900 mb-1">🧪 Stripe Test Mode Active</p>
            <p className="text-amber-700 text-xs leading-relaxed">Use these test card details to place an order:</p>
            <div className="mt-2 grid grid-cols-3 gap-2">
              <div className="bg-white/80 rounded-lg px-3 py-1.5 border border-amber-100">
                <span className="text-[10px] uppercase font-bold text-amber-500 tracking-wider block">Card</span>
                <span className="text-xs font-mono font-bold text-gray-900">4242 4242 4242 4242</span>
              </div>
              <div className="bg-white/80 rounded-lg px-3 py-1.5 border border-amber-100">
                <span className="text-[10px] uppercase font-bold text-amber-500 tracking-wider block">Expiry</span>
                <span className="text-xs font-mono font-bold text-gray-900">12/30</span>
              </div>
              <div className="bg-white/80 rounded-lg px-3 py-1.5 border border-amber-100">
                <span className="text-[10px] uppercase font-bold text-amber-500 tracking-wider block">CVC</span>
                <span className="text-xs font-mono font-bold text-gray-900">123</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Card Input */}
      <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6">
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-xs font-black text-gray-500 uppercase tracking-widest">
            <Lock className="w-3 h-3" /> Card Information
          </label>
          <div className={`rounded-2xl border-2 transition-all duration-300 ${cardComplete ? 'border-emerald-300 bg-emerald-50/30 shadow-lg shadow-emerald-100' : 'border-gray-200 bg-white hover:border-gray-300'} focus-within:border-indigo-500 focus-within:ring-4 focus-within:ring-indigo-50`}>
            <div className="p-5">
              <CardElement
                onChange={(e) => setCardComplete(e.complete)}
                options={{
                  style: {
                    base: {
                      fontSize: '17px',
                      color: '#111827',
                      fontFamily: "'Inter', -apple-system, sans-serif",
                      '::placeholder': { color: '#9ca3af', fontWeight: '400' },
                      iconColor: '#4f46e5',
                    },
                    invalid: { color: '#ef4444', iconColor: '#ef4444' },
                  },
                }}
              />
            </div>
          </div>
          {cardComplete && (
            <motion.div
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-1.5 text-xs text-emerald-600 font-bold mt-1"
            >
              <CheckCircle className="w-3.5 h-3.5" /> Card details valid
            </motion.div>
          )}
        </div>

        {/* Shipping Summary */}
        <div className="bg-gray-50 rounded-2xl p-5 border border-gray-100">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
              <MapPin className="w-3 h-3" /> Shipping To
            </span>
            <button type="button" onClick={onBack} className="text-xs text-indigo-600 font-bold hover:text-indigo-800 transition-colors">Edit</button>
          </div>
          <div className="text-sm text-gray-700">
            <p className="font-bold text-gray-900">{shippingData.name}</p>
            <p className="text-gray-500">{shippingData.address}</p>
            <p className="text-gray-500">{shippingData.city}, {shippingData.state} {shippingData.zip}</p>
          </div>
        </div>

        {/* Error */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-red-50 text-red-700 p-4 rounded-2xl text-sm flex items-start gap-3 border border-red-100"
            >
              <div className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <X className="w-3 h-3 text-red-600" />
              </div>
              <div>
                <p className="font-bold text-red-800">Payment Error</p>
                <p className="text-red-600 text-xs mt-0.5">{error}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Actions */}
        <div className="flex flex-col-reverse sm:flex-row justify-between items-center gap-4 pt-4">
          <button
            type="button"
            onClick={onBack}
            disabled={loading}
            className="flex items-center gap-2 text-gray-400 hover:text-gray-900 font-bold transition-all group disabled:opacity-50"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Back to Shipping
          </button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={!stripe || loading || !cardComplete}
            className="w-full sm:w-auto bg-gradient-to-r from-indigo-600 to-violet-600 text-white px-10 py-4 rounded-2xl font-black flex items-center justify-center gap-3 disabled:opacity-40 disabled:cursor-not-allowed shadow-2xl shadow-indigo-200/50 transition-all hover:shadow-indigo-300/70 text-base"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <Lock className="w-4 h-4" />
                Pay ${total.toFixed(2)}
                <ChevronRight className="w-4 h-4" />
              </>
            )}
          </motion.button>
        </div>
      </form>
    </motion.div>
  );
};

// ─── Main Checkout Component ────────────────────────────────────────────────
export const Checkout = () => {
  const { items, cartTotal, clearCart } = useCart();
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [step, setStep] = useState<'shipping' | 'payment' | 'success'>('shipping');
  const [loading, setLoading] = useState(false);
  const [useEarnings, setUseEarnings] = useState(false);
  const [earnings, setEarnings] = useState<{ referralEarnings: number; canRedeem: boolean; minimumToRedeem: number } | null>(null);
  const [lastOrderId, setLastOrderId] = useState<string | null>(null);

  // Coupon state
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; discount: number } | null>(null);
  const [couponError, setCouponError] = useState('');
  const [couponLoading, setCouponLoading] = useState(false);

  const [shippingData, setShippingData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    address: '',
    city: '',
    state: '',
    zip: ''
  });

  const [paymentData, setPaymentData] = useState({
    cardNumber: '',
    expiry: '',
    cvc: '',
    nameOnCard: ''
  });

  const [savedAddresses, setSavedAddresses] = useState<Address[]>([]);

  useEffect(() => {
    if (isAuthenticated) {
      api.getAddresses().then(setSavedAddresses).catch(console.error);
      api.getMyEarnings().then(setEarnings).catch(console.error);
    }
  }, [isAuthenticated]);

  // Calculate totals
  const earningsDiscount = useEarnings && earnings?.canRedeem ? Math.min(earnings.referralEarnings, cartTotal) : 0;
  const couponDiscount = appliedCoupon ? appliedCoupon.discount : 0;
  const finalTotal = Math.max(0, cartTotal - earningsDiscount - couponDiscount);

  // ── Empty Cart ──
  if (items.length === 0 && step !== 'success') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-indigo-50/30 flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center max-w-md"
        >
          <div className="w-24 h-24 bg-gray-100 rounded-3xl flex items-center justify-center mx-auto mb-6">
            <Package className="w-12 h-12 text-gray-300" />
          </div>
          <h2 className="text-2xl font-black text-gray-900 mb-2">Your cart is empty</h2>
          <p className="text-gray-500 mb-8">Add some products to get started with your order.</p>
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => navigate('/products')}
            className="bg-indigo-600 text-white px-8 py-3 rounded-2xl font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-200"
          >
            Browse Products
          </motion.button>
        </motion.div>
      </div>
    );
  }

  // ── Success ──
  if (step === 'success') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-indigo-50/30 flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="max-w-lg w-full text-center"
        >
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', stiffness: 200, damping: 14, delay: 0.15 }}
            className="w-28 h-28 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-emerald-200"
          >
            <CheckCircle className="w-14 h-14 text-white" strokeWidth={2} />
          </motion.div>

          <motion.div
            initial="hidden"
            animate="visible"
            variants={{ visible: { transition: { staggerChildren: 0.1, delayChildren: 0.4 } } }}
          >
            <motion.p
              variants={{ hidden: { opacity: 0, y: 12 }, visible: { opacity: 1, y: 0 } }}
              className="text-xs font-black tracking-[0.3em] text-emerald-600 uppercase mb-3"
            >
              Order Confirmed
            </motion.p>
            <motion.h2
              variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
              className="text-4xl font-black text-gray-900 mb-3"
            >
              Thank you!
            </motion.h2>
            <motion.p
              variants={{ hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0 } }}
              className="text-gray-500 mb-2 text-lg"
            >
              Your order has been placed successfully.
            </motion.p>
            {lastOrderId && (
              <motion.p
                variants={{ hidden: { opacity: 0 }, visible: { opacity: 1 } }}
                className="text-sm text-gray-400 mb-10 font-mono bg-gray-100 inline-block px-4 py-1.5 rounded-full"
              >
                Order #{lastOrderId}
              </motion.p>
            )}
            <motion.div
              variants={{ hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0 } }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => navigate(`/orders/${lastOrderId}`)}
                className="bg-gray-900 text-white px-8 py-3.5 rounded-2xl font-bold shadow-xl shadow-gray-300"
              >
                View Order Details
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => navigate('/products')}
                className="border-2 border-gray-200 text-gray-700 px-8 py-3.5 rounded-2xl font-bold hover:bg-gray-50"
              >
                Continue Shopping
              </motion.button>
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
    );
  }

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const order = await api.createOrder({
        items: items,
        shippingAddress: shippingData,
        paymentDetails: paymentData,
        totalPrice: finalTotal,
        useEarnings: useEarnings && earnings?.canRedeem,
        couponCode: appliedCoupon?.code,
      });

      setLastOrderId(order.id);
      clearCart();
      setStep('success');
    } catch (error) {
      console.error(error);
      alert("Payment failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;

    setCouponLoading(true);
    setCouponError('');

    try {
      const result = await api.validateCoupon(couponCode.trim(), cartTotal);

      if (result.valid) {
        setAppliedCoupon({ code: couponCode.trim(), discount: result.discount });
        setCouponCode('');
      } else {
        setCouponError(result.message || 'Invalid coupon code');
      }
    } catch (error) {
      setCouponError('Failed to apply coupon. Please try again.');
    } finally {
      setCouponLoading(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponError('');
  };

  // ── Checkout Layout ──
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-indigo-50/30">
      {/* Branded Header */}
      <div className="border-b border-gray-200/60 bg-white/80 backdrop-blur-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-violet-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-200/50 group-hover:shadow-indigo-300 transition-shadow">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="text-lg font-black tracking-widest text-gray-900 uppercase">SmartShop</span>
              <span className="text-[10px] font-bold text-gray-400 tracking-widest uppercase block -mt-0.5">Secure Checkout</span>
            </div>
          </Link>

          {/* Step Indicator */}
          <div className="hidden sm:flex items-center gap-2">
            {(['shipping', 'payment'] as const).map((s, i) => (
              <React.Fragment key={s}>
                <div className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all ${step === s ? 'bg-indigo-50 text-indigo-700' : (i < (['shipping', 'payment'] as const).indexOf(step) ? 'text-emerald-600' : 'text-gray-400')}`}>
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-black ${step === s ? 'bg-indigo-600 text-white' : (i < (['shipping', 'payment'] as const).indexOf(step) ? 'bg-emerald-100 text-emerald-600' : 'bg-gray-100 text-gray-400')}`}>
                    {i < (['shipping', 'payment'] as const).indexOf(step) ? <CheckCircle className="w-3.5 h-3.5" /> : i + 1}
                  </div>
                  <span className="text-xs font-bold uppercase tracking-wider">{s}</span>
                </div>
                {i < 1 && (
                  <div className="w-8 h-px bg-gray-200" />
                )}
              </React.Fragment>
            ))}
          </div>

          <div className="flex items-center gap-2 text-xs text-gray-400">
            <Lock className="w-3 h-3" />
            <span className="font-medium hidden sm:inline">256-bit SSL</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">

        {/* Not Authenticated */}
        {!isAuthenticated ? (
          <div className="max-w-md mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-3xl shadow-2xl shadow-gray-200/50 border border-gray-100 overflow-hidden"
            >
              <div className="bg-gradient-to-br from-indigo-600 to-violet-600 p-8 text-center">
                <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
                  <Lock className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-2xl font-black text-white mb-1">Welcome Back</h2>
                <p className="text-indigo-200 text-sm">Sign in to complete your purchase</p>
              </div>
              <div className="p-8 flex flex-col gap-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => navigate('/login', { state: { from: location } })}
                  className="flex items-center justify-center gap-2 px-6 py-3.5 bg-gray-900 text-white rounded-2xl font-bold transition-colors"
                >
                  <LogIn className="w-5 h-5" /> Sign In
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => navigate('/register', { state: { from: location } })}
                  className="flex items-center justify-center gap-2 px-6 py-3.5 border-2 border-gray-200 text-gray-700 rounded-2xl font-bold hover:bg-gray-50 transition-colors"
                >
                  <UserPlus className="w-5 h-5" /> Create Account
                </motion.button>
              </div>
            </motion.div>
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-8">

            {/* ── LEFT: Form Area ── */}
            <div className="flex-1 min-w-0">
              <div className="bg-white rounded-3xl shadow-xl shadow-gray-200/40 border border-gray-100 overflow-hidden">
                <AnimatePresence mode="wait" initial={false}>
                  {step === 'shipping' ? (
                    <motion.form
                      key="shipping"
                      initial={{ opacity: 0, x: 50 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -50 }}
                      transition={{ duration: 0.4, ease: 'easeOut' }}
                      className="divide-y divide-gray-100"
                      onSubmit={(e) => { e.preventDefault(); setStep('payment'); }}
                    >
                      {/* Shipping Header */}
                      <div className="p-6 sm:p-8">
                        <div className="flex items-center gap-4 mb-8">
                          <div className="w-12 h-12 bg-gradient-to-br from-indigo-600 to-violet-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-200">
                            <Truck className="w-6 h-6 text-white" />
                          </div>
                          <div>
                            <h2 className="text-xl font-black text-gray-900">Shipping Address</h2>
                            <p className="text-sm text-gray-500">Where should we deliver your order?</p>
                          </div>
                        </div>

                        {/* Saved Addresses */}
                        {savedAddresses.length > 0 && (
                          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
                            <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                              <MapPin className="w-3 h-3" /> Saved Addresses
                            </h3>
                            <div className="grid grid-cols-1 gap-3">
                              {savedAddresses.map(addr => (
                                <motion.div
                                  key={addr.id}
                                  whileHover={{ scale: 1.01 }}
                                  whileTap={{ scale: 0.99 }}
                                  className={`p-4 border-2 rounded-2xl cursor-pointer flex items-center justify-between transition-all group ${shippingData.address === addr.street && shippingData.zip === addr.postalCode ? 'border-indigo-500 bg-indigo-50/50 shadow-lg shadow-indigo-100' : 'border-gray-100 hover:border-indigo-200 hover:bg-gray-50'}`}
                                  onClick={() => setShippingData({ ...shippingData, name: addr.fullName, address: addr.street, city: addr.city, state: addr.state, zip: addr.postalCode })}
                                >
                                  <div className="flex-1">
                                    <p className="font-bold text-gray-900">{addr.fullName}</p>
                                    <p className="text-sm text-gray-500">{addr.street}, {addr.city}, {addr.state} {addr.postalCode}</p>
                                  </div>
                                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${shippingData.address === addr.street && shippingData.zip === addr.postalCode ? 'border-indigo-600 bg-indigo-600' : 'border-gray-300'}`}>
                                    {shippingData.address === addr.street && shippingData.zip === addr.postalCode && <div className="w-2 h-2 rounded-full bg-white" />}
                                  </div>
                                </motion.div>
                              ))}
                            </div>
                            <div className="relative my-8">
                              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200"></div></div>
                              <div className="relative flex justify-center text-xs"><span className="px-3 bg-white text-gray-400 font-bold uppercase tracking-wider">Or enter new address</span></div>
                            </div>
                          </motion.div>
                        )}

                        {/* Address Form */}
                        <motion.div
                          initial="hidden"
                          animate="visible"
                          variants={{ visible: { transition: { staggerChildren: 0.06, delayChildren: 0.1 } } }}
                          className="grid grid-cols-1 md:grid-cols-2 gap-5"
                        >
                          {[
                            { label: 'Full Name', key: 'name', span: 2, placeholder: 'John Doe' },
                            { label: 'Street Address', key: 'address', span: 2, placeholder: '123 Main Street, Apt 4B' },
                            { label: 'City', key: 'city', span: 1, placeholder: 'New York' },
                            { label: 'State', key: 'state', span: 0.5, placeholder: 'NY' },
                            { label: 'ZIP Code', key: 'zip', span: 0.5, placeholder: '10001' },
                          ].map((field) => (
                            <motion.div
                              key={field.key}
                              variants={{ hidden: { opacity: 0, y: 14 }, visible: { opacity: 1, y: 0 } }}
                              className={field.span === 2 ? 'md:col-span-2' : field.span === 1 ? '' : ''}
                            >
                              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">{field.label}</label>
                              <input
                                className="w-full border-2 border-gray-100 rounded-xl p-3 text-sm font-medium text-gray-900 focus:outline-none focus:ring-4 focus:ring-indigo-50 focus:border-indigo-500 transition-all placeholder:text-gray-300 hover:border-gray-200"
                                required
                                placeholder={field.placeholder}
                                value={(shippingData as any)[field.key]}
                                onChange={e => setShippingData({ ...shippingData, [field.key]: e.target.value })}
                              />
                            </motion.div>
                          ))}
                        </motion.div>
                      </div>

                      {/* Continue Button */}
                      <div className="p-6 sm:p-8 bg-gray-50/50">
                        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                          <button type="button" onClick={() => navigate('/cart')} className="text-gray-400 hover:text-gray-700 text-sm font-bold flex items-center gap-2 transition-colors group">
                            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Back to Cart
                          </button>
                          <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            type="submit"
                            className="w-full sm:w-auto bg-gradient-to-r from-indigo-600 to-violet-600 text-white px-10 py-4 rounded-2xl font-black flex items-center justify-center gap-2 shadow-2xl shadow-indigo-200/50 hover:shadow-indigo-300/70 transition-all text-base"
                          >
                            Continue to Payment <ChevronRight className="w-4 h-4" />
                          </motion.button>
                        </div>
                      </div>
                    </motion.form>
                  ) : (
                    <Elements stripe={stripePromise}>
                      <StripePaymentForm
                        total={finalTotal}
                        onOrderPlaced={(id) => {
                          setLastOrderId(id);
                          clearCart();
                          setStep('success');
                        }}
                        onBack={() => setStep('shipping')}
                        items={items}
                        shippingData={shippingData}
                        useEarnings={useEarnings && (earnings?.canRedeem ?? false)}
                        appliedCoupon={appliedCoupon}
                        earnings={earnings}
                      />
                    </Elements>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* ── RIGHT: Order Summary ── */}
            <div className="lg:w-[400px] flex-shrink-0">
              <div className="bg-white rounded-3xl shadow-xl shadow-gray-200/40 border border-gray-100 overflow-hidden sticky top-28">
                {/* Summary Header */}
                <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
                  <div className="flex items-center justify-between">
                    <h3 className="font-black text-gray-900 flex items-center gap-2">
                      <Package className="w-5 h-5 text-indigo-600" />
                      Order Summary
                    </h3>
                    <span className="text-xs bg-indigo-100 text-indigo-700 px-2.5 py-1 rounded-full font-bold">{items.length} item{items.length !== 1 ? 's' : ''}</span>
                  </div>
                </div>

                {/* Items */}
                <div className="p-6 space-y-4 max-h-72 overflow-y-auto">
                  {items.map(item => (
                    <div key={item.id} className="flex gap-4 group">
                      <div className="relative">
                        <img src={item.imageUrl} alt="" className="w-16 h-16 rounded-xl object-cover bg-gray-100 border border-gray-100 group-hover:scale-105 transition-transform" />
                        <div className="absolute -top-1 -right-1 w-5 h-5 bg-gray-900 text-white text-[10px] font-bold rounded-full flex items-center justify-center">{item.quantity}</div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-gray-900 line-clamp-1">{item.name}</p>
                        <p className="text-xs text-gray-400 mt-0.5">Qty: {item.quantity}</p>
                      </div>
                      <p className="text-sm font-black text-gray-900">${(item.price * item.quantity).toFixed(2)}</p>
                    </div>
                  ))}
                </div>

                {/* Coupon */}
                <div className="px-6 pb-4">
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                      <input
                        type="text"
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                        placeholder="Promo code"
                        disabled={!!appliedCoupon || couponLoading}
                        className="w-full pl-9 pr-3 py-2.5 border-2 border-gray-100 rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 disabled:bg-gray-50 transition-all placeholder:text-gray-300"
                      />
                    </div>
                    {appliedCoupon ? (
                      <button
                        type="button"
                        onClick={handleRemoveCoupon}
                        className="px-3 py-2.5 bg-red-50 text-red-600 border-2 border-red-100 rounded-xl text-xs font-bold hover:bg-red-100 transition-colors flex items-center gap-1"
                      >
                        <X className="w-3 h-3" /> Remove
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={handleApplyCoupon}
                        disabled={!couponCode.trim() || couponLoading}
                        className="px-4 py-2.5 bg-gray-900 text-white rounded-xl text-xs font-bold hover:bg-gray-800 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                      >
                        {couponLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Apply'}
                      </button>
                    )}
                  </div>
                  {couponError && (
                    <p className="text-xs text-red-600 mt-2 flex items-center gap-1 font-medium">
                      <X className="w-3 h-3" /> {couponError}
                    </p>
                  )}
                  {appliedCoupon && (
                    <p className="text-xs text-emerald-600 mt-2 flex items-center gap-1 font-bold">
                      <CheckCircle className="w-3 h-3" /> "{appliedCoupon.code}" applied!
                    </p>
                  )}
                </div>

                {/* Referral Earnings */}
                {isAuthenticated && earnings && earnings.referralEarnings > 0 && (
                  <div className="px-6 pb-4">
                    <div className={`p-4 rounded-2xl border-2 transition-all ${earnings.canRedeem ? 'bg-emerald-50/50 border-emerald-200/60' : 'bg-gray-50 border-gray-100'}`}>
                      <div className="flex items-center gap-2 mb-2">
                        <DollarSign className={`w-4 h-4 ${earnings.canRedeem ? 'text-emerald-600' : 'text-gray-400'}`} />
                        <p className={`text-sm font-bold ${earnings.canRedeem ? 'text-emerald-800' : 'text-gray-500'}`}>
                          Referral Balance: <span className="font-black">${earnings.referralEarnings.toFixed(2)}</span>
                        </p>
                      </div>
                      {earnings.canRedeem ? (
                        <label className="flex items-center gap-3 cursor-pointer group">
                          <div
                            onClick={() => setUseEarnings(!useEarnings)}
                            className={`relative w-11 h-6 rounded-full transition-colors ${useEarnings ? 'bg-emerald-500' : 'bg-gray-300'}`}
                          >
                            <div className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${useEarnings ? 'translate-x-5' : 'translate-x-0'}`} />
                          </div>
                          <span className="text-sm font-bold text-gray-700 group-hover:text-emerald-700 transition-colors">
                            Apply ${Math.min(earnings.referralEarnings, cartTotal).toFixed(2)}
                          </span>
                        </label>
                      ) : (
                        <p className="text-xs text-gray-400">
                          Earn <strong>${(earnings.minimumToRedeem - earnings.referralEarnings).toFixed(2)}</strong> more to unlock (min. ${earnings.minimumToRedeem.toFixed(2)})
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {/* Totals */}
                <div className="p-6 bg-gradient-to-b from-gray-50/50 to-gray-50 border-t border-gray-100 space-y-3">
                  <div className="flex justify-between text-sm text-gray-500">
                    <span>Subtotal</span>
                    <span className="font-bold text-gray-700">${cartTotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm text-gray-500">
                    <span className="flex items-center gap-1"><Truck className="w-3.5 h-3.5" /> Shipping</span>
                    <span className="font-bold text-emerald-600">Free</span>
                  </div>
                  {earningsDiscount > 0 && (
                    <div className="flex justify-between text-sm text-emerald-600 font-bold">
                      <span className="flex items-center gap-1"><DollarSign className="w-3.5 h-3.5" /> Referral Credit</span>
                      <span>-${earningsDiscount.toFixed(2)}</span>
                    </div>
                  )}
                  {couponDiscount > 0 && (
                    <div className="flex justify-between text-sm text-emerald-600 font-bold">
                      <span className="flex items-center gap-1"><Percent className="w-3.5 h-3.5" /> Coupon</span>
                      <span>-${couponDiscount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="pt-4 border-t border-gray-200 flex justify-between items-baseline">
                    <span className="text-sm font-bold text-gray-500">Total</span>
                    <div className="text-right">
                      <span className="text-3xl font-black text-gray-900">${finalTotal.toFixed(2)}</span>
                      <span className="text-xs text-gray-400 block">USD</span>
                    </div>
                  </div>
                </div>

                {/* Trust Badges */}
                <div className="p-6 border-t border-gray-100 bg-gray-50/30">
                  <div className="flex items-center justify-center gap-6 text-gray-400">
                    <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider">
                      <Lock className="w-3 h-3" /> Secure
                    </div>
                    <div className="w-px h-4 bg-gray-200" />
                    <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider">
                      <ShieldCheck className="w-3 h-3" /> Encrypted
                    </div>
                    <div className="w-px h-4 bg-gray-200" />
                    <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider">
                      <Truck className="w-3 h-3" /> Free Ship
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};