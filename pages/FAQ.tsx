import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown, HelpCircle, Package, Truck, CreditCard, RotateCcw, User, ShoppingBag, Gift, Phone } from 'lucide-react';

interface FAQItem {
    question: string;
    answer: string;
    category: 'general' | 'shipping' | 'payment' | 'returns' | 'account' | 'products';
    icon: React.ReactNode;
}

const faqData: FAQItem[] = [
    // General
    {
        question: 'What is SmartShop?',
        answer: 'SmartShop is a premium e-commerce marketplace offering high-quality fashion, accessories, and lifestyle products. We provide a seamless shopping experience with fast shipping and excellent customer service.',
        category: 'general',
        icon: <ShoppingBag className="w-5 h-5" />
    },
    {
        question: 'How do I create an account?',
        answer: 'Click on the "Sign In" or "Account" icon in the top right corner, then select "Create Account". Fill in your details including name, email, and password. You\'ll receive a confirmation email to verify your account.',
        category: 'general',
        icon: <User className="w-5 h-5" />
    },
    {
        question: 'Is my personal information secure?',
        answer: 'Absolutely! We use industry-standard encryption and security measures to protect your personal information. Your data is never shared with third parties without your consent.',
        category: 'general',
        icon: <HelpCircle className="w-5 h-5" />
    },
    {
        question: 'Do you offer gift cards?',
        answer: 'Yes! We offer digital gift cards in various denominations. They can be purchased online and delivered instantly via email. Gift cards never expire and can be used for any purchase on SmartShop.',
        category: 'general',
        icon: <Gift className="w-5 h-5" />
    },
    
    // Shipping
    {
        question: 'What are your shipping options?',
        answer: 'We offer multiple shipping options:\n• Standard Shipping (5-7 business days) - FREE on orders over $100\n• Express Shipping (2-3 business days) - $15.99\n• Overnight Shipping (1 business day) - $29.99',
        category: 'shipping',
        icon: <Truck className="w-5 h-5" />
    },
    {
        question: 'Do you ship internationally?',
        answer: 'Yes, we ship to over 100 countries worldwide. International shipping rates and delivery times vary by location. You can see the exact shipping cost at checkout before completing your order.',
        category: 'shipping',
        icon: <Truck className="w-5 h-5" />
    },
    {
        question: 'How can I track my order?',
        answer: 'Once your order ships, you\'ll receive an email with a tracking number. You can also track your order by going to "My Orders" in your account and clicking on the specific order.',
        category: 'shipping',
        icon: <Package className="w-5 h-5" />
    },
    {
        question: 'What if my order is delayed?',
        answer: 'If your order is delayed, we\'ll notify you via email with updated delivery information. If the delay is significant, you may be eligible for a shipping refund. Contact our customer service for assistance.',
        category: 'shipping',
        icon: <Truck className="w-5 h-5" />
    },
    {
        question: 'Can I change my shipping address after placing an order?',
        answer: 'You can change your shipping address within 1 hour of placing your order by contacting customer service. After that, the order may have already been processed for shipment.',
        category: 'shipping',
        icon: <Package className="w-5 h-5" />
    },

    // Payment
    {
        question: 'What payment methods do you accept?',
        answer: 'We accept:\n• All major credit cards (Visa, Mastercard, American Express, Discover)\n• Debit cards\n• PayPal\n• Apple Pay\n• Google Pay\n• Shop Pay',
        category: 'payment',
        icon: <CreditCard className="w-5 h-5" />
    },
    {
        question: 'Is it safe to use my credit card on SmartShop?',
        answer: 'Yes! We use SSL encryption and are PCI DSS compliant. Your credit card information is encrypted and securely processed. We never store your full card details on our servers.',
        category: 'payment',
        icon: <CreditCard className="w-5 h-5" />
    },
    {
        question: 'Can I use multiple payment methods for one order?',
        answer: 'Currently, we accept one payment method per order. However, you can use gift cards in combination with another payment method if your gift card balance doesn\'t cover the full amount.',
        category: 'payment',
        icon: <CreditCard className="w-5 h-5" />
    },
    {
        question: 'Do you offer installment payment plans?',
        answer: 'Yes! We partner with Klarna and Afterpay to offer flexible installment payment options. You can split your purchase into 4 interest-free payments.',
        category: 'payment',
        icon: <CreditCard className="w-5 h-5" />
    },

    // Returns
    {
        question: 'What is your return policy?',
        answer: 'We offer a 30-day return policy. Items must be unused, unworn, and in original packaging with tags attached. Sale items and personalized products are final sale and cannot be returned.',
        category: 'returns',
        icon: <RotateCcw className="w-5 h-5" />
    },
    {
        question: 'How do I return an item?',
        answer: 'To return an item:\n1. Go to "My Orders" in your account\n2. Select the order and click "Return Items"\n3. Choose the items and reason for return\n4. Print the prepaid return label\n5. Drop off at any shipping location',
        category: 'returns',
        icon: <RotateCcw className="w-5 h-5" />
    },
    {
        question: 'How long does it take to process a return?',
        answer: 'Once we receive your return, it takes 3-5 business days to process. You\'ll receive an email confirmation, and refunds are issued to your original payment method within 5-10 business days.',
        category: 'returns',
        icon: <RotateCcw className="w-5 h-5" />
    },
    {
        question: 'Who pays for return shipping?',
        answer: 'We provide FREE prepaid return labels for all US returns. For international returns, customers are responsible for return shipping costs unless the return is due to our error.',
        category: 'returns',
        icon: <RotateCcw className="w-5 h-5" />
    },
    {
        question: 'Can I exchange an item instead of returning it?',
        answer: 'Yes! You can exchange items for a different size or color. Initiate an exchange through your account, and we\'ll send the replacement item as soon as we receive the original.',
        category: 'returns',
        icon: <RotateCcw className="w-5 h-5" />
    },

    // Account
    {
        question: 'How do I reset my password?',
        answer: 'Click "Sign In", then select "Forgot Password?". Enter your email address, and we\'ll send you a secure link to reset your password. The link expires after 24 hours.',
        category: 'account',
        icon: <User className="w-5 h-5" />
    },
    {
        question: 'Can I have multiple shipping addresses saved?',
        answer: 'Yes! You can save multiple shipping addresses in your account. Go to "Profile" > "Addresses" to add, edit, or delete addresses. You can select any saved address during checkout.',
        category: 'account',
        icon: <User className="w-5 h-5" />
    },
    {
        question: 'What is the Bonus Points program?',
        answer: 'Our Bonus Points program rewards you for every purchase. Earn 1 point per $1 spent. Points can be redeemed for discounts on future orders. You also earn points for reviews, referrals, and social shares!',
        category: 'account',
        icon: <User className="w-5 h-5" />
    },

    // Products
    {
        question: 'How do I know what size to order?',
        answer: 'Each product page includes a detailed size guide with measurements. We recommend measuring yourself and comparing to our size chart. If you\'re between sizes, we suggest sizing up.',
        category: 'products',
        icon: <Package className="w-5 h-5" />
    },
    {
        question: 'Are the product colors accurate to the photos?',
        answer: 'We strive for accuracy, but colors may appear slightly different depending on your device settings. If you\'re unsure about a color, feel free to contact our customer service for more details.',
        category: 'products',
        icon: <Package className="w-5 h-5" />
    },
    {
        question: 'What if an item I want is out of stock?',
        answer: 'Click "Notify Me When Available" on the product page and enter your email. We\'ll notify you as soon as the item is back in stock. Popular items restock quickly!',
        category: 'products',
        icon: <Package className="w-5 h-5" />
    },
    {
        question: 'Do you offer price adjustments if an item goes on sale?',
        answer: 'Yes! If an item you purchased goes on sale within 7 days of your purchase, contact customer service with your order number, and we\'ll refund the price difference.',
        category: 'products',
        icon: <ShoppingBag className="w-5 h-5" />
    },
];

