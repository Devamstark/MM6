import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { Shield, CreditCard, Truck, CheckCircle } from 'lucide-react';

export const Checkout = () => {
  const { items, cartTotal, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<'shipping' | 'payment' | 'confirmation'>('shipping');
  const [orderId, setOrderId] = useState<number | null>(null);

  const [shippingDetails, setShippingDetails] = useState({
    fullName: user?.name || '',
    address: '',
    city: '',
    zipCode: '',
    country: ''
  });

  const [paymentDetails, setPaymentDetails] = useState({
    cardNumber: '',
    expiry: '',
    cvc: '',
    nameOnCard: ''
  });

  if (items.length === 0 && step !== 'confirmation') {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
        <h2 className="text-2xl font-bold text-gray-900">Your cart is empty</h2>
        <button 
          onClick={() => navigate('/products')}
          className="mt-4 text-indigo-600 hover:text-indigo-500 font-medium"
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
      // Simulate API call to create order
      const order = await api.createOrder({
        userId: user?.id || 0,
        items: items,
        totalAmount: cartTotal,
        shippingAddress: shippingDetails,
        paymentStatus: 'paid'
      });
      
      setOrderId(order.id);
      clearCart();
      setStep('confirmation');
    } catch (error) {
      console.error('Order failed:', error);
      alert('Failed to place order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Progress Steps */}
        <div className="mb-8">
            <div className="flex items-center justify-between">
                <div className={`flex flex-col items-center ${step === 'shipping' ? 'text-indigo-600' : 'text-gray-500'}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${step === 'shipping' || step === 'payment' || step === 'confirmation' ? 'border-indigo-600 bg-indigo-600 text-white' : 'border-gray-300'}`}>
                        <Truck className="w-4 h-4" />
                    </div>
                    <span className="text-xs mt-1 font-medium">Shipping</span>
                </div>
                <div className="flex-1 h-0.5 bg-gray-200 mx-2"></div>
                <div className={`flex flex-col items-center ${step === 'payment' ? 'text-indigo-600' : 'text-gray-500'}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${step === 'payment' || step === 'confirmation' ? 'border-indigo-600 bg-indigo-600 text-white' : 'border-gray-300'}`}>
                        <CreditCard className="w-4 h-4" />
                    </div>
                    <span className="text-xs mt-1 font-medium">Payment</span>
                </div>
                <div className="flex-1 h-0.5 bg-gray-200 mx-2"></div>
                <div className={`flex flex-col items-center ${step === 'confirmation' ? 'text-green-600' : 'text-gray-500'}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${step === 'confirmation' ? 'border-green-600 bg-green-600 text-white' : 'border-gray-300'}`}>
                        <CheckCircle className="w-4 h-4" />
                    </div>
                    <span className="text-xs mt-1 font-medium">Confirmation</span>
                </div>
            </div>
        </div>

        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          
          {/* STEP 1: SHIPPING */}
          {step === 'shipping' && (
            <form onSubmit={(e) => { e.preventDefault(); setStep('payment'); }} className="p-6 space-y-6">
              <h2 className="text-xl font-bold text-gray-900">Shipping Details</h2>
              
              <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                <div className="sm:col-span-6">
                  <label htmlFor="full-name" className="block text-sm font-medium text-gray-700">Full name</label>
                  <input
                    type="text"
                    required
                    value={shippingDetails.fullName}
                    onChange={e => setShippingDetails({...shippingDetails, fullName: e.target.value})}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>

                <div className="sm:col-span-6">
                  <label htmlFor="address" className="block text-sm font-medium text-gray-700">Address</label>
                  <input
                    type="text"
                    required
                    value={shippingDetails.address}
                    onChange={e => setShippingDetails({...shippingDetails, address: e.target.value})}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label htmlFor="city" className="block text-sm font-medium text-gray-700">City</label>
                  <input
                    type="text"
                    required
                    value={shippingDetails.city}
                    onChange={e => setShippingDetails({...shippingDetails, city: e.target.value})}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label htmlFor="region" className="block text-sm font-medium text-gray-700">State / Province</label>
                  <input
                    type="text"
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label htmlFor="postal-code" className="block text-sm font-medium text-gray-700">ZIP / Postal code</label>
                  <input
                    type="text"
                    required
                    value={shippingDetails.zipCode}
                    onChange={e => setShippingDetails({...shippingDetails, zipCode: e.target.value})}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-6 border-t border-gray-200">
                 <button
                    type="submit"
                    className="bg-indigo-600 border border-transparent rounded-md shadow-sm py-2 px-4 inline-flex justify-center text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    Continue to Payment
                  </button>
              </div>
            </form>
          )}

          {/* STEP 2: PAYMENT */}
          {step === 'payment' && (
            <form onSubmit={handlePlaceOrder} className="p-6 space-y-6">
              <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold text-gray-900">Payment Details</h2>
                  <button type="button" onClick={() => setStep('shipping')} className="text-sm text-indigo-600 hover:text-indigo-500">Edit Shipping</button>
              </div>

              {/* Order Summary */}
              <div className="bg-gray-50 p-4 rounded-md mb-6">
                  <h3 className="text-sm font-medium text-gray-900 mb-2">Order Summary</h3>
                  <div className="flex justify-between text-sm text-gray-600 mb-1">
                      <span>Subtotal ({items.length} items)</span>
                      <span>${cartTotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm text-gray-600 mb-1">
                      <span>Shipping</span>
                      <span>Free</span>
                  </div>
                  <div className="flex justify-between text-base font-bold text-gray-900 mt-2 border-t border-gray-200 pt-2">
                      <span>Total</span>
                      <span>${cartTotal.toFixed(2)}</span>
                  </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label htmlFor="card-number" className="block text-sm font-medium text-gray-700">Card number</label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <input
                      type="text"
                      className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-3 sm:text-sm border-gray-300 rounded-md"
                      placeholder="0000 0000 0000 0000"
                      required
                      value={paymentDetails.cardNumber}
                      onChange={e => setPaymentDetails({...paymentDetails, cardNumber: e.target.value})}
                    />
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                      <Shield className="h-4 w-4 text-gray-400" />
                    </div>
                  </div>
                </div>

                <div>
                  <label htmlFor="name-on-card" className="block text-sm font-medium text-gray-700">Name on card</label>
                  <input
                    type="text"
                    className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    required
                    value={paymentDetails.nameOnCard}
                    onChange={e => setPaymentDetails({...paymentDetails, nameOnCard: e.target.value})}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="expiry" className="block text-sm font-medium text-gray-700">Expiration date (MM/YY)</label>
                    <input
                      type="text"
                      className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                      placeholder="MM/YY"
                      required
                      value={paymentDetails.expiry}
                      onChange={e => setPaymentDetails({...paymentDetails, expiry: e.target.value})}
                    />
                  </div>
                  <div>
                    <label htmlFor="cvc" className="block text-sm font-medium text-gray-700">CVC</label>
                    <input
                      type="text"
                      className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                      placeholder="123"
                      required
                      value={paymentDetails.cvc}
                      onChange={e => setPaymentDetails({...paymentDetails, cvc: e.target.value})}
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-6 border-t border-gray-200">
                 <button
                    type="submit"
                    disabled={loading}
                    className={`w-full bg-indigo-600 border border-transparent rounded-md shadow-sm py-3 px-4 inline-flex justify-center items-center text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${loading ? 'opacity-75 cursor-not-allowed' : ''}`}
                  >
                    {loading ? 'Processing...' : `Pay $${cartTotal.toFixed(2)}`}
                  </button>
              </div>
            </form>
          )}

          {/* STEP 3: CONFIRMATION */}
          {step === 'confirmation' && (
            <div className="p-8 text-center">
                <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-6">
                    <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
                <h2 className="text-3xl font-extrabold text-gray-900 mb-2">Order Confirmed!</h2>
                <p className="text-lg text-gray-500 mb-6">Thank you for your purchase. Your order #{orderId} has been placed.</p>
                
                <div className="bg-gray-50 rounded-lg p-6 max-w-sm mx-auto mb-8">
                    <h3 className="font-medium text-gray-900 mb-2">What happens next?</h3>
                    <p className="text-sm text-gray-600">You will receive an email confirmation shortly. Sellers will be notified to ship your items.</p>
                </div>

                <div className="flex justify-center gap-4">
                    <button onClick={() => navigate('/products')} className="text-indigo-600 font-medium hover:text-indigo-500">
                        Continue Shopping
                    </button>
                    {/* In future, link to /orders */}
                </div>
            </div>
          )}
          
        </div>
      </div>
    </div>
  );
};
