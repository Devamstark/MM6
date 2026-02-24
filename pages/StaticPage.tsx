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
      <p class="mb-4">We accept the following payment methods:</p>
      <ul class="list-disc pl-5 space-y-1">
        <li>Credit/Debit Cards (Visa, Mastercard, Amex)</li>
        <li>PayPal</li>
        <li>Apple Pay</li>
        <li>Google Pay</li>
      </ul>
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