const categoryColors: Record<string, string> = {
    general: 'bg-blue-50 text-blue-600 border-blue-200',
    shipping: 'bg-green-50 text-green-600 border-green-200',
    payment: 'bg-purple-50 text-purple-600 border-purple-200',
    returns: 'bg-orange-50 text-orange-600 border-orange-200',
    account: 'bg-pink-50 text-pink-600 border-pink-200',
    products: 'bg-teal-50 text-teal-600 border-teal-200',
};

const categoryLabels: Record<string, string> = {
    general: 'General',
    shipping: 'Shipping',
    payment: 'Payment',
    returns: 'Returns',
    account: 'Account',
    products: 'Products',
};

export const FAQ = () => {
    const [openIndex, setOpenIndex] = useState<number | null>(null);
    const [selectedCategory, setSelectedCategory] = useState<string>('all');

    const filteredFAQs = selectedCategory === 'all' 
        ? faqData 
        : faqData.filter(faq => faq.category === selectedCategory);

    const categories = ['all', ...Array.from(new Set(faqData.map(faq => faq.category)))];

    return (
        <div className="bg-gray-50 min-h-screen py-12 dark:bg-gray-900 transition-colors duration-300">
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="text-center mb-12">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-100 rounded-full mb-6">
                        <HelpCircle className="w-8 h-8 text-indigo-600" />
                    </div>
                    <h1 className="text-4xl md:text-5xl font-black text-gray-900 mb-4 dark:text-white">
                        Frequently Asked Questions
                    </h1>
                    <p className="text-lg text-gray-600 max-w-2xl mx-auto dark:text-gray-400">
                        Find answers to common questions about shopping, shipping, returns, and more.
                    </p>
                </div>

                {/* Category Filter */}
                <div className="flex flex-wrap justify-center gap-2 mb-10">
                    {categories.map((category) => (
                        <button
                            key={category}
                            onClick={() => {
                                setSelectedCategory(category);
                                setOpenIndex(null);
                            }}
                            className={`px-5 py-2.5 rounded-full text-sm font-bold transition-all ${
                                selectedCategory === category
                                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200'
                                    : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50 hover:border-gray-300 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700 dark:hover:bg-gray-700'
                            }`}
                        >
                            {category === 'all' ? 'All Topics' : categoryLabels[category]}
                        </button>
                    ))}
                </div>

                {/* FAQ Accordion */}
                <div className="space-y-4">
                    {filteredFAQs.map((faq, index) => (
                        <div
                            key={index}
                            className="bg-white rounded-2xl border border-gray-200 overflow-hidden dark:bg-gray-800 dark:border-gray-700"
                        >
                            <button
                                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                                className="w-full px-6 py-5 flex items-center justify-between gap-4 text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                            >
                                <div className="flex items-center gap-4 flex-1">
                                    <div className={`p-2.5 rounded-xl ${categoryColors[faq.category]}`}>
                                        {faq.icon}
                                    </div>
                                    <span className="text-base md:text-lg font-bold text-gray-900 dark:text-white">
                                        {faq.question}
                                    </span>
                                </div>
                                <ChevronDown
                                    className={`w-5 h-5 text-gray-400 transition-transform duration-300 ${
                                        openIndex === index ? 'rotate-180 text-indigo-600' : ''
                                    }`}
                                />
                            </button>
                            
                            {openIndex === index && (
                                <div className="px-6 pb-5 pt-0">
                                    <div className="ml-[4.25rem] text-gray-600 leading-relaxed dark:text-gray-300">
                                        {faq.answer.split('\n').map((line, i) => (
                                            <p key={i} className={line.startsWith('•') ? 'ml-4' : 'mb-2'}>
                                                {line.startsWith('•') ? (
                                                    <span className="flex items-start gap-2">
                                                        <span className="text-indigo-600 mt-1">•</span>
                                                        <span>{line.slice(1)}</span>
                                                    </span>
                                                ) : line.includes(':') && !line.includes('?') ? (
                                                    <span className="font-semibold text-gray-900 dark:text-white">{line}</span>
                                                ) : (
                                                    line
                                                )}
                                            </p>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                {/* Still Need Help Section */}
                <div className="mt-16 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-3xl p-8 md:p-12 text-center text-white shadow-xl">
                    <div className="inline-flex items-center justify-center w-14 h-14 bg-white/20 rounded-full mb-6">
                        <Phone className="w-7 h-7" />
                    </div>
                    <h2 className="text-3xl font-bold mb-4">Still Have Questions?</h2>
                    <p className="text-white/90 mb-8 max-w-xl mx-auto">
                        Can't find the answer you're looking for? Our customer support team is here to help.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link
                            to="/contact"
                            className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-indigo-600 rounded-full font-bold hover:bg-gray-100 transition-colors"
                        >
                            Contact Support
                        </Link>
                        <Link
                            to="/page/how-to-order"
                            className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-indigo-600 text-white border-2 border-white/30 rounded-full font-bold hover:bg-indigo-700 transition-colors"
                        >
                            How to Order
                        </Link>
                    </div>
                </div>

                {/* Quick Links */}
                <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Link
                        to="/page/shipping-info"
                        className="p-5 bg-white rounded-xl border border-gray-200 text-center hover:shadow-md hover:border-indigo-200 transition-all dark:bg-gray-800 dark:border-gray-700"
                    >
                        <Truck className="w-6 h-6 text-indigo-600 mx-auto mb-2" />
                        <p className="text-sm font-bold text-gray-900 dark:text-white">Shipping Info</p>
                    </Link>
                    <Link
                        to="/page/returns"
                        className="p-5 bg-white rounded-xl border border-gray-200 text-center hover:shadow-md hover:border-indigo-200 transition-all dark:bg-gray-800 dark:border-gray-700"
                    >
                        <RotateCcw className="w-6 h-6 text-indigo-600 mx-auto mb-2" />
                        <p className="text-sm font-bold text-gray-900 dark:text-white">Returns</p>
                    </Link>
                    <Link
                        to="/page/size-guide"
                        className="p-5 bg-white rounded-xl border border-gray-200 text-center hover:shadow-md hover:border-indigo-200 transition-all dark:bg-gray-800 dark:border-gray-700"
                    >
                        <Package className="w-6 h-6 text-indigo-600 mx-auto mb-2" />
                        <p className="text-sm font-bold text-gray-900 dark:text-white">Size Guide</p>
                    </Link>
                    <Link
                        to="/contact"
                        className="p-5 bg-white rounded-xl border border-gray-200 text-center hover:shadow-md hover:border-indigo-200 transition-all dark:bg-gray-800 dark:border-gray-700"
                    >
                        <Phone className="w-6 h-6 text-indigo-600 mx-auto mb-2" />
                        <p className="text-sm font-bold text-gray-900 dark:text-white">Contact Us</p>
                    </Link>
                </div>
            </div>
        </div>
    );
};
