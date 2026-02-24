import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Loader2 } from 'lucide-react';

const staticPages: Record<string, { title: string, content: string }> = {
  'about-us': {
    title: 'About Us',
    content: `
      <p class="mb-4">SmartShop started in January 2026 by team MM6 from class IT 495. We are dedicated to providing the best e-commerce experience.</p>
      <p class="mb-4">Our mission is to bring high-quality products to customers worldwide with exceptional service and speed.</p>
      <h3 class="text-xl font-bold mt-6 mb-3">Our Team</h3>
      <p>Team MM6 consists of passionate developers and designers working together to build next-generation shopping platforms.</p>
    `
  },
  'shipping-info': {
    title: 'Shipping Information',
    content: `
      <p class="mb-4">We offer worldwide shipping. Standard shipping takes 5-7 business days.</p>
      <p>Express shipping is available for select locations and takes 2-3 business days.</p>
    `
  },
  'returns': {
    title: 'Returns Policy',
    content: `
      <p class="mb-4">You can return any item within 30 days of purchase if you are not completely satisfied.</p>
      <p>Items must be unused and in original packaging.</p>
    `
  },
  'how-to-order': {
    title: 'How to Order',
    content: `
      <ol class="list-decimal pl-5 space-y-2">
        <li>Browse our catalog and add items to your cart.</li>
        <li>Proceed to checkout.</li>
        <li>Enter your shipping and payment details.</li>
        <li>Confirm your order.</li>
      </ol>
    `
  },
  'size-guide': {
    title: 'Comprehensive Size Guide',
    content: `
      <div class="space-y-12 animate-fade-in">
        
        <!-- Intro Section -->
        <div class="bg-indigo-50/50 p-8 rounded-3xl border border-indigo-100/50">
          <p class="text-lg text-gray-700 leading-relaxed font-medium">Measurement is the key to the perfect fit. Use our comprehensive size charts below to find your correct size. All measurements are provided in <strong class="text-indigo-600">inches</strong>.</p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-12">
          
          <!-- Men's Section -->
          <div class="bg-white p-8 rounded-4xl shadow-xl shadow-gray-100 border border-gray-100 hover:border-indigo-200 transition-all duration-300 group">
            <h3 class="text-2xl font-black mb-6 text-gray-900 border-b-2 border-indigo-50 pb-4 flex items-center gap-3">
              <span class="w-8 h-8 bg-indigo-600 text-white rounded-xl flex items-center justify-center text-sm">M</span>
              Men's Sizes
            </h3>
            <div class="overflow-x-auto">
              <table class="w-full text-sm text-left">
                <thead>
                  <tr class="text-gray-400 uppercase tracking-widest text-[10px] border-b border-gray-100">
                    <th class="py-3 font-bold">Size</th>
                    <th class="py-3 font-bold text-center">Chest</th>
                    <th class="py-3 font-bold text-center">Waist</th>
                    <th class="py-3 font-bold text-center">Hips</th>
                    <th class="py-3 font-bold text-center">Length</th>
                  </tr>
                </thead>
                <tbody class="text-gray-600 font-medium">
                  <tr class="border-b border-gray-50 hover:bg-gray-50 transition-colors"><td class="py-3 font-bold text-black">S</td><td class="py-3 text-center">34-36</td><td class="py-3 text-center">28-30</td><td class="py-3 text-center">34-36</td><td class="py-3 text-center">27</td></tr>
                  <tr class="border-b border-gray-50 hover:bg-gray-50 transition-colors"><td class="py-3 font-bold text-black">M</td><td class="py-3 text-center">38-40</td><td class="py-3 text-center">32-34</td><td class="py-3 text-center">38-40</td><td class="py-3 text-center">28</td></tr>
                  <tr class="border-b border-gray-50 hover:bg-gray-50 transition-colors"><td class="py-3 font-bold text-black">L</td><td class="py-3 text-center">42-44</td><td class="py-3 text-center">36-38</td><td class="py-3 text-center">42-44</td><td class="py-3 text-center">29</td></tr>
                  <tr class="border-b border-gray-50 hover:bg-gray-50 transition-colors"><td class="py-3 font-bold text-black">XL</td><td class="py-3 text-center">46-48</td><td class="py-3 text-center">40-42</td><td class="py-3 text-center">46-48</td><td class="py-3 text-center">30</td></tr>
                  <tr class="hover:bg-gray-50 transition-colors"><td class="py-3 font-bold text-black">XXL</td><td class="py-3 text-center">50-52</td><td class="py-3 text-center">44-46</td><td class="py-3 text-center">50-52</td><td class="py-3 text-center">31</td></tr>
                </tbody>
              </table>
            </div>
          </div>

          <!-- Women's Section -->
          <div class="bg-white p-8 rounded-4xl shadow-xl shadow-gray-100 border border-gray-100 hover:border-pink-200 transition-all duration-300 group">
            <h3 class="text-2xl font-black mb-6 text-gray-900 border-b-2 border-pink-50 pb-4 flex items-center gap-3">
              <span class="w-8 h-8 bg-pink-500 text-white rounded-xl flex items-center justify-center text-sm">W</span>
              Women's Sizes
            </h3>
            <div class="overflow-x-auto">
              <table class="w-full text-sm text-left">
                <thead>
                  <tr class="text-gray-400 uppercase tracking-widest text-[10px] border-b border-gray-100">
                    <th class="py-3 font-bold">Size</th>
                    <th class="py-3 font-bold text-center">Bust</th>
                    <th class="py-3 font-bold text-center">Waist</th>
                    <th class="py-3 font-bold text-center">Hips</th>
                  </tr>
                </thead>
                <tbody class="text-gray-600 font-medium">
                  <tr class="border-b border-gray-50 hover:bg-gray-50 transition-colors"><td class="py-3 font-bold text-black">XS</td><td class="py-3 text-center">30-32</td><td class="py-3 text-center">22-24</td><td class="py-3 text-center">32-34</td></tr>
                  <tr class="border-b border-gray-50 hover:bg-gray-50 transition-colors"><td class="py-3 font-bold text-black">S</td><td class="py-3 text-center">32-34</td><td class="py-3 text-center">24-26</td><td class="py-3 text-center">34-36</td></tr>
                  <tr class="border-b border-gray-50 hover:bg-gray-50 transition-colors"><td class="py-3 font-bold text-black">M</td><td class="py-3 text-center">36-38</td><td class="py-3 text-center">28-30</td><td class="py-3 text-center">38-40</td></tr>
                  <tr class="border-b border-gray-50 hover:bg-gray-50 transition-colors"><td class="py-3 font-bold text-black">L</td><td class="py-3 text-center">40-42</td><td class="py-3 text-center">32-34</td><td class="py-3 text-center">42-44</td></tr>
                  <tr class="hover:bg-gray-50 transition-colors"><td class="py-3 font-bold text-black">XL</td><td class="py-3 text-center">44-46</td><td class="py-3 text-center">36-38</td><td class="py-3 text-center">46-48</td></tr>
                </tbody>
              </table>
            </div>
          </div>

        </div>

        <!-- How to measure section -->
        <div class="bg-gray-900 text-white p-10 rounded-4xl mt-12 relative overflow-hidden group">
          <div class="absolute inset-0 bg-indigo-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
          <h3 class="text-2xl font-black mb-8 border-b-2 border-white/10 pb-4 uppercase tracking-widest text-indigo-400">How to Measure Accuracy</h3>
          
          <div class="grid grid-cols-1 md:grid-cols-2 gap-8 text-gray-300">
            <div class="flex gap-5">
              <div class="w-10 h-10 shrink-0 border border-white/20 rounded-full flex items-center justify-center font-bold font-display">1</div>
              <div>
                <h4 class="font-bold text-white uppercase tracking-wider text-sm mb-2">Chest / Bust</h4>
                <p class="text-sm leading-relaxed">Measure under your arms, around the fullest part of your chest or bust. Keep the tape measure level across your back.</p>
              </div>
            </div>
            <div class="flex gap-5">
              <div class="w-10 h-10 shrink-0 border border-white/20 rounded-full flex items-center justify-center font-bold font-display">2</div>
              <div>
                <h4 class="font-bold text-white uppercase tracking-wider text-sm mb-2">Natural Waist</h4>
                <p class="text-sm leading-relaxed">Measure around your natural waistline, keeping the tape comfortably loose. This is usually the narrowest part of your torso.</p>
              </div>
            </div>
            <div class="flex gap-5">
              <div class="w-10 h-10 shrink-0 border border-white/20 rounded-full flex items-center justify-center font-bold font-display">3</div>
              <div>
                <h4 class="font-bold text-white uppercase tracking-wider text-sm mb-2">Hips</h4>
                <p class="text-sm leading-relaxed">Stand with your feet together and measure around the fullest part of your hips and rear.</p>
              </div>
            </div>
            <div class="flex gap-5">
              <div class="w-10 h-10 shrink-0 border border-white/20 rounded-full flex items-center justify-center font-bold font-display">4</div>
              <div>
                <h4 class="font-bold text-white uppercase tracking-wider text-sm mb-2">Pro Fit Tips</h4>
                <p class="text-sm leading-relaxed">If your measurements are between two sizes, choose the smaller size for a tighter fit or the larger size for a looser fit.</p>
              </div>
            </div>
          </div>
        </div>

      </div>
    `
  },
  'fashion-blogger': {
    title: 'Fashion Blogger Program',
    content: `
      <p class="mb-4">Are you a fashion enthusiast? Join our blogger program and get exclusive perks!</p>
      <p>Contact us at bloggers@smartshop.com for more info.</p>
    `
  },
  'payment-method': {
    title: 'Payment Methods',
    content: `
      <div class="space-y-10 animate-fade-in max-w-5xl mx-auto">

        <!-- Hero Section -->
        <div class="bg-gradient-to-br from-indigo-50 via-white to-purple-50 p-8 md:p-10 rounded-4xl border border-indigo-100 text-center">
          <h2 class="text-3xl md:text-4xl font-black text-gray-900 mb-4">Secure & Flexible Payment Options</h2>
          <p class="text-lg text-gray-600 max-w-2xl mx-auto">Shop with confidence using our wide range of trusted payment methods. All transactions are encrypted and secure.</p>
        </div>

        <!-- Payment Methods Grid -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          
          <!-- Credit/Debit Cards -->
          <div class="bg-white p-6 rounded-3xl shadow-lg shadow-gray-100 border border-gray-100 hover:border-indigo-200 hover:shadow-xl transition-all duration-300 group">
            <div class="flex items-center gap-4 mb-4">
              <div class="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center text-white shadow-lg">
                <svg class="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"></path></svg>
              </div>
              <h3 class="text-xl font-bold text-gray-900">Credit/Debit Cards</h3>
            </div>
            <p class="text-gray-600 mb-4">Visa, Mastercard, American Express, and Discover cards accepted.</p>
            <div class="flex gap-2 flex-wrap">
              <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Visa_Inc._logo.svg/2560px-Visa_Inc._logo.svg.png" alt="Visa" class="h-6 opacity-70 hover:opacity-100 transition-opacity" />
              <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/2/2a/Mastercard-logo.svg/1280px-Mastercard-logo.svg.png" alt="Mastercard" class="h-6 opacity-70 hover:opacity-100 transition-opacity" />
              <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/3/30/American_Express_logo_%282018%29.svg/1200px-American_Express_logo_%282018%29.svg.png" alt="Amex" class="h-6 opacity-70 hover:opacity-100 transition-opacity" />
            </div>
          </div>

          <!-- PayPal -->
          <div class="bg-white p-6 rounded-3xl shadow-lg shadow-gray-100 border border-gray-100 hover:border-blue-200 hover:shadow-xl transition-all duration-300 group">
            <div class="flex items-center gap-4 mb-4">
              <div class="w-14 h-14 bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl flex items-center justify-center text-white shadow-lg">
                <svg class="w-7 h-7" fill="currentColor" viewBox="0 0 24 24"><path d="M7.022 21h3.97c.436 0 .806-.314.878-.744l2.46-15.572a.89.89 0 00-.878-1.028H9.18a2.67 2.67 0 00-2.636 2.228L5.368 13.5.888 21h6.134z"/></svg>
              </div>
              <h3 class="text-xl font-bold text-gray-900">PayPal</h3>
            </div>
            <p class="text-gray-600 mb-4">Fast and secure payments with PayPal buyer protection.</p>
            <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/b/b5/PayPal.svg/2560px-PayPal.svg.png" alt="PayPal" class="h-7 opacity-70 hover:opacity-100 transition-opacity" />
          </div>

          <!-- Apple Pay -->
          <div class="bg-white p-6 rounded-3xl shadow-lg shadow-gray-100 border border-gray-100 hover:border-gray-300 hover:shadow-xl transition-all duration-300 group">
            <div class="flex items-center gap-4 mb-4">
              <div class="w-14 h-14 bg-gradient-to-br from-gray-800 to-black rounded-2xl flex items-center justify-center text-white shadow-lg">
                <svg class="w-7 h-7" fill="currentColor" viewBox="0 0 24 24"><path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/></svg>
              </div>
              <h3 class="text-xl font-bold text-gray-900">Apple Pay</h3>
            </div>
            <p class="text-gray-600 mb-4">Quick checkout with Touch ID or Face ID authentication.</p>
            <div class="flex items-center gap-2">
              <span class="text-2xl">🍎</span>
              <span class="font-semibold text-gray-700">Pay</span>
            </div>
          </div>

          <!-- Google Pay -->
          <div class="bg-white p-6 rounded-3xl shadow-lg shadow-gray-100 border border-gray-100 hover:border-gray-300 hover:shadow-xl transition-all duration-300 group">
            <div class="flex items-center gap-4 mb-4">
              <div class="w-14 h-14 bg-gradient-to-br from-white to-gray-100 rounded-2xl flex items-center justify-center shadow-lg border border-gray-200">
                <span class="text-2xl font-bold text-gray-700">G</span>
              </div>
              <h3 class="text-xl font-bold text-gray-900">Google Pay</h3>
            </div>
            <p class="text-gray-600 mb-4">Seamless payments with your saved Google account.</p>
            <div class="flex items-center gap-1">
              <span class="text-xl font-bold text-gray-700">G</span>
              <span class="font-semibold text-gray-700">Pay</span>
            </div>
          </div>

          <!-- Bank Transfer -->
          <div class="bg-white p-6 rounded-3xl shadow-lg shadow-gray-100 border border-gray-100 hover:border-green-200 hover:shadow-xl transition-all duration-300 group">
            <div class="flex items-center gap-4 mb-4">
              <div class="w-14 h-14 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center text-white shadow-lg">
                <svg class="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z"></path></svg>
              </div>
              <h3 class="text-xl font-bold text-gray-900">Bank Transfer</h3>
            </div>
            <p class="text-gray-600 mb-4">Direct bank transfer for large orders. Contact support for details.</p>
            <span class="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">For orders $500+</span>
          </div>

          <!-- Cash on Delivery -->
          <div class="bg-white p-6 rounded-3xl shadow-lg shadow-gray-100 border border-gray-100 hover:border-amber-200 hover:shadow-xl transition-all duration-300 group">
            <div class="flex items-center gap-4 mb-4">
              <div class="w-14 h-14 bg-gradient-to-br from-amber-500 to-amber-600 rounded-2xl flex items-center justify-center text-white shadow-lg">
                <svg class="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
              </div>
              <h3 class="text-xl font-bold text-gray-900">Cash on Delivery</h3>
            </div>
            <p class="text-gray-600 mb-4">Pay with cash when your order is delivered to your doorstep.</p>
            <span class="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-700">Select regions only</span>
          </div>

        </div>

        <!-- Security Section -->
        <div class="bg-gradient-to-br from-indigo-50 to-purple-50 p-8 rounded-4xl border border-indigo-100">
          <h3 class="text-2xl font-black mb-8 text-center uppercase tracking-widest text-indigo-600">🔒 Your Security is Our Priority</h3>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div class="text-center">
              <div class="w-16 h-16 mx-auto mb-4 bg-white rounded-2xl flex items-center justify-center shadow-md">
                <svg class="w-8 h-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path></svg>
              </div>
              <h4 class="font-bold text-gray-900 mb-2">SSL Encrypted</h4>
              <p class="text-gray-600 text-sm">256-bit SSL encryption protects all your data</p>
            </div>
            <div class="text-center">
              <div class="w-16 h-16 mx-auto mb-4 bg-white rounded-2xl flex items-center justify-center shadow-md">
                <svg class="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
              </div>
              <h4 class="font-bold text-gray-900 mb-2">PCI Compliant</h4>
              <p class="text-gray-600 text-sm">Certified to handle credit card information securely</p>
            </div>
            <div class="text-center">
              <div class="w-16 h-16 mx-auto mb-4 bg-white rounded-2xl flex items-center justify-center shadow-md">
                <svg class="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
              </div>
              <h4 class="font-bold text-gray-900 mb-2">Fraud Protection</h4>
              <p class="text-gray-600 text-sm">Advanced fraud detection keeps you safe</p>
            </div>
          </div>
        </div>

        <!-- FAQ Section -->
        <div class="bg-indigo-50/50 p-6 md:p-8 rounded-4xl border border-indigo-100">
          <h3 class="text-2xl font-black mb-6 text-gray-900 text-center">Frequently Asked Questions</h3>
          <div class="space-y-4">
            <div class="bg-white p-5 rounded-2xl border border-indigo-100">
              <h4 class="font-bold text-gray-900 mb-2">Can I use multiple payment methods for one order?</h4>
              <p class="text-gray-600 text-sm">Currently, we accept one payment method per order. However, you can use gift cards in combination with another payment method if your gift card balance doesn't cover the full amount.</p>
            </div>
            <div class="bg-white p-5 rounded-2xl border border-indigo-100">
              <h4 class="font-bold text-gray-900 mb-2">Are installment plans available?</h4>
              <p class="text-gray-600 text-sm">Yes! We partner with Klarna and Afterpay to offer flexible installment payment options. You can split your purchase into 4 interest-free payments.</p>
            </div>
            <div class="bg-white p-5 rounded-2xl border border-indigo-100">
              <h4 class="font-bold text-gray-900 mb-2">Is my payment information secure?</h4>
              <p class="text-gray-600 text-sm">Absolutely. We use industry-leading encryption and never store your full credit card details. All payments are processed through secure, PCI-compliant gateways.</p>
            </div>
          </div>
        </div>

        <!-- Support Banner -->
        <div class="bg-gradient-to-r from-indigo-500 to-purple-600 text-white p-8 rounded-4xl text-center">
          <h3 class="text-2xl font-black mb-3">Need Help with Payment?</h3>
          <p class="text-indigo-100 mb-6">Our support team is here to assist you 24/7 with any payment-related questions.</p>
          <a href="/contact" class="inline-flex items-center gap-2 bg-white text-indigo-600 px-6 py-3 rounded-full font-bold hover:bg-indigo-50 transition-colors">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path></svg>
            Contact Support
          </a>
        </div>

      </div>
    `
  }
};

interface StaticPageProps {
  page?: string;
}

export const StaticPage = ({ page: pageProp }: StaticPageProps) => {
  const { slug } = useParams<{ slug: string }>();
  const activeSlug = pageProp || slug;
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState<{ title: string, content: string } | null>(null);

  useEffect(() => {
    setLoading(true);
    // Simulate loading for effect
    setTimeout(() => {
      if (activeSlug && staticPages[activeSlug]) {
        setPage(staticPages[activeSlug]);
      } else {
        setPage(null);
      }
      setLoading(false);
    }, 300);
  }, [activeSlug]);

  if (loading) return <div className="min-h-[50vh] flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin" /></div>;

  if (!page) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <h1 className="text-4xl font-bold mb-4 text-gray-900">Page Not Found</h1>
        <p className="text-gray-500">The page you are looking for does not exist.</p>
      </div>
    );
  }

  return (
    <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="bg-white rounded-4xl shadow-sm border border-gray-100 p-8 md:p-12">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-8 border-b border-gray-100 pb-4">
          {page.title}
        </h1>
        <div
          className="prose prose-indigo max-w-none text-gray-600"
          dangerouslySetInnerHTML={{ __html: page.content }}
        />
      </div>
    </div>
  );
};
