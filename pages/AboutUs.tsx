import React from 'react';
import { Link } from 'react-router-dom';
import { 
    Target, 
    Rocket, 
    Heart, 
    Users, 
    Award, 
    Globe, 
    Zap, 
    Shield,
    Linkedin,
    Github,
    Twitter
} from 'lucide-react';

interface TeamMember {
    name: string;
    role: string;
    roleSecondary: string;
    color: string;
    initials: string;
}

const teamMembers: TeamMember[] = [
    {
        name: 'Abdul Choudhary',
        role: 'Project Manager',
        roleSecondary: 'Quality Assurance',
        color: 'from-blue-600 to-blue-800',
        initials: 'AC'
    },
    {
        name: 'Aqveena Manoj',
        role: 'Backend Developer',
        roleSecondary: '',
        color: 'from-purple-600 to-purple-800',
        initials: 'AM'
    },
    {
        name: 'Vrushika Gajjar',
        role: 'Frontend Developer',
        roleSecondary: 'Designer',
        color: 'from-pink-600 to-pink-800',
        initials: 'VG'
    },
    {
        name: 'Abdul Munshi',
        role: 'Security & Network',
        roleSecondary: '',
        color: 'from-emerald-600 to-emerald-800',
        initials: 'AM'
    },
    {
        name: 'Devam Trivedi',
        role: 'Full Stack Developer',
        roleSecondary: 'DevOps',
        color: 'from-indigo-600 to-indigo-800',
        initials: 'DT'
    }
];

const values = [
    {
        icon: <Target className="w-6 h-6" />,
        title: 'Quality First',
        description: 'We curate only the finest products, ensuring every item meets our high standards.',
        color: 'bg-blue-600'
    },
    {
        icon: <Rocket className="w-6 h-6" />,
        title: 'Fast & Reliable',
        description: 'Lightning-fast shipping and reliable service that you can count on.',
        color: 'bg-purple-600'
    },
    {
        icon: <Heart className="w-6 h-6" />,
        title: 'Customer Obsessed',
        description: 'Your satisfaction is our priority. We go above and beyond.',
        color: 'bg-pink-600'
    },
    {
        icon: <Globe className="w-6 h-6" />,
        title: 'Global Reach',
        description: 'Bringing quality products to customers worldwide.',
        color: 'bg-emerald-600'
    },
    {
        icon: <Zap className="w-6 h-6" />,
        title: 'Innovation',
        description: 'Constantly evolving with cutting-edge technology.',
        color: 'bg-amber-600'
    },
    {
        icon: <Shield className="w-6 h-6" />,
        title: 'Trust & Security',
        description: 'Your data protected with enterprise-grade security.',
        color: 'bg-indigo-600'
    }
];

