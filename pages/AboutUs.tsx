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
    Github,
    Linkedin,
    Twitter,
    Mail
} from 'lucide-react';

interface TeamMember {
    name: string;
    role: string;
    color: string;
    initials: string;
}

const teamMembers: TeamMember[] = [
    {
        name: 'Abdul Choudhary',
        role: 'Project Manager',
        color: 'from-blue-500 to-cyan-500',
        initials: 'AC'
    },
    {
        name: 'Aqveena Manoj',
        role: 'Backend Developer',
        color: 'from-purple-500 to-pink-500',
        initials: 'AM'
    },
    {
        name: 'Vrushika Gajjar',
        role: 'Designer',
        color: 'from-orange-500 to-red-500',
        initials: 'VG'
    },
    {
        name: 'Abdul Munshi',
        role: 'Security & Network',
        color: 'from-green-500 to-emerald-500',
        initials: 'AM'
    },
    {
        name: 'Devam Trivedi',
        role: 'Full Stack Developer & DevOps',
        color: 'from-indigo-500 to-purple-500',
        initials: 'DT'
    }
];

const values = [
    {
        icon: <Target className="w-8 h-8" />,
        title: 'Quality First',
        description: 'We curate only the finest products, ensuring every item meets our high standards.',
        color: 'text-blue-600 bg-blue-50'
    },
    {
        icon: <Rocket className="w-8 h-8" />,
        title: 'Fast & Reliable',
        description: 'Lightning-fast shipping and reliable service that you can count on, every time.',
        color: 'text-purple-600 bg-purple-50'
    },
    {
        icon: <Heart className="w-8 h-8" />,
        title: 'Customer Obsessed',
        description: 'Your satisfaction is our priority. We go above and beyond to exceed expectations.',
        color: 'text-pink-600 bg-pink-50'
    },
    {
        icon: <Globe className="w-8 h-8" />,
        title: 'Global Reach',
        description: 'Bringing quality products to customers worldwide, breaking geographical barriers.',
        color: 'text-green-600 bg-green-50'
    },
    {
        icon: <Zap className="w-8 h-8" />,
        title: 'Innovation',
        description: 'Constantly evolving with cutting-edge technology for the best shopping experience.',
        color: 'text-yellow-600 bg-yellow-50'
    },
    {
        icon: <Shield className="w-8 h-8" />,
        title: 'Trust & Security',
        description: 'Your data and transactions are protected with enterprise-grade security.',
        color: 'text-indigo-600 bg-indigo-50'
    }
];

const stats = [
    { number: '10K+', label: 'Happy Customers' },
    { number: '5K+', label: 'Products' },
    { number: '50+', label: 'Countries Served' },
    { number: '24/7', label: 'Customer Support' }
];

