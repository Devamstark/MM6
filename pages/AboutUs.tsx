import React, { useEffect, useRef, useState } from 'react';
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
    ArrowRight,
    Sparkles
} from 'lucide-react';

/* ────────────────── CSS keyframes injected once ────────────────── */
const styleId = 'aboutus-animations';
if (typeof document !== 'undefined' && !document.getElementById(styleId)) {
    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = `
        @keyframes aboutFadeUp {
            from { opacity: 0; transform: translateY(40px); }
            to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes aboutFadeIn {
            from { opacity: 0; }
            to   { opacity: 1; }
        }
        @keyframes aboutScaleIn {
            from { opacity: 0; transform: scale(0.85); }
            to   { opacity: 1; transform: scale(1); }
        }
        @keyframes aboutSlideLeft {
            from { opacity: 0; transform: translateX(-50px); }
            to   { opacity: 1; transform: translateX(0); }
        }
        @keyframes aboutSlideRight {
            from { opacity: 0; transform: translateX(50px); }
            to   { opacity: 1; transform: translateX(0); }
        }
        @keyframes aboutFloat {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-12px); }
        }
        @keyframes aboutPulse {
            0%, 100% { opacity: 0.4; transform: scale(1); }
            50% { opacity: 0.8; transform: scale(1.05); }
        }
        @keyframes aboutGradientShift {
            0% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
        }
        @keyframes aboutCountUp {
            from { opacity: 0; transform: translateY(20px) scale(0.8); }
            to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes aboutSocial {
            from { opacity: 0; transform: translateY(10px) scale(0.7); }
            to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        .about-fade-up { opacity: 0; }
        .about-fade-up.about-visible { animation: aboutFadeUp 0.8s ease-out forwards; }
        .about-scale-in { opacity: 0; }
        .about-scale-in.about-visible { animation: aboutScaleIn 0.7s ease-out forwards; }
        .about-slide-left { opacity: 0; }
        .about-slide-left.about-visible { animation: aboutSlideLeft 0.8s ease-out forwards; }
        .about-slide-right { opacity: 0; }
        .about-slide-right.about-visible { animation: aboutSlideRight 0.8s ease-out forwards; }
        .about-float { animation: aboutFloat 4s ease-in-out infinite; }
        .about-float-delayed { animation: aboutFloat 4s ease-in-out 1s infinite; }
        .about-pulse-bg { animation: aboutPulse 3s ease-in-out infinite; }
        .about-gradient-shift { background-size: 200% 200%; animation: aboutGradientShift 6s ease infinite; }
    `;
    document.head.appendChild(style);
}

/* ────────────────── Intersection Observer Hook ────────────────── */
function useScrollAnimation() {
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const el = ref.current;
        if (!el) return;

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('about-visible');
                    }
                });
            },
            { threshold: 0.15, rootMargin: '0px 0px -40px 0px' }
        );

        // Observe the container and all children with animation classes
        const animatedEls = el.querySelectorAll('.about-fade-up, .about-scale-in, .about-slide-left, .about-slide-right');
        animatedEls.forEach(child => observer.observe(child));

        return () => observer.disconnect();
    }, []);

    return ref;
}

/* ────────────────── Data ────────────────── */

interface TeamMember {
    name: string;
    role: string;
    roleSecondary: string;
    color: string;
    initials: string;
    linkedin?: string;
    github?: string;
}

