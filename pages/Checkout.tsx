import React, { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import { Address } from '../types';
import { api } from '../services/api';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Loader2, CreditCard, Lock, ShieldCheck, CheckCircle, LogIn, UserPlus } from 'lucide-react';

export const Checkout = () => {
  const { items, cartTotal, clearCart } = useCart();
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [step, setStep] = useState<'shipping' | 'payment' | 'success'>('shipping');
  const [loading, setLoading] = useState(false);

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
    }
  }, [isAuthenticated]);

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
      <div className="max-w-2xl mx-auto py-20 px-4 text-center animate-fade-in">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-10 h-10 text-green-600" />
        </div>
        <h2 className="text-3xl font-bold text-gray-900 mb-4">Order Placed Successfully!</h2>
        <p className="text-gray-600 mb-8">Thank you for your purchase. You will receive an email confirmation shortly.</p>
        <button
          onClick={() => navigate('/products')}
          className="bg-indigo-600 text-white px-8 py-3 rounded-lg hover:bg-indigo-700 font-medium"
        >
          Continue Shopping
        </button>
      </div>
    );
  }

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Simulate Payment Gateway Interaction
      await api.createOrder({
        items: items,
        shippingAddress: shippingData,
        paymentDetails: paymentData,
        totalPrice: cartTotal
      });

      clearCart();
      setStep('success');
    } catch (error) {
      console.error(error);
      alert("Payment failed. Please try again.");
    } finally {
      setLoading(false);
    }
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
                  <div className={`flex items-center ${step === 'shipping' ? 'text-indigo-600 font-bold' : 'text-gray-500'}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 mr-2 ${step === 'shipping' ? 'border-indigo-600 bg-indigo-50' : 'border-gray-300'}`}>1</div>
                    Shipping
                  </div>
                  <div className="w-12 h-0.5 bg-gray-300 mx-4"></div>
                  <div className={`flex items-center ${step === 'payment' ? 'text-indigo-600 font-bold' : 'text-gray-500'}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 mr-2 ${step === 'payment' ? 'border-indigo-600 bg-indigo-50' : 'border-gray-300'}`}>2</div>
                    Payment
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sm:p-8">
                  {step === 'shipping' ? (
                    <form onSubmit={(e) => { e.preventDefault(); setStep('payment'); }}>
                      <h2 className="text-xl font-bold mb-6">Shipping Details</h2>

                      {savedAddresses.length > 0 && (
                        <div className="mb-8 animate-fade-in">
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
                            <div className="absolute inset-0 flex items-center">
                              <div className="w-full border-t border-gray-200"></div>
                            </div>
                            <div className="relative flex justify-center text-sm">
                              <span className="px-2 bg-white text-gray-500">Or use a new address</span>
                            </div>
                          </div>
                        </div>
                      )}

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                          <input className="w-full border border-gray-300 rounded-lg p-2.5" required value={shippingData.name} onChange={e => setShippingData({ ...shippingData, name: e.target.value })} />
                        </div>
                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                          <input className="w-full border border-gray-300 rounded-lg p-2.5" required value={shippingData.address} onChange={e => setShippingData({ ...shippingData, address: e.target.value })} placeholder="123 Main St" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                          <input className="w-full border border-gray-300 rounded-lg p-2.5" required value={shippingData.city} onChange={e => setShippingData({ ...shippingData, city: e.target.value })} />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                            <input className="w-full border border-gray-300 rounded-lg p-2.5" required value={shippingData.state} onChange={e => setShippingData({ ...shippingData, state: e.target.value })} />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">ZIP</label>
                            <input className="w-full border border-gray-300 rounded-lg p-2.5" required value={shippingData.zip} onChange={e => setShippingData({ ...shippingData, zip: e.target.value })} />
                          </div>
                        </div>
                      </div>
                      <div className="mt-8 flex justify-end">
                        <button type="submit" className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 font-medium">Continue to Payment</button>
                      </div>
                    </form>
                  ) : (
                    <form onSubmit={handlePlaceOrder}>
                      <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                        <CreditCard className="w-6 h-6 text-indigo-600" />
                        Payment Method
                      </h2>

                      <div className="bg-indigo-50 p-4 rounded-lg mb-6 border border-indigo-100 flex items-start gap-3">
                        <Lock className="w-5 h-5 text-indigo-600 mt-0.5" />
                        <div className="text-sm text-indigo-800">
                          <span className="font-bold">Secure Gateway:</span> In a production environment, this form would be replaced by <strong className="font-bold">Stripe Elements</strong> or a similar PCI-compliant iframe. No real card data is processed here.
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Card Number</label>
                          <input
                            className="w-full border border-gray-300 rounded-lg p-2.5"
                            placeholder="0000 0000 0000 0000"
                            maxLength={19}
                            required
                            value={paymentData.cardNumber}
                            onChange={e => setPaymentData({ ...paymentData, cardNumber: e.target.value })}
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-6">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Expiry Date</label>
                            <input
                              className="w-full border border-gray-300 rounded-lg p-2.5"
                              placeholder="MM/YY"
                              maxLength={5}
                              required
                              value={paymentData.expiry}
                              onChange={e => setPaymentData({ ...paymentData, expiry: e.target.value })}
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">CVC</label>
                            <input
                              className="w-full border border-gray-300 rounded-lg p-2.5"
                              placeholder="123"
                              maxLength={3}
                              required
                              value={paymentData.cvc}
                              onChange={e => setPaymentData({ ...paymentData, cvc: e.target.value })}
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Name on Card</label>
                          <input className="w-full border border-gray-300 rounded-lg p-2.5" required value={paymentData.nameOnCard} onChange={e => setPaymentData({ ...paymentData, nameOnCard: e.target.value })} />
                        </div>
                      </div>

                      <div className="mt-8 flex justify-between items-center">
                        <button type="button" onClick={() => setStep('shipping')} className="text-gray-600 hover:text-gray-900 font-medium">Back to Shipping</button>
                        <button
                          type="submit"
                          disabled={loading}
                          className="bg-indigo-600 text-white px-8 py-3 rounded-lg hover:bg-indigo-700 font-medium flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><ShieldCheck className="w-5 h-5" /> Pay ${cartTotal.toFixed(2)}</>}
                        </button>
                      </div>
                    </form>
                  )}
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
              <div className="border-t border-gray-200 pt-4 space-y-2">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span>${cartTotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Shipping</span>
                  <span>Free</span>
                </div>
                <div className="flex justify-between text-xl font-bold text-gray-900 pt-2 border-t border-gray-100">
                  <span>Total</span>
                  <span>${cartTotal.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};