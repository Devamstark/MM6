import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Loader2 } from 'lucide-react';

const staticPages: Record<string, { title: string, content: string }> = {
  'about-us': {
    title: 'About Us',
    content: `
      <div class="space-y-10 animate-fade-in max-w-5xl mx-auto">

        <!-- Hero Section with Animation -->
        <div class="bg-gradient-to-br from-indigo-50 via-white to-purple-50 p-8 md:p-10 rounded-4xl border border-indigo-100 text-center relative overflow-hidden">
          <div class="absolute inset-0 bg-gradient-to-r from-indigo-500/5 to-purple-500/5 animate-pulse"></div>
          <div class="relative z-10">
            <div class="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-3xl flex items-center justify-center text-white shadow-xl animate-bounce">
              <svg class="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path></svg>
            </div>
            <h2 class="text-3xl md:text-4xl font-black text-gray-900 mb-4">Welcome to SmartShop</h2>
            <p class="text-lg text-gray-600 max-w-2xl mx-auto">Your trusted destination for trendy fashion and quality products.</p>
          </div>
        </div>

        <!-- Our Story Cards -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          
          <!-- Founded -->
          <div class="bg-white p-6 rounded-3xl shadow-lg shadow-gray-100 border border-gray-100 hover:border-indigo-200 hover:shadow-xl transition-all duration-300 group hover:-translate-y-2">
            <div class="flex items-center gap-4 mb-4">
              <div class="w-14 h-14 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform duration-300">
                <svg class="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
              </div>
              <h3 class="text-xl font-bold text-gray-900">Founded</h3>
            </div>
            <p class="text-gray-600">SmartShop started in January 2026, bringing innovation to e-commerce.</p>
          </div>

          <!-- Our Mission -->
          <div class="bg-white p-6 rounded-3xl shadow-lg shadow-gray-100 border border-gray-100 hover:border-purple-200 hover:shadow-xl transition-all duration-300 group hover:-translate-y-2">
            <div class="flex items-center gap-4 mb-4">
              <div class="w-14 h-14 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform duration-300">
                <svg class="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
              </div>
              <h3 class="text-xl font-bold text-gray-900">Our Mission</h3>
            </div>
            <p class="text-gray-600">Deliver high-quality products worldwide with exceptional service and speed.</p>
          </div>

          <!-- Our Team -->
          <div class="bg-white p-6 rounded-3xl shadow-lg shadow-gray-100 border border-gray-100 hover:border-amber-200 hover:shadow-xl transition-all duration-300 group hover:-translate-y-2">
            <div class="flex items-center gap-4 mb-4">
              <div class="w-14 h-14 bg-gradient-to-br from-amber-500 to-amber-600 rounded-2xl flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform duration-300">
                <svg class="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
              </div>
              <h3 class="text-xl font-bold text-gray-900">Our Team</h3>
            </div>
            <p class="text-gray-600">Team MM6 from IT 495 - passionate developers and designers building next-gen shopping platforms.</p>
          </div>

        </div>

        <!-- Team Members Section -->
        <div class="bg-gradient-to-br from-indigo-50 to-purple-50 p-8 rounded-4xl border border-indigo-100">
          <h3 class="text-2xl font-black mb-8 text-center uppercase tracking-widest text-indigo-600">👥 Meet Our Team</h3>
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            
            <!-- Team Member 1 -->
            <div class="bg-white p-6 rounded-3xl shadow-lg border border-gray-100 text-center hover:shadow-xl hover:-translate-y-2 transition-all duration-300 group">
              <div class="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-indigo-400 to-indigo-600 rounded-full flex items-center justify-center text-white text-2xl font-black shadow-lg group-hover:scale-110 transition-transform duration-300">AC</div>
              <h4 class="font-bold text-gray-900 mb-1">Abdul Choudhary</h4>
              <p class="text-gray-500 text-sm mb-4">Team Lead</p>
              <a href="https://github.com/achoudhury28" target="_blank" rel="noopener noreferrer" class="inline-flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-full text-sm font-medium hover:bg-gray-800 transition-colors">
                <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/></svg>
                GitHub
              </a>
            </div>

            <!-- Team Member 2 -->
            <div class="bg-white p-6 rounded-3xl shadow-lg border border-gray-100 text-center hover:shadow-xl hover:-translate-y-2 transition-all duration-300 group">
              <div class="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full flex items-center justify-center text-white text-2xl font-black shadow-lg group-hover:scale-110 transition-transform duration-300">VG</div>
              <h4 class="font-bold text-gray-900 mb-1">Vrushika Gajjar</h4>
              <p class="text-gray-500 text-sm mb-4">Developer</p>
              <a href="https://github.com/Helly1529" target="_blank" rel="noopener noreferrer" class="inline-flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-full text-sm font-medium hover:bg-gray-800 transition-colors">
                <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/></svg>
                GitHub
              </a>
            </div>

            <!-- Team Member 3 -->
            <div class="bg-white p-6 rounded-3xl shadow-lg border border-gray-100 text-center hover:shadow-xl hover:-translate-y-2 transition-all duration-300 group">
              <div class="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-amber-400 to-amber-600 rounded-full flex items-center justify-center text-white text-2xl font-black shadow-lg group-hover:scale-110 transition-transform duration-300">AM</div>
              <h4 class="font-bold text-gray-900 mb-1">Abdul Munshi Masjud</h4>
              <p class="text-gray-500 text-sm mb-4">Developer</p>
              <a href="https://github.com/Masjud2001" target="_blank" rel="noopener noreferrer" class="inline-flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-full text-sm font-medium hover:bg-gray-800 transition-colors">
                <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/></svg>
                GitHub
              </a>
            </div>

            <!-- Team Member 4 -->
            <div class="bg-white p-6 rounded-3xl shadow-lg border border-gray-100 text-center hover:shadow-xl hover:-translate-y-2 transition-all duration-300 group">
              <div class="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center text-white text-2xl font-black shadow-lg group-hover:scale-110 transition-transform duration-300">DT</div>
              <h4 class="font-bold text-gray-900 mb-1">Devam Trivedi</h4>
              <p class="text-gray-500 text-sm mb-4">Developer</p>
              <a href="https://github.com/Devamstark" target="_blank" rel="noopener noreferrer" class="inline-flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-full text-sm font-medium hover:bg-gray-800 transition-colors">
                <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/></svg>
                GitHub
              </a>
            </div>

          </div>
        </div>

        <!-- Values Section -->
        <div class="bg-gradient-to-br from-indigo-50 to-purple-50 p-8 rounded-4xl border border-indigo-100">
          <h3 class="text-2xl font-black mb-6 text-center uppercase tracking-widest text-indigo-600">⭐ Our Values</h3>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div class="bg-white p-5 rounded-2xl border border-indigo-100 hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
              <h4 class="font-bold text-gray-900 mb-2 flex items-center gap-2">
                <svg class="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path></svg>
                Customer First
              </h4>
              <p class="text-gray-600 text-sm">Your satisfaction is our top priority. We go above and beyond to ensure you have the best shopping experience.</p>
            </div>
            <div class="bg-white p-5 rounded-2xl border border-indigo-100 hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
              <h4 class="font-bold text-gray-900 mb-2 flex items-center gap-2">
                <svg class="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"></path></svg>
                Quality Assured
              </h4>
              <p class="text-gray-600 text-sm">Every product is carefully selected to meet our high standards of quality and durability.</p>
            </div>
            <div class="bg-white p-5 rounded-2xl border border-indigo-100 hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
              <h4 class="font-bold text-gray-900 mb-2 flex items-center gap-2">
                <svg class="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                Fast Delivery
              </h4>
              <p class="text-gray-600 text-sm">We partner with reliable shipping providers to get your orders to you as quickly as possible.</p>
            </div>
            <div class="bg-white p-5 rounded-2xl border border-indigo-100 hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
              <h4 class="font-bold text-gray-900 mb-2 flex items-center gap-2">
                <svg class="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>
                24/7 Support
              </h4>
              <p class="text-gray-600 text-sm">Our dedicated support team is always ready to help you with any questions or concerns.</p>
            </div>
          </div>
        </div>

        <!-- Stats Section with Animation -->
        <div class="bg-white p-8 rounded-4xl shadow-lg shadow-gray-100 border border-gray-100">
          <h3 class="text-2xl font-black mb-6 text-center text-gray-900">Our Impact</h3>
          <div class="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div class="text-center group">
              <div class="text-4xl font-black text-indigo-600 mb-2 group-hover:scale-125 transition-transform duration-300">10K+</div>
              <p class="text-gray-600 text-sm font-medium">Happy Customers</p>
            </div>
            <div class="text-center group">
              <div class="text-4xl font-black text-purple-600 mb-2 group-hover:scale-125 transition-transform duration-300">5K+</div>
              <p class="text-gray-600 text-sm font-medium">Products</p>
            </div>
            <div class="text-center group">
              <div class="text-4xl font-black text-amber-600 mb-2 group-hover:scale-125 transition-transform duration-300">50+</div>
              <p class="text-gray-600 text-sm font-medium">Countries</p>
            </div>
            <div class="text-center group">
              <div class="text-4xl font-black text-green-600 mb-2 group-hover:scale-125 transition-transform duration-300">99%</div>
              <p class="text-gray-600 text-sm font-medium">Satisfaction Rate</p>
            </div>
          </div>
        </div>

      </div>
    `
  },
  'shipping-info': {
    title: 'Shipping Information',
    content: `
      <div class="space-y-10 animate-fade-in max-w-5xl mx-auto">

        <!-- Hero Section -->
        <div class="bg-gradient-to-br from-indigo-50 via-white to-purple-50 p-8 md:p-10 rounded-4xl border border-indigo-100 text-center">
          <h2 class="text-3xl md:text-4xl font-black text-gray-900 mb-4">Fast & Reliable Shipping</h2>
          <p class="text-lg text-gray-600 max-w-2xl mx-auto">We offer multiple shipping options to get your order to you quickly and safely.</p>
        </div>

        <!-- Shipping Options Grid -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          
          <!-- Standard Shipping -->
          <div class="bg-white p-6 rounded-3xl shadow-lg shadow-gray-100 border border-gray-100 hover:border-indigo-200 hover:shadow-xl transition-all duration-300 group">
            <div class="flex items-center gap-4 mb-4">
              <div class="w-14 h-14 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg">
                <svg class="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0"></path></svg>
              </div>
              <h3 class="text-xl font-bold text-gray-900">Standard</h3>
            </div>
            <p class="text-gray-600 mb-3">5-7 business days</p>
            <span class="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-indigo-100 text-indigo-700">FREE over $50</span>
          </div>

          <!-- Express Shipping -->
          <div class="bg-white p-6 rounded-3xl shadow-lg shadow-gray-100 border border-gray-100 hover:border-purple-200 hover:shadow-xl transition-all duration-300 group">
            <div class="flex items-center gap-4 mb-4">
              <div class="w-14 h-14 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center text-white shadow-lg">
                <svg class="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
              </div>
              <h3 class="text-xl font-bold text-gray-900">Express</h3>
            </div>
            <p class="text-gray-600 mb-3">2-3 business days</p>
            <span class="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-purple-100 text-purple-700">$9.99</span>
          </div>

          <!-- Overnight Shipping -->
          <div class="bg-white p-6 rounded-3xl shadow-lg shadow-gray-100 border border-gray-100 hover:border-amber-200 hover:shadow-xl transition-all duration-300 group">
            <div class="flex items-center gap-4 mb-4">
              <div class="w-14 h-14 bg-gradient-to-br from-amber-500 to-amber-600 rounded-2xl flex items-center justify-center text-white shadow-lg">
                <svg class="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
              </div>
              <h3 class="text-xl font-bold text-gray-900">Overnight</h3>
            </div>
            <p class="text-gray-600 mb-3">Next business day</p>
            <span class="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-700">$19.99</span>
          </div>

        </div>

        <!-- Shipping Coverage -->
        <div class="bg-gradient-to-br from-indigo-50 to-purple-50 p-8 rounded-4xl border border-indigo-100">
          <h3 class="text-2xl font-black mb-6 text-center uppercase tracking-widest text-indigo-600">🌍 Worldwide Shipping</h3>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div class="bg-white p-5 rounded-2xl border border-indigo-100">
              <h4 class="font-bold text-gray-900 mb-2 flex items-center gap-2">
                <svg class="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
                Domestic (US)
              </h4>
              <p class="text-gray-600 text-sm">Free standard shipping on orders over $50. All 50 states covered.</p>
            </div>
            <div class="bg-white p-5 rounded-2xl border border-indigo-100">
              <h4 class="font-bold text-gray-900 mb-2 flex items-center gap-2">
                <svg class="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
                International
              </h4>
              <p class="text-gray-600 text-sm">Shipping to 100+ countries. Rates calculated at checkout based on location.</p>
            </div>
          </div>
        </div>

        <!-- Tracking Section -->
        <div class="bg-white p-8 rounded-4xl shadow-lg shadow-gray-100 border border-gray-100 text-center">
          <div class="w-16 h-16 mx-auto mb-4 bg-indigo-100 rounded-2xl flex items-center justify-center">
            <svg class="w-8 h-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"></path></svg>
          </div>
          <h3 class="text-xl font-black text-gray-900 mb-2">Track Your Order</h3>
          <p class="text-gray-600 mb-4">Once your order ships, you'll receive a tracking number via email to monitor your package in real-time.</p>
        </div>

        <!-- FAQ Section -->
        <div class="bg-indigo-50/50 p-6 md:p-8 rounded-4xl border border-indigo-100">
          <h3 class="text-2xl font-black mb-6 text-gray-900 text-center">Frequently Asked Questions</h3>
          <div class="space-y-4">
            <div class="bg-white p-5 rounded-2xl border border-indigo-100">
              <h4 class="font-bold text-gray-900 mb-2">Do you ship to my country?</h4>
              <p class="text-gray-600 text-sm">We ship to over 100 countries worldwide. Enter your address at checkout to see available shipping options and rates.</p>
            </div>
            <div class="bg-white p-5 rounded-2xl border border-indigo-100">
              <h4 class="font-bold text-gray-900 mb-2">Can I change my shipping address after ordering?</h4>
              <p class="text-gray-600 text-sm">Contact us within 24 hours of placing your order and we'll do our best to update the shipping address before it ships.</p>
            </div>
            <div class="bg-white p-5 rounded-2xl border border-indigo-100">
              <h4 class="font-bold text-gray-900 mb-2">What if my package is lost or damaged?</h4>
              <p class="text-gray-600 text-sm">All shipments are insured. If your package is lost or damaged, contact our support team and we'll resolve it immediately.</p>
            </div>
          </div>
        </div>

      </div>
    `
  },
  'returns': {
    title: 'Returns Policy',
    content: `
      <div class="space-y-10 animate-fade-in max-w-5xl mx-auto">

        <!-- Hero Section -->
        <div class="bg-gradient-to-br from-indigo-50 via-white to-purple-50 p-8 md:p-10 rounded-4xl border border-indigo-100 text-center">
          <h2 class="text-3xl md:text-4xl font-black text-gray-900 mb-4">Easy Returns & Refunds</h2>
          <p class="text-lg text-gray-600 max-w-2xl mx-auto">Not satisfied with your purchase? We make returns simple and hassle-free.</p>
        </div>

        <!-- Returns Policy Cards -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          
          <!-- 30-Day Returns -->
          <div class="bg-white p-6 rounded-3xl shadow-lg shadow-gray-100 border border-gray-100 hover:border-indigo-200 hover:shadow-xl transition-all duration-300 group">
            <div class="flex items-center gap-4 mb-4">
              <div class="w-14 h-14 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg">
                <svg class="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
              </div>
              <h3 class="text-xl font-bold text-gray-900">30-Day Returns</h3>
            </div>
            <p class="text-gray-600">Return any item within 30 days of purchase if you're not completely satisfied.</p>
          </div>

          <!-- Free Returns -->
          <div class="bg-white p-6 rounded-3xl shadow-lg shadow-gray-100 border border-gray-100 hover:border-purple-200 hover:shadow-xl transition-all duration-300 group">
            <div class="flex items-center gap-4 mb-4">
              <div class="w-14 h-14 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center text-white shadow-lg">
                <svg class="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 12H4"></path></svg>
              </div>
              <h3 class="text-xl font-bold text-gray-900">Free Returns</h3>
            </div>
            <p class="text-gray-600">Free return shipping on all orders. We'll provide a prepaid label.</p>
          </div>

          <!-- Full Refund -->
          <div class="bg-white p-6 rounded-3xl shadow-lg shadow-gray-100 border border-gray-100 hover:border-green-200 hover:shadow-xl transition-all duration-300 group">
            <div class="flex items-center gap-4 mb-4">
              <div class="w-14 h-14 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center text-white shadow-lg">
                <svg class="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
              </div>
              <h3 class="text-xl font-bold text-gray-900">Full Refund</h3>
            </div>
            <p class="text-gray-600">Get a full refund to your original payment method within 5-10 business days.</p>
          </div>

        </div>

        <!-- Return Conditions -->
        <div class="bg-gradient-to-br from-indigo-50 to-purple-50 p-8 rounded-4xl border border-indigo-100">
          <h3 class="text-2xl font-black mb-6 text-center uppercase tracking-widest text-indigo-600">📦 Return Conditions</h3>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div class="bg-white p-5 rounded-2xl border border-indigo-100">
              <h4 class="font-bold text-gray-900 mb-2 flex items-center gap-2">
                <svg class="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
                Items Must Be Unused
              </h4>
              <p class="text-gray-600 text-sm">Products must be in original condition with tags attached and original packaging.</p>
            </div>
            <div class="bg-white p-5 rounded-2xl border border-indigo-100">
              <h4 class="font-bold text-gray-900 mb-2 flex items-center gap-2">
                <svg class="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
                Proof of Purchase Required
              </h4>
              <p class="text-gray-600 text-sm">Please include your order confirmation email or packing slip with the return.</p>
            </div>
          </div>
        </div>

        <!-- Self-Service Return Form (Coming Soon) -->
        <div class="bg-gradient-to-r from-amber-50 to-orange-50 p-8 rounded-4xl border-2 border-dashed border-amber-300 text-center">
          <div class="w-16 h-16 mx-auto mb-4 bg-amber-100 rounded-2xl flex items-center justify-center">
            <svg class="w-8 h-8 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
          </div>
          <h3 class="text-xl font-black text-gray-900 mb-2">🚀 Self-Service Return Portal</h3>
          <p class="text-gray-600 mb-4 max-w-lg mx-auto">Coming Soon! Generate your own return labels, track return status, and get instant refunds with our new self-service return form.</p>
          <span class="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold bg-amber-200 text-amber-800">
            <svg class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
            Coming Soon
          </span>
        </div>

        <!-- How to Return -->
        <div class="bg-white p-8 rounded-4xl shadow-lg shadow-gray-100 border border-gray-100">
          <h3 class="text-2xl font-black mb-6 text-center text-gray-900">How to Return an Item</h3>
          <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div class="text-center">
              <div class="w-12 h-12 mx-auto mb-3 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-black">1</div>
              <h4 class="font-bold text-gray-900 mb-2">Contact Support</h4>
              <p class="text-gray-600 text-sm">Email us at returns@smartshop.com with your order number.</p>
            </div>
            <div class="text-center">
              <div class="w-12 h-12 mx-auto mb-3 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-black">2</div>
              <h4 class="font-bold text-gray-900 mb-2">Get Label</h4>
              <p class="text-gray-600 text-sm">We'll send you a prepaid return shipping label via email.</p>
            </div>
            <div class="text-center">
              <div class="w-12 h-12 mx-auto mb-3 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-black">3</div>
              <h4 class="font-bold text-gray-900 mb-2">Ship It Back</h4>
              <p class="text-gray-600 text-sm">Pack the item securely and drop it off at any shipping location.</p>
            </div>
            <div class="text-center">
              <div class="w-12 h-12 mx-auto mb-3 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-black">4</div>
              <h4 class="font-bold text-gray-900 mb-2">Get Refund</h4>
              <p class="text-gray-600 text-sm">Once received, your refund will be processed within 5-10 days.</p>
            </div>
          </div>
        </div>

      </div>
    `
  },
  'how-to-order': {
    title: 'How to Order',
    content: `
      <div class="space-y-10 animate-fade-in max-w-5xl mx-auto">

        <!-- Hero Section -->
        <div class="bg-gradient-to-br from-indigo-50 via-white to-purple-50 p-8 md:p-10 rounded-4xl border border-indigo-100 text-center">
          <h2 class="text-3xl md:text-4xl font-black text-gray-900 mb-4">Shop in 4 Easy Steps</h2>
          <p class="text-lg text-gray-600 max-w-2xl mx-auto">Finding and ordering your favorite products has never been easier.</p>
        </div>

        <!-- Steps Grid -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          
          <!-- Step 1 -->
          <div class="bg-white p-6 rounded-3xl shadow-lg shadow-gray-100 border border-gray-100 hover:border-indigo-200 hover:shadow-xl transition-all duration-300 group text-center">
            <div class="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg">
              <span class="text-2xl font-black">1</span>
            </div>
            <h3 class="text-lg font-bold text-gray-900 mb-3">Browse Products</h3>
            <p class="text-gray-600 text-sm">Explore our catalog of trendy fashion items and accessories.</p>
          </div>

          <!-- Step 2 -->
          <div class="bg-white p-6 rounded-3xl shadow-lg shadow-gray-100 border border-gray-100 hover:border-purple-200 hover:shadow-xl transition-all duration-300 group text-center">
            <div class="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center text-white shadow-lg">
              <span class="text-2xl font-black">2</span>
            </div>
            <h3 class="text-lg font-bold text-gray-900 mb-3">Add to Cart</h3>
            <p class="text-gray-600 text-sm">Select your size and quantity, then add items to your shopping cart.</p>
          </div>

          <!-- Step 3 -->
          <div class="bg-white p-6 rounded-3xl shadow-lg shadow-gray-100 border border-gray-100 hover:border-amber-200 hover:shadow-xl transition-all duration-300 group text-center">
            <div class="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-amber-500 to-amber-600 rounded-2xl flex items-center justify-center text-white shadow-lg">
              <span class="text-2xl font-black">3</span>
            </div>
            <h3 class="text-lg font-bold text-gray-900 mb-3">Checkout</h3>
            <p class="text-gray-600 text-sm">Enter your shipping address and choose your preferred payment method.</p>
          </div>

          <!-- Step 4 -->
          <div class="bg-white p-6 rounded-3xl shadow-lg shadow-gray-100 border border-gray-100 hover:border-green-200 hover:shadow-xl transition-all duration-300 group text-center">
            <div class="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center text-white shadow-lg">
              <span class="text-2xl font-black">4</span>
            </div>
            <h3 class="text-lg font-bold text-gray-900 mb-3">Confirm Order</h3>
            <p class="text-gray-600 text-sm">Review your order and confirm. You'll receive an email confirmation instantly.</p>
          </div>

        </div>

        <!-- Tips Section -->
        <div class="bg-gradient-to-br from-indigo-50 to-purple-50 p-8 rounded-4xl border border-indigo-100">
          <h3 class="text-2xl font-black mb-6 text-center uppercase tracking-widest text-indigo-600">💡 Pro Tips</h3>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div class="bg-white p-5 rounded-2xl border border-indigo-100">
              <h4 class="font-bold text-gray-900 mb-2 flex items-center gap-2">
                <svg class="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"></path></svg>
                Create an Account
              </h4>
              <p class="text-gray-600 text-sm">Save your details for faster checkout and track your order history.</p>
            </div>
            <div class="bg-white p-5 rounded-2xl border border-indigo-100">
              <h4 class="font-bold text-gray-900 mb-2 flex items-center gap-2">
                <svg class="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                Check Size Guide
              </h4>
              <p class="text-gray-600 text-sm">Use our size guide to find the perfect fit before ordering.</p>
            </div>
            <div class="bg-white p-5 rounded-2xl border border-indigo-100">
              <h4 class="font-bold text-gray-900 mb-2 flex items-center gap-2">
                <svg class="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                Free Shipping Over $50
              </h4>
              <p class="text-gray-600 text-sm">Add more items to your cart to qualify for free standard shipping.</p>
            </div>
          </div>
        </div>

        <!-- Need Help Banner -->
        <div class="bg-gradient-to-r from-indigo-500 to-purple-600 text-white p-8 rounded-4xl text-center">
          <h3 class="text-2xl font-black mb-3">Need Help Ordering?</h3>
          <p class="text-indigo-100 mb-6">Our customer support team is available 24/7 to assist you with your order.</p>
          <a href="/contact" class="inline-flex items-center gap-2 bg-white text-indigo-600 px-6 py-3 rounded-full font-bold hover:bg-indigo-50 transition-colors">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path></svg>
            Contact Support
          </a>
        </div>

      </div>
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