const teamMembers: TeamMember[] = [
    {
        name: 'Abdul Choudhary',
        role: 'Project Manager',
        roleSecondary: 'Quality Assurance',
        color: 'from-blue-500 via-blue-600 to-indigo-700',
        initials: 'AC',
        linkedin: 'https://linkedin.com/in/',
        github: 'https://github.com/achoudhury28',
    },
    {
        name: 'Aqveena Manoj',
        role: 'Backend Developer',
        roleSecondary: '',
        color: 'from-violet-500 via-purple-600 to-fuchsia-700',
        initials: 'AM',
        linkedin: 'https://linkedin.com/in/',
        github: 'https://github.com/',
    },
    {
        name: 'Vrushika Gajjar',
        role: 'Frontend Developer',
        roleSecondary: 'Designer',
        color: 'from-pink-500 via-rose-500 to-red-600',
        initials: 'VG',
        linkedin: 'https://linkedin.com/in/',
        github: 'https://github.com/Helly1529',
    },
    {
        name: 'Abdul Munshi',
        role: 'Security & Network',
        roleSecondary: '',
        color: 'from-emerald-500 via-teal-600 to-cyan-700',
        initials: 'AM',
        linkedin: 'https://linkedin.com/in/',
        github: 'https://github.com/Masjud2001',
    },
    {
        name: 'Devam Trivedi',
        role: 'Full Stack Developer',
        roleSecondary: 'DevOps',
        color: 'from-indigo-500 via-blue-600 to-violet-700',
        initials: 'DT',
        linkedin: 'https://linkedin.com/in/devamtrivedi',
        github: 'https://github.com/Devamstark',
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

const stats = [
    { number: '10K+', label: 'Happy Customers' },
    { number: '5K+', label: 'Products' },
    { number: '50+', label: 'Countries Served' },
    { number: '24/7', label: 'Customer Support' }
];

/* ────────────────── Component ────────────────── */

export const AboutUs = () => {
    const animRef = useScrollAnimation();
    const [hoveredCard, setHoveredCard] = useState<number | null>(null);

    return (
        <div ref={animRef} className="bg-white min-h-screen dark:bg-gray-950 transition-colors duration-300" style={{ fontFamily: 'Inter, sans-serif' }}>

            {/* ─── Hero Section with animated gradient ─── */}
            <div className="relative overflow-hidden">
                {/* Animated background blobs */}
                <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-indigo-950 to-gray-900 about-gradient-shift" />
                <div className="absolute top-10 left-10 w-72 h-72 bg-indigo-600/20 rounded-full blur-3xl about-pulse-bg" />
                <div className="absolute bottom-10 right-10 w-96 h-96 bg-purple-600/15 rounded-full blur-3xl about-float-delayed" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-3xl about-pulse-bg" />

                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28">
                    <div className="text-center">
                        <div
                            className="inline-flex items-center gap-2 px-5 py-2 bg-white/10 backdrop-blur-md rounded-full text-white/90 text-xs font-bold mb-6 border border-white/20"
                            style={{ animation: 'aboutFadeIn 0.8s ease-out forwards' }}
                        >
                            <Sparkles className="w-3.5 h-3.5" />
                            Est. January 2026
                        </div>
                        <h1
                            className="text-4xl md:text-6xl lg:text-7xl font-black text-white mb-5 tracking-tight"
                            style={{ animation: 'aboutFadeUp 0.8s ease-out 0.2s both' }}
                        >
                            About <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">SmartShop</span>
                        </h1>
                        <p
                            className="text-base md:text-lg text-gray-300 max-w-2xl mx-auto leading-relaxed"
                            style={{ animation: 'aboutFadeUp 0.8s ease-out 0.4s both' }}
                        >
                            We're dedicated to providing the best e-commerce experience with high-quality products,
                            exceptional service, and lightning-fast delivery worldwide.
                        </p>
                        <div
                            className="mt-8 flex justify-center gap-4"
                            style={{ animation: 'aboutFadeUp 0.8s ease-out 0.6s both' }}
                        >
                            <Link to="/products" className="inline-flex items-center gap-2 px-6 py-3 bg-white text-gray-900 rounded-xl font-bold text-sm hover:bg-gray-100 transition-all shadow-xl shadow-white/10 hover:shadow-white/20 hover:-translate-y-0.5">
                                Explore Products <ArrowRight className="w-4 h-4" />
                            </Link>
                            <Link to="/contact" className="inline-flex items-center gap-2 px-6 py-3 border border-white/30 text-white rounded-xl font-bold text-sm hover:bg-white/10 backdrop-blur-sm transition-all hover:-translate-y-0.5">
                                Get in Touch
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            {/* ─── Stats Section with count-up animation ─── */}
            <div className="py-10 bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        {stats.map((stat, index) => (
                            <div
                                key={index}
                                className="about-fade-up text-center group cursor-default"
                                style={{ animationDelay: `${index * 0.15}s` }}
                            >
                                <div className="text-3xl md:text-4xl font-black text-gray-900 dark:text-white mb-1 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors duration-300">
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

            {/* ─── Mission & Story (slide in) ─── */}
            <div className="py-16 bg-white dark:bg-gray-950">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid md:grid-cols-2 gap-12 items-center">
                        <div className="about-slide-left">
                            <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-50 dark:bg-indigo-900/30 rounded-full text-indigo-700 dark:text-indigo-400 text-xs font-bold mb-4">
                                <Heart className="w-3.5 h-3.5" />
                                Our Story
                            </div>
                            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-5 tracking-tight">
                                Born from a <span className="text-indigo-600 dark:text-indigo-400">Vision</span>
                            </h2>
                            <p className="text-gray-600 dark:text-gray-300 mb-4 leading-relaxed text-base">
                                SmartShop started in <strong className="text-gray-900 dark:text-white">January 2026</strong> by team <strong className="text-gray-900 dark:text-white">SmartTech</strong> from class <strong className="text-gray-900 dark:text-white">IT 495</strong>. What began as a university project has grown into a passion-driven e-commerce platform.
                            </p>
                            <p className="text-gray-600 dark:text-gray-300 mb-6 leading-relaxed text-base">
                                Our mission is to bring high-quality products to customers worldwide with exceptional service and speed. We believe shopping should be enjoyable, convenient, and accessible to everyone.
                            </p>

                            <div className="flex flex-wrap gap-3">
                                <div className="flex items-center gap-2 px-4 py-2.5 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-indigo-300 dark:hover:border-indigo-600 transition-colors duration-300">
                                    <Users className="w-4 h-4 text-indigo-600" />
                                    <span className="text-sm font-semibold text-gray-900 dark:text-white">Customer First</span>
                                </div>
                                <div className="flex items-center gap-2 px-4 py-2.5 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-indigo-300 dark:hover:border-indigo-600 transition-colors duration-300">
                                    <Award className="w-4 h-4 text-indigo-600" />
                                    <span className="text-sm font-semibold text-gray-900 dark:text-white">Quality Assured</span>
                                </div>
                                <div className="flex items-center gap-2 px-4 py-2.5 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-indigo-300 dark:hover:border-indigo-600 transition-colors duration-300">
                                    <Globe className="w-4 h-4 text-indigo-600" />
                                    <span className="text-sm font-semibold text-gray-900 dark:text-white">Global Reach</span>
                                </div>
                            </div>
                        </div>

                        <div className="about-slide-right relative">
                            <div className="aspect-video bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 dark:from-indigo-900/20 dark:via-purple-900/20 dark:to-pink-900/20 rounded-3xl overflow-hidden flex items-center justify-center border border-gray-200 dark:border-gray-700 relative group hover:shadow-2xl hover:shadow-indigo-200/20 transition-all duration-500">
                                {/* Floating decorative elements */}
                                <div className="absolute top-6 right-8 w-12 h-12 bg-indigo-200/50 dark:bg-indigo-800/30 rounded-xl about-float rotate-12" />
                                <div className="absolute bottom-8 left-6 w-8 h-8 bg-purple-200/50 dark:bg-purple-800/30 rounded-lg about-float-delayed -rotate-12" />
                                <div className="absolute top-1/4 left-1/4 w-6 h-6 bg-pink-200/50 dark:bg-pink-800/30 rounded-full about-float" />

                                <div className="text-center p-6 relative z-10">
                                    <div className="w-20 h-20 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xl shadow-indigo-200 dark:shadow-indigo-900/40 group-hover:scale-110 transition-transform duration-500 about-float">
                                        <Rocket className="w-9 h-9 text-white" />
                                    </div>
                                    <p className="text-xl font-bold text-gray-900 dark:text-white">
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

            {/* ─── Values Section (staggered card entrance) ─── */}
            <div className="py-16 bg-gray-50 dark:bg-gray-900">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12 about-fade-up">
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-50 dark:bg-indigo-900/30 rounded-full text-indigo-700 dark:text-indigo-400 text-xs font-bold mb-4">
                            <Target className="w-3.5 h-3.5" />
                            Our Values
                        </div>
                        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-3 tracking-tight">
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
                                className="about-scale-in group p-7 rounded-2xl border border-gray-200 dark:border-gray-700 hover:border-indigo-300 dark:hover:border-indigo-700 hover:shadow-xl transition-all duration-500 bg-white dark:bg-gray-800 cursor-default hover:-translate-y-1"
                                style={{ animationDelay: `${index * 0.1}s` }}
                            >
                                <div className={`w-12 h-12 ${value.color} rounded-xl flex items-center justify-center mb-4 text-white shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-300`}>
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

            {/* ─── Team Section (cards with social reveal) ─── */}
            <div className="py-16 bg-white dark:bg-gray-950">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12 about-fade-up">
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-50 dark:bg-indigo-900/30 rounded-full text-indigo-700 dark:text-indigo-400 text-xs font-bold mb-4">
                            <Users className="w-3.5 h-3.5" />
                            Our Team
                        </div>
                        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-3 tracking-tight">
                            Meet Team <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">SmartTech</span>
                        </h2>
                        <p className="text-gray-600 dark:text-gray-400 max-w-xl mx-auto">
                            Passionate developers and designers working together to build next-generation shopping platforms
                        </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
                        {teamMembers.map((member, index) => (
                            <div
                                key={index}
                                className="about-scale-in group cursor-default"
                                style={{ animationDelay: `${index * 0.12}s` }}
                                onMouseEnter={() => setHoveredCard(index)}
                                onMouseLeave={() => setHoveredCard(null)}
                            >
                                <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden hover:border-indigo-300 dark:hover:border-indigo-600 hover:shadow-2xl hover:shadow-indigo-100/50 dark:hover:shadow-indigo-900/30 transition-all duration-500 hover:-translate-y-2">
                                    {/* Photo / Initials Area */}
                                    <div className="aspect-square relative overflow-hidden">
                                        <div className={`absolute inset-0 bg-gradient-to-br ${member.color} about-gradient-shift`} />

                                        {/* Decorative floating shapes */}
                                        <div className="absolute top-4 right-4 w-8 h-8 bg-white/10 rounded-lg about-float rotate-45" />
                                        <div className="absolute bottom-6 left-4 w-5 h-5 bg-white/10 rounded-full about-float-delayed" />
                                        <div className="absolute top-1/3 left-6 w-3 h-3 bg-white/15 rounded-full about-float" />

                                        {/* Initials */}
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center border-2 border-white/30 group-hover:scale-110 group-hover:bg-white/30 transition-all duration-500">
                                                <span className="text-2xl font-black text-white drop-shadow-lg">
                                                    {member.initials}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Social Links Overlay — slides up on hover */}
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500 flex items-end justify-center pb-6">
                                            <div className="flex gap-3">
                                                {member.linkedin && (
                                                    <a
                                                        href={member.linkedin}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center hover:bg-[#0077B5] transition-all duration-300 border border-white/20 hover:border-[#0077B5] hover:scale-110 hover:shadow-lg hover:shadow-blue-500/30"
                                                        style={{ animation: hoveredCard === index ? 'aboutSocial 0.4s ease-out 0.1s both' : 'none' }}
                                                        title={`${member.name} on LinkedIn`}
                                                    >
                                                        <Linkedin className="w-4.5 h-4.5 text-white" />
                                                    </a>
                                                )}
                                                {member.github && (
                                                    <a
                                                        href={member.github}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center hover:bg-[#333] transition-all duration-300 border border-white/20 hover:border-[#333] hover:scale-110 hover:shadow-lg hover:shadow-gray-500/30"
                                                        style={{ animation: hoveredCard === index ? 'aboutSocial 0.4s ease-out 0.2s both' : 'none' }}
                                                        title={`${member.name} on GitHub`}
                                                    >
                                                        <Github className="w-4.5 h-4.5 text-white" />
                                                    </a>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Info */}
                                    <div className="p-5 text-center">
                                        <h3 className="text-base font-bold text-gray-900 dark:text-white mb-1 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors duration-300">
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

                                        {/* Social icons below name — always visible on mobile */}
                                        <div className="flex justify-center gap-2 mt-3 lg:hidden">
                                            {member.linkedin && (
                                                <a href={member.linkedin} target="_blank" rel="noopener noreferrer" className="w-8 h-8 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center hover:bg-[#0077B5] hover:text-white text-gray-500 dark:text-gray-400 transition-all duration-300" title="LinkedIn">
                                                    <Linkedin className="w-3.5 h-3.5" />
                                                </a>
                                            )}
                                            {member.github && (
                                                <a href={member.github} target="_blank" rel="noopener noreferrer" className="w-8 h-8 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center hover:bg-[#333] hover:text-white text-gray-500 dark:text-gray-400 transition-all duration-300" title="GitHub">
                                                    <Github className="w-3.5 h-3.5" />
                                                </a>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* ─── CTA Section ─── */}
            <div className="py-16 bg-gradient-to-br from-gray-50 via-indigo-50/30 to-gray-50 dark:from-gray-900 dark:via-indigo-950/20 dark:to-gray-900 border-t border-gray-200 dark:border-gray-800">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center about-fade-up">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-indigo-100 dark:bg-indigo-900/30 rounded-full text-indigo-700 dark:text-indigo-400 text-xs font-bold mb-4">
                        <Sparkles className="w-3.5 h-3.5" />
                        Join Us
                    </div>
                    <h2 className="text-2xl md:text-4xl font-bold text-gray-900 dark:text-white mb-3 tracking-tight">
                        Ready to Experience SmartShop?
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400 mb-8 text-base">
                        Join thousands of happy customers shopping with confidence
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                        <Link
                            to="/products"
                            className="inline-flex items-center justify-center gap-2 px-7 py-3.5 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-xl font-bold text-sm hover:bg-gray-800 dark:hover:bg-gray-100 transition-all shadow-xl shadow-gray-300/30 dark:shadow-none hover:-translate-y-0.5"
                        >
                            Start Shopping <ArrowRight className="w-4 h-4" />
                        </Link>
                        <Link
                            to="/contact"
                            className="inline-flex items-center justify-center gap-2 px-7 py-3.5 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl font-bold text-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition-all hover:-translate-y-0.5"
                        >
                            Contact Us
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};
