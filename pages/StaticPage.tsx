import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { api } from '../services/api';
import { PageContent } from '../types';

const fallbackContent: Record<string, { title: string, content: string }> = {
    'about-us': {
        title: 'About Us',
        content: `
      <p class="mb-4">CloudMart started in January 2026 by team MM6 from class IT 495. We are dedicated to providing the best e-commerce experience.</p>
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
        title: 'Size Guide',
        content: `
      <p class="mb-4">Please refer to the measurements below:</p>
      <ul class="list-disc pl-5 space-y-1">
        <li>S: Chest 34-36"</li>
        <li>M: Chest 38-40"</li>
        <li>L: Chest 42-44"</li>
        <li>XL: Chest 46-48"</li>
      </ul>
    `
    },
    'fashion-blogger': {
        title: 'Fashion Blogger Program',
        content: `
      <p class="mb-4">Are you a fashion enthusiast? Join our blogger program and get exclusive perks!</p>
      <p>Contact us at bloggers@cloudmart.com for more info.</p>
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

export const StaticPage = () => {
    const { slug } = useParams<{ slug: string }>();
    const [page, setPage] = useState<PageContent | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPage = async () => {
            setLoading(true);
            if (slug) {
                // Try API first
                const apiPage = await api.getPage(slug);
                if (apiPage) {
                    setPage(apiPage);
                } else if (fallbackContent[slug]) {
                    // Fallback to static content
                    setPage({
                        slug,
                        title: fallbackContent[slug].title,
                        content: fallbackContent[slug].content,
                        updatedAt: new Date().toISOString()
                    });
                } else {
                    setPage(null);
                }
            }
            setLoading(false);
        };
        fetchPage();
    }, [slug]);

    if (loading) {
        return <div className="min-h-[50vh] flex items-center justify-center">Loading...</div>;
    }

    if (!page) {
        return (
            <div className="max-w-4xl mx-auto px-4 py-16 text-center">
                <h1 className="text-4xl font-bold mb-4 text-gray-900">Page Not Found</h1>
                <p className="text-gray-500">The page you are looking for does not exist.</p>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 md:p-12">
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