export const AboutUs = () => {
    return (
        <div className="bg-white min-h-screen dark:bg-gray-900 transition-colors duration-300">
            
            {/* Hero Section */}
            <div className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20">
                    <div className="text-center">
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/10 backdrop-blur-sm rounded-full text-white/90 text-xs font-bold mb-4 border border-white/20">
                            <Rocket className="w-3.5 h-3.5" />
                            Est. January 2026
                        </div>
                        <h1 className="text-4xl md:text-6xl font-black text-white mb-4">
                            About SmartShop
                        </h1>
                        <p className="text-base md:text-lg text-gray-300 max-w-2xl mx-auto leading-relaxed">
                            We're dedicated to providing the best e-commerce experience with high-quality products, 
                            exceptional service, and lightning-fast delivery worldwide.
                        </p>
                    </div>
                </div>
            </div>

            {/* Stats Section */}
            <div className="py-8 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        {stats.map((stat, index) => (
                            <div key={index} className="text-center">
                                <div className="text-3xl md:text-4xl font-black text-gray-900 dark:text-white mb-1">
                                    {stat.number}
                                </div>
                                <div className="text-xs md:text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                                    {stat.label}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Mission & Story Section */}
            <div className="py-12 bg-white dark:bg-gray-900">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid md:grid-cols-2 gap-10 items-center">
                        <div>
                            <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-50 dark:bg-indigo-900/30 rounded-full text-indigo-700 dark:text-indigo-400 text-xs font-bold mb-4">
                                <Heart className="w-3.5 h-3.5" />
                                Our Story
                            </div>
                            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                                Born from a Vision
                            </h2>
                            <p className="text-gray-600 dark:text-gray-300 mb-4 leading-relaxed">
                                SmartShop started in <strong className="text-gray-900 dark:text-white">January 2026</strong> by team <strong className="text-gray-900 dark:text-white">SmartTech</strong> from class <strong className="text-gray-900 dark:text-white">IT 495</strong>. What began as a university project has grown into a passion-driven e-commerce platform.
                            </p>
                            <p className="text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">
                                Our mission is to bring high-quality products to customers worldwide with exceptional service and speed. We believe shopping should be enjoyable, convenient, and accessible to everyone.
                            </p>
                            
                            <div className="flex flex-wrap gap-3">
                                <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                                    <Users className="w-4 h-4 text-indigo-600" />
                                    <span className="text-sm font-semibold text-gray-900 dark:text-white">Customer First</span>
                                </div>
                                <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                                    <Award className="w-4 h-4 text-indigo-600" />
                                    <span className="text-sm font-semibold text-gray-900 dark:text-white">Quality Assured</span>
                                </div>
                            </div>
                        </div>
                        
                        <div className="relative">
                            <div className="aspect-video bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-2xl overflow-hidden flex items-center justify-center border border-gray-200 dark:border-gray-700">
                                <div className="text-center p-6">
                                    <Rocket className="w-16 h-16 text-indigo-600 mx-auto mb-4" />
                                    <p className="text-lg font-bold text-gray-900 dark:text-white">
                                        Building the Future
                                    </p>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                        of E-Commerce
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Values Section */}
            <div className="py-12 bg-gray-50 dark:bg-gray-800">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-10">
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-50 dark:bg-indigo-900/30 rounded-full text-indigo-700 dark:text-indigo-400 text-xs font-bold mb-4">
                            <Target className="w-3.5 h-3.5" />
                            Our Values
                        </div>
                        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">
                            What Drives Us
                        </h2>
                        <p className="text-gray-600 dark:text-gray-400 max-w-xl mx-auto">
                            These core values guide everything we do
                        </p>
                    </div>
                    
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
                        {values.map((value, index) => (
                            <div 
                                key={index}
                                className="group p-6 rounded-2xl border border-gray-200 dark:border-gray-700 hover:border-indigo-300 dark:hover:border-indigo-700 hover:shadow-lg transition-all duration-300 bg-white dark:bg-gray-900"
                            >
                                <div className={`w-12 h-12 ${value.color} rounded-xl flex items-center justify-center mb-4 text-white`}>
                                    {value.icon}
                                </div>
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                                    {value.title}
                                </h3>
                                <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                                    {value.description}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Team Section */}
            <div className="py-12 bg-white dark:bg-gray-900">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-10">
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-50 dark:bg-indigo-900/30 rounded-full text-indigo-700 dark:text-indigo-400 text-xs font-bold mb-4">
                            <Users className="w-3.5 h-3.5" />
                            Our Team
                        </div>
                        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">
                            Meet Team SmartTech
                        </h2>
                        <p className="text-gray-600 dark:text-gray-400 max-w-xl mx-auto">
                            Passionate developers and designers working together to build next-generation shopping platforms
                        </p>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-5">
                        {teamMembers.map((member, index) => (
                            <div 
                                key={index}
                                className="group bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden hover:border-indigo-300 dark:hover:border-indigo-700 hover:shadow-xl transition-all duration-300"
                            >
                                {/* Photo Placeholder */}
                                <div className="aspect-square bg-gradient-to-br relative overflow-hidden">
                                    <div className={`absolute inset-0 bg-gradient-to-br ${member.color}`}></div>
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                                            <span className="text-2xl font-black text-white">
                                                {member.initials}
                                            </span>
                                        </div>
                                    </div>
                                    {/* Social Links Overlay */}
                                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-2">
                                        <a href="#" className="w-9 h-9 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/40 transition-colors">
                                            <Linkedin className="w-4 h-4 text-white" />
                                        </a>
                                        <a href="#" className="w-9 h-9 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/40 transition-colors">
                                            <Github className="w-4 h-4 text-white" />
                                        </a>
                                        <a href="#" className="w-9 h-9 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/40 transition-colors">
                                            <Twitter className="w-4 h-4 text-white" />
                                        </a>
                                    </div>
                                </div>
                                
                                {/* Info */}
                                <div className="p-5 text-center">
                                    <h3 className="text-base font-bold text-gray-900 dark:text-white mb-1">
                                        {member.name}
                                    </h3>
                                    <p className="text-sm font-semibold text-indigo-600 dark:text-indigo-400">
                                        {member.role}
                                    </p>
                                    {member.roleSecondary && (
                                        <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mt-1">
                                            {member.roleSecondary}
                                        </p>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* CTA Section */}
            <div className="py-12 bg-gray-50 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-3">
                        Ready to Experience SmartShop?
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400 mb-6">
                        Join thousands of happy customers shopping with confidence
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                        <Link
                            to="/products"
                            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition-colors"
                        >
                            Start Shopping
                        </Link>
                        <Link
                            to="/contact"
                            className="inline-flex items-center justify-center gap-2 px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-semibold hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                        >
                            Contact Us
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

const stats = [
    { number: '10K+', label: 'Happy Customers' },
    { number: '5K+', label: 'Products' },
    { number: '50+', label: 'Countries Served' },
    { number: '24/7', label: 'Customer Support' }
];
