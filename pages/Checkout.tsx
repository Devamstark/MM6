import React, { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import { Address } from '../types';
import { api } from '../services/api';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Loader2, CreditCard, Lock, ShieldCheck, CheckCircle, LogIn, UserPlus, DollarSign, Tag, Percent, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

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

  // 1. Empty Cart Check
  if (items.length === 0 && step !== 'success') {
    return (
      <div className="max-w-2xl mx-auto py-20 px-4 text-center">
        <h2 className="text-2xl font-bold mb-4">Your cart is empty</h2>
        <button onClick={() => navigate('/products')} className="text-indigo-600 hover:underline">Continue Shopping</button>
      </div>
    );
  }

  // 2. Success State
  if (step === 'success') {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="max-w-2xl mx-auto py-20 px-4 text-center"
      >
        {/* Animated checkmark circle */}
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 14, delay: 0.15 }}
          className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-8"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 260, damping: 18, delay: 0.35 }}
          >
            <CheckCircle className="w-12 h-12 text-green-500" strokeWidth={2} />
          </motion.div>
        </motion.div>

        <motion.div
          initial="hidden"
          animate="visible"
          variants={{ visible: { transition: { staggerChildren: 0.1, delayChildren: 0.4 } } }}
        >
          <motion.h2
            variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
            className="text-3xl font-bold text-gray-900 mb-3"
          >
            Order Placed Successfully!
          </motion.h2>
          <motion.p
            variants={{ hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0 } }}
            className="text-gray-500 mb-3"
          >
            Thank you for your purchase. You will receive an email confirmation shortly.
          </motion.p>
          {lastOrderId && (
            <motion.p
              variants={{ hidden: { opacity: 0 }, visible: { opacity: 1 } }}
              className="text-sm text-gray-400 mb-8 font-mono"
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
              className="bg-indigo-600 text-white px-8 py-3 rounded-xl hover:bg-indigo-700 font-bold shadow-lg shadow-indigo-200"
            >
              View Order Details
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => navigate('/products')}
              className="border-2 border-gray-200 text-gray-700 px-8 py-3 rounded-xl hover:bg-gray-50 font-bold"
            >
              Continue Shopping
            </motion.button>
          </motion.div>
        </motion.div>
      </motion.div>
    );
  }

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Simulate Payment Gateway Interaction
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

  return (
    <div className="bg-gray-50 min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row gap-8">

          {/* Main Content Section */}
          <div className="flex-1">

            {/* If Not Authenticated, Show Login Prompt */}
            {!isAuthenticated ? (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
                <div className="mx-auto h-12 w-12 bg-indigo-100 rounded-full flex items-center justify-center mb-4">
                  <Lock className="h-6 w-6 text-indigo-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Sign in to Checkout</h2>
                <p className="text-gray-500 mb-8 max-w-md mx-auto">Please sign in to your account to complete your purchase, track your order, and receive updates.</p>

                <div className="flex flex-col sm:flex-row justify-center gap-4">
                  <button
                    onClick={() => navigate('/login', { state: { from: location } })}
                    className="flex items-center justify-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium transition-colors"
                  >
                    <LogIn className="w-5 h-5" /> Sign In
                  </button>
                  <button
                    onClick={() => navigate('/register', { state: { from: location } })}
                    className="flex items-center justify-center gap-2 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors"
                  >
                    <UserPlus className="w-5 h-5" /> Create Account
                  </button>
                </div>
              </div>
            ) : (
              // Authenticated View
              <>
                {/* Steps Indicator */}
                <div className="flex items-center mb-8">
                  {(['shipping', 'payment'] as const).map((s, i) => (
                    <React.Fragment key={s}>
                      <div className={`flex items-center ${step === s ? 'text-indigo-600 font-bold' : 'text-gray-400'}`}>
                        <motion.div
                          animate={step === s ? { scale: 1.15, borderColor: '#4f46e5', backgroundColor: '#eef2ff' } : { scale: 1, borderColor: '#d1d5db', backgroundColor: 'transparent' }}
                          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                          className="w-8 h-8 rounded-full flex items-center justify-center border-2 mr-2 text-sm font-bold"
                        >
                          {s === 'payment' && step === 'payment' ? (
                            <CreditCard className="w-4 h-4 text-indigo-600" />
                          ) : (
                            <span className={step === s ? 'text-indigo-600' : 'text-gray-400'}>{i + 1}</span>
                          )}
                        </motion.div>
                        <span className="capitalize text-sm font-semibold">{s}</span>
                      </div>
                      {i < 1 && (
                        <div className="flex-1 h-0.5 mx-4 bg-gray-200 overflow-hidden">
                          <motion.div
                            animate={{ width: step === 'payment' ? '100%' : '0%' }}
                            transition={{ duration: 0.5, ease: 'easeInOut' }}
                            className="h-full bg-indigo-500"
                          />
                        </div>
                      )}
                    </React.Fragment>
                  ))}
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                  <AnimatePresence mode="wait" initial={false}>
                    {step === 'shipping' ? (
                      <motion.form
                        key="shipping"
                        initial={{ opacity: 0, x: 40 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -40 }}
                        transition={{ duration: 0.35, ease: 'easeOut' }}
                        className="p-6 sm:p-8"
                        onSubmit={(e) => { e.preventDefault(); setStep('payment'); }}
                      >
                        <h2 className="text-xl font-bold mb-6">Shipping Details</h2>

                        {savedAddresses.length > 0 && (
                          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
                            <h3 className="font-bold text-gray-700 mb-3 flex items-center gap-2">
                              <span className="bg-indigo-100 p-1 rounded text-indigo-600"><ShieldCheck className="w-4 h-4" /></span>
                              Saved Addresses
                            </h3>
                            <div className="grid grid-cols-1 gap-3">
                              {savedAddresses.map(addr => (
                                <div key={addr.id}
                                  className={`p-4 border rounded-xl cursor-pointer flex items-center justify-between transition-all group ${shippingData.address === addr.street && shippingData.zip === addr.postalCode ? 'border-indigo-600 bg-indigo-50 ring-1 ring-indigo-600' : 'border-gray-200 hover:border-indigo-300 hover:bg-gray-50'}`}
                                  onClick={() => setShippingData({ ...shippingData, name: addr.fullName, address: addr.street, city: addr.city, state: addr.state, zip: addr.postalCode })}
                                >
                                  <div className="flex-1">
                                    <p className="font-bold text-gray-900 group-hover:text-indigo-700 transition-colors">{addr.fullName}</p>
                                    <p className="text-sm text-gray-600">{addr.street}</p>
                                    <p className="text-sm text-gray-500">{addr.city}, {addr.state} {addr.postalCode}</p>
                                  </div>
                                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${shippingData.address === addr.street && shippingData.zip === addr.postalCode ? 'border-indigo-600 bg-indigo-600' : 'border-gray-300'}`}>
                                    {shippingData.address === addr.street && shippingData.zip === addr.postalCode && <div className="w-2 h-2 rounded-full bg-white" />}
                                  </div>
                                </div>
                              ))}
                            </div>
                            <div className="relative my-8">
                              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200"></div></div>
                              <div className="relative flex justify-center text-sm"><span className="px-2 bg-white text-gray-500">Or use a new address</span></div>
                            </div>
                          </motion.div>
                        )}

                        <motion.div
                          initial="hidden"
                          animate="visible"
                          variants={{ visible: { transition: { staggerChildren: 0.08, delayChildren: 0.1 } } }}
                          className="grid grid-cols-1 md:grid-cols-2 gap-6"
                        >
                          <motion.div variants={{ hidden: { opacity: 0, y: 14 }, visible: { opacity: 1, y: 0 } }} className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                            <input className="w-full border border-gray-300 rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-300 transition" required value={shippingData.name} onChange={e => setShippingData({ ...shippingData, name: e.target.value })} />
                          </motion.div>
                          <motion.div variants={{ hidden: { opacity: 0, y: 14 }, visible: { opacity: 1, y: 0 } }} className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                            <input className="w-full border border-gray-300 rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-300 transition" required value={shippingData.address} onChange={e => setShippingData({ ...shippingData, address: e.target.value })} placeholder="123 Main St" />
                          </motion.div>
                          <motion.div variants={{ hidden: { opacity: 0, y: 14 }, visible: { opacity: 1, y: 0 } }}>
                            <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                            <input className="w-full border border-gray-300 rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-300 transition" required value={shippingData.city} onChange={e => setShippingData({ ...shippingData, city: e.target.value })} />
                          </motion.div>
                          <motion.div variants={{ hidden: { opacity: 0, y: 14 }, visible: { opacity: 1, y: 0 } }} className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                              <input className="w-full border border-gray-300 rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-300 transition" required value={shippingData.state} onChange={e => setShippingData({ ...shippingData, state: e.target.value })} />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">ZIP</label>
                              <input className="w-full border border-gray-300 rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-300 transition" required value={shippingData.zip} onChange={e => setShippingData({ ...shippingData, zip: e.target.value })} />
                            </div>
                          </motion.div>
                        </motion.div>

                        <div className="mt-8 flex justify-end">
                          <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} type="submit" className="bg-indigo-600 text-white px-8 py-3 rounded-xl hover:bg-indigo-700 font-bold shadow-lg shadow-indigo-200">
                            Continue to Payment →
                          </motion.button>
                        </div>
                      </motion.form>
                    ) : (
                      <motion.form
                        key="payment"
                        initial={{ opacity: 0, x: 40 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -40 }}
                        transition={{ duration: 0.35, ease: 'easeOut' }}
                        className="p-6 sm:p-8"
                        onSubmit={handlePlaceOrder}
                      >
                        <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                          <CreditCard className="w-6 h-6 text-indigo-600" />
                          Payment Method
                        </h2>

                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-indigo-50 p-4 rounded-xl mb-6 border border-indigo-100 flex items-start gap-3">
                          <Lock className="w-5 h-5 text-indigo-600 mt-0.5" />
                          <div className="text-sm text-indigo-800">
                            <span className="font-bold">Secure Gateway:</span> In a production environment, this form would be replaced by <strong className="font-bold">Stripe Elements</strong> or a similar PCI-compliant iframe. No real card data is processed here.
                          </div>
                        </motion.div>

                        <motion.div
                          initial="hidden"
                          animate="visible"
                          variants={{ visible: { transition: { staggerChildren: 0.1, delayChildren: 0.15 } } }}
                          className="space-y-4"
                        >
                          <motion.div variants={{ hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0 } }}>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Card Number</label>
                            <input className="w-full border border-gray-300 rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-300 transition" placeholder="0000 0000 0000 0000" maxLength={19} required value={paymentData.cardNumber} onChange={e => setPaymentData({ ...paymentData, cardNumber: e.target.value })} />
                          </motion.div>
                          <motion.div variants={{ hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0 } }} className="grid grid-cols-2 gap-6">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Expiry Date</label>
                              <input className="w-full border border-gray-300 rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-300 transition" placeholder="MM/YY" maxLength={5} required value={paymentData.expiry} onChange={e => setPaymentData({ ...paymentData, expiry: e.target.value })} />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">CVC</label>
                              <input className="w-full border border-gray-300 rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-300 transition" placeholder="123" maxLength={3} required value={paymentData.cvc} onChange={e => setPaymentData({ ...paymentData, cvc: e.target.value })} />
                            </div>
                          </motion.div>
                          <motion.div variants={{ hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0 } }}>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Name on Card</label>
                            <input className="w-full border border-gray-300 rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-300 transition" required value={paymentData.nameOnCard} onChange={e => setPaymentData({ ...paymentData, nameOnCard: e.target.value })} />
                          </motion.div>
                        </motion.div>

                        <div className="mt-8 flex justify-between items-center">
                          <motion.button type="button" whileHover={{ x: -3 }} onClick={() => setStep('shipping')} className="text-gray-500 hover:text-gray-900 font-medium flex items-center gap-1">
                            ← Back
                          </motion.button>
                          <motion.button type="submit" whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }} disabled={loading} className="bg-indigo-600 text-white px-8 py-3 rounded-xl hover:bg-indigo-700 font-bold flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed shadow-lg shadow-indigo-200">
                            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><ShieldCheck className="w-5 h-5" /> Pay ${finalTotal.toFixed(2)}</>}
                          </motion.button>
                        </div>
                      </motion.form>
                    )}
                  </AnimatePresence>
                </div>
              </>
            )}
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:w-96">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sticky top-24">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Order Summary</h3>
              <ul className="divide-y divide-gray-100 mb-4 max-h-80 overflow-y-auto">
                {items.map(item => (
                  <li key={item.id} className="py-3 flex gap-3">
                    <img src={item.imageUrl} alt="" className="w-16 h-16 rounded object-cover bg-gray-100" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900 line-clamp-2">{item.name}</p>
                      <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                    </div>
                    <p className="text-sm font-medium text-gray-900">${(item.price * item.quantity).toFixed(2)}</p>
                  </li>
                ))}
              </ul>

              {/* Coupon Code Input */}
              <div className="mb-4">
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Percent className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                      placeholder="Coupon code"
                      disabled={!!appliedCoupon || couponLoading}
                      className="w-full pl-9 pr-3 py-2.5 border border-gray-300 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-100"
                    />
                  </div>
                  {appliedCoupon ? (
                    <button
                      type="button"
                      onClick={handleRemoveCoupon}
                      className="px-4 py-2.5 bg-red-50 text-red-600 border border-red-200 rounded-lg text-sm font-bold hover:bg-red-100 transition-colors flex items-center gap-1"
                    >
                      <X className="w-4 h-4" /> Remove
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={handleApplyCoupon}
                      disabled={!couponCode.trim() || couponLoading}
                      className="px-4 py-2.5 bg-indigo-600 text-white rounded-lg text-sm font-bold hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed min-w-[80px]"
                    >
                      {couponLoading ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : 'Apply'}
                    </button>
                  )}
                </div>
                {couponError && (
                  <p className="text-xs text-red-600 mt-1.5 flex items-center gap-1">
                    <X className="w-3 h-3" /> {couponError}
                  </p>
                )}
                {appliedCoupon && (
                  <p className="text-xs text-emerald-600 mt-1.5 flex items-center gap-1 font-medium">
                    <CheckCircle className="w-3 h-3" /> Coupon "{appliedCoupon.code}" applied!
                  </p>
                )}
              </div>

              {/* Referral Earnings Redemption */}
              {isAuthenticated && earnings && earnings.referralEarnings > 0 && (
                <div className={`mb-4 p-4 rounded-xl border transition-all ${earnings.canRedeem
                  ? 'bg-emerald-50 border-emerald-200'
                  : 'bg-gray-50 border-gray-200'
                  }`}>
                  <div className="flex items-center gap-2 mb-1">
                    <DollarSign className={`w-4 h-4 ${earnings.canRedeem ? 'text-emerald-600' : 'text-gray-400'}`} />
                    <p className={`text-sm font-semibold ${earnings.canRedeem ? 'text-emerald-800' : 'text-gray-500'}`}>
                      Referral Earnings: <span className="font-bold">${earnings.referralEarnings.toFixed(2)}</span>
                    </p>
                  </div>
                  {earnings.canRedeem ? (
                    <>
                      <p className="text-xs text-emerald-600 mb-3">You can apply your earnings as a discount!</p>
                      <label className="flex items-center gap-3 cursor-pointer group">
                        <div
                          onClick={() => setUseEarnings(!useEarnings)}
                          className={`relative w-11 h-6 rounded-full transition-colors ${useEarnings ? 'bg-emerald-500' : 'bg-gray-300'
                            }`}
                        >
                          <div className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${useEarnings ? 'translate-x-5' : 'translate-x-0'
                            }`} />
                        </div>
                        <span className="text-sm font-medium text-gray-700 group-hover:text-emerald-700 transition-colors">
                          Apply ${Math.min(earnings.referralEarnings, cartTotal).toFixed(2)} credit
                        </span>
                      </label>
                    </>
                  ) : (
                    <p className="text-xs text-gray-400">
                      Earn <strong>${(earnings.minimumToRedeem - earnings.referralEarnings).toFixed(2)}</strong> more in referrals to unlock redemption (min. ${earnings.minimumToRedeem.toFixed(2)})
                    </p>
                  )}
                </div>
              )}

              <div className="border-t border-gray-200 pt-4 space-y-2">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span>${cartTotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Shipping</span>
                  <span>Free</span>
                </div>
                {earningsDiscount > 0 && (
                  <div className="flex justify-between text-emerald-600 font-medium">
                    <span className="flex items-center gap-1"><Tag className="w-4 h-4" /> Referral Credit</span>
                    <span>-${earningsDiscount.toFixed(2)}</span>
                  </div>
                )}
                {couponDiscount > 0 && (
                  <div className="flex justify-between text-emerald-600 font-medium">
                    <span className="flex items-center gap-1"><Percent className="w-4 h-4" /> Coupon Discount</span>
                    <span>-${couponDiscount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-xl font-bold text-gray-900 pt-2 border-t border-gray-100">
                  <span>Total</span>
                  <span>${finalTotal.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};