export const AboutUs = () => {
    return (
        <div className="bg-white min-h-screen dark:bg-gray-900 transition-colors duration-300">
            
            {/* Hero Section */}
            <div className="relative bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 overflow-hidden">
                <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjEiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-20"></div>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32 relative z-10">
                    <div className="text-center">
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-white/90 text-sm font-bold mb-6 border border-white/20">
                            <Rocket className="w-4 h-4" />
                            Est. January 2026
                        </div>
                        <h1 className="text-5xl md:text-7xl font-black text-white mb-6 leading-tight">
                            About <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-orange-300">SmartShop</span>
                        </h1>
                        <p className="text-xl md:text-2xl text-white/90 max-w-3xl mx-auto leading-relaxed">
                            We're dedicated to providing the best e-commerce experience with high-quality products, 
                            exceptional service, and lightning-fast delivery worldwide.
                        </p>
                    </div>
                </div>
                
                {/* Wave Divider */}
                <div className="absolute bottom-0 left-0 right-0">
                    <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto">
                        <path d="M0 120L60 110C120 100 240 80 360 70C480 60 600 60 720 65C840 70 960 80 1080 85C1200 90 1320 90 1380 90L1440 90V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" fill="currentColor" className="text-white dark:text-gray-900"/>
                    </svg>
                </div>
            </div>

            {/* Stats Section */}
            <div className="py-12 bg-white dark:bg-gray-900">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                        {stats.map((stat, index) => (
                            <div key={index} className="text-center">
                                <div className="text-4xl md:text-5xl font-black text-indigo-600 mb-2">
                                    {stat.number}
                                </div>
                                <div className="text-sm md:text-base font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    {stat.label}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Mission & Story Section */}
            <div className="py-20 bg-gray-50 dark:bg-gray-800">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid md:grid-cols-2 gap-12 items-center">
                        <div>
                            <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-full text-indigo-600 dark:text-indigo-400 text-sm font-bold mb-6">
                                <Heart className="w-4 h-4" />
                                Our Story
                            </div>
                            <h2 className="text-4xl font-black text-gray-900 dark:text-white mb-6">
                                Born from a Vision
                            </h2>
                            <p className="text-lg text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">
                                SmartShop started in <strong className="text-indigo-600 dark:text-indigo-400">January 2026</strong> by team <strong className="text-indigo-600 dark:text-indigo-400">SmartTech</strong> from class <strong className="text-indigo-600 dark:text-indigo-400">IT 495</strong>. What began as a university project has grown into a passion-driven e-commerce platform.
                            </p>
                            <p className="text-lg text-gray-600 dark:text-gray-300 mb-8 leading-relaxed">
                                Our mission is to bring high-quality products to customers worldwide with exceptional service and speed. We believe shopping should be enjoyable, convenient, and accessible to everyone.
                            </p>
                            
                            <div className="flex flex-wrap gap-4">
                                <div className="flex items-center gap-3 px-5 py-3 bg-white dark:bg-gray-700 rounded-xl shadow-sm border border-gray-100 dark:border-gray-600">
                                    <Users className="w-5 h-5 text-indigo-600" />
                                    <span className="font-bold text-gray-900 dark:text-white">Customer First</span>
                                </div>
                                <div className="flex items-center gap-3 px-5 py-3 bg-white dark:bg-gray-700 rounded-xl shadow-sm border border-gray-100 dark:border-gray-600">
                                    <Award className="w-5 h-5 text-indigo-600" />
                                    <span className="font-bold text-gray-900 dark:text-white">Quality Assured</span>
                                </div>
                            </div>
                        </div>
                        
                        <div className="relative">
                            <div className="aspect-square bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900/30 dark:to-purple-900/30 rounded-3xl overflow-hidden flex items-center justify-center">
                                <div className="text-center p-8">
                                    <Rocket className="w-24 h-24 text-indigo-600 mx-auto mb-6" />
                                    <p className="text-2xl font-bold text-gray-700 dark:text-gray-300">
                                        Building the Future of E-Commerce
                                    </p>
                                    <p className="text-gray-500 dark:text-gray-400 mt-2">
                                        One happy customer at a time
                                    </p>
                                </div>
                            </div>
                            {/* Decorative Elements */}
                            <div className="absolute -top-6 -right-6 w-24 h-24 bg-yellow-400 rounded-2xl opacity-20"></div>
                            <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-purple-400 rounded-full opacity-20"></div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Values Section */}
            <div className="py-20 bg-white dark:bg-gray-900">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-full text-indigo-600 dark:text-indigo-400 text-sm font-bold mb-6">
                            <Target className="w-4 h-4" />
                            Our Values
                        </div>
                        <h2 className="text-4xl font-black text-gray-900 dark:text-white mb-4">
                            What Drives Us
                        </h2>
                        <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                            These core values guide everything we do
                        </p>
                    </div>
                    
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {values.map((value, index) => (
                            <div 
                                key={index}
                                className="group p-8 rounded-3xl border border-gray-100 dark:border-gray-700 hover:shadow-xl hover:shadow-gray-200/50 dark:hover:shadow-none hover:-translate-y-1 transition-all duration-300 bg-white dark:bg-gray-800"
                            >
                                <div className={`w-16 h-16 ${value.color} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                                    {value.icon}
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                                    {value.title}
                                </h3>
                                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                                    {value.description}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Team Section */}
            <div className="py-20 bg-gradient-to-b from-gray-50 to-white dark:from-gray-800 dark:to-gray-900">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-full text-indigo-600 dark:text-indigo-400 text-sm font-bold mb-6">
                            <Users className="w-4 h-4" />
                            Our Team
                        </div>
                        <h2 className="text-4xl font-black text-gray-900 dark:text-white mb-4">
                            Meet Team SmartTech
                        </h2>
                        <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                            Passionate developers and designers working together to build next-generation shopping platforms
                        </p>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
                        {teamMembers.map((member, index) => (
                            <div 
                                key={index}
                                className="group bg-white dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-gray-700 overflow-hidden hover:shadow-2xl hover:shadow-indigo-200/50 dark:hover:shadow-none transition-all duration-300 hover:-translate-y-2"
                            >
                                {/* Photo Placeholder */}
                                <div className="aspect-square bg-gradient-to-br relative overflow-hidden">
                                    <div className={`absolute inset-0 bg-gradient-to-br ${member.color} opacity-90`}></div>
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <div className="w-24 h-24 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                                            <span className="text-3xl font-black text-white">
                                                {member.initials}
                                            </span>
                                        </div>
                                    </div>
                                    {/* Social Links Overlay */}
                                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-3">
                                        <a href="#" className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/40 transition-colors">
                                            <Linkedin className="w-5 h-5 text-white" />
                                        </a>
                                        <a href="#" className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/40 transition-colors">
                                            <Github className="w-5 h-5 text-white" />
                                        </a>
                                        <a href="#" className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/40 transition-colors">
                                            <Twitter className="w-5 h-5 text-white" />
                                        </a>
                                    </div>
                                </div>
                                
                                {/* Info */}
                                <div className="p-6 text-center">
                                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">
                                        {member.name}
                                    </h3>
                                    <p className="text-sm font-bold text-indigo-600 dark:text-indigo-400">
                                        {member.role}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* CTA Section */}
            <div className="py-20 bg-white dark:bg-gray-900">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 rounded-3xl p-12 shadow-2xl">
                        <h2 className="text-3xl md:text-4xl font-black text-white mb-4">
                            Ready to Experience SmartShop?
                        </h2>
                        <p className="text-xl text-white/90 mb-8">
                            Join thousands of happy customers shopping with confidence
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Link
                                to="/products"
                                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-indigo-600 rounded-full font-bold text-lg hover:bg-gray-100 transition-colors shadow-lg"
                            >
                                Start Shopping
                            </Link>
                            <Link
                                to="/contact"
                                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-indigo-600 text-white border-2 border-white/30 rounded-full font-bold text-lg hover:bg-indigo-700 transition-colors"
                            >
                                Contact Us
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
