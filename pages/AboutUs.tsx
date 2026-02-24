import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, useInView } from 'framer-motion';
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
    Sparkles,
    ExternalLink
} from 'lucide-react';

/* ────────────────── Framer Motion Variants ────────────────── */

const cubicEase: [number, number, number, number] = [0.22, 1, 0.36, 1];

const fadeUp = {
    hidden: { opacity: 0, y: 40 },
    visible: (i: number = 0) => ({
        opacity: 1, y: 0,
        transition: { duration: 0.6, ease: cubicEase, delay: i * 0.1 }
    })
};

const fadeIn = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.6 } }
};

const scaleIn = {
    hidden: { opacity: 0, scale: 0.85 },
    visible: (i: number = 0) => ({
        opacity: 1, scale: 1,
        transition: { duration: 0.5, ease: cubicEase, delay: i * 0.1 }
    })
};

const slideLeft = {
    hidden: { opacity: 0, x: -60 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.7, ease: cubicEase } }
};

const slideRight = {
    hidden: { opacity: 0, x: 60 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.7, ease: cubicEase } }
};

const staggerContainer = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.12 } }
};

/* ────────────────── Animated Section Wrapper ────────────────── */
function AnimatedSection({ children, className = '' }: { children: React.ReactNode; className?: string }) {
    const ref = React.useRef(null);
    const isInView = useInView(ref, { once: true, margin: '-60px' });
    return (
        <motion.div
            ref={ref}
            initial="hidden"
            animate={isInView ? 'visible' : 'hidden'}
            className={className}
        >
            {children}
        </motion.div>
    );
}

/* ────────────────── 3D Tilt Card Component ────────────────── */
function TiltCard({ children, className = '' }: { children: React.ReactNode; className?: string }) {
    const [rotateX, setRotateX] = useState(0);
    const [rotateY, setRotateY] = useState(0);
    const [glowX, setGlowX] = useState(50);
    const [glowY, setGlowY] = useState(50);

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        setRotateX((y - centerY) / 12);
        setRotateY((centerX - x) / 12);
        setGlowX((x / rect.width) * 100);
        setGlowY((y / rect.height) * 100);
    };

    const handleMouseLeave = () => {
        setRotateX(0);
        setRotateY(0);
        setGlowX(50);
        setGlowY(50);
    };

    return (
        <div
            className={className}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            style={{
                transform: `perspective(800px) rotateX(${-rotateX}deg) rotateY(${rotateY}deg)`,
                transition: 'transform 0.15s ease-out',
            }}
        >
            {/* Glow effect */}
            <div
                className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-20"
                style={{
                    background: `radial-gradient(circle at ${glowX}% ${glowY}%, rgba(99,102,241,0.15), transparent 60%)`,
                }}
            />
            {children}
        </div>
    );
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
        roleSecondary: 'Quality Assurance & System Architect',
        color: 'from-blue-500 via-blue-600 to-indigo-700',
        initials: 'AC',
        linkedin: 'https://linkedin.com/in/',
        github: 'https://github.com/achoudhury28',
    },
    {
        name: 'Aqveena Manoj',
        role: 'Backend Developer',
        roleSecondary: 'API & Database',
        color: 'from-violet-500 via-purple-600 to-fuchsia-700',
        initials: 'AM',
        linkedin: 'https://linkedin.com/in/',
        github: 'https://github.com/aquveena',
    },
    {
        name: 'Vrushika Gajjar',
        role: 'Frontend Developer',
        roleSecondary: 'UI/UX Designer',
        color: 'from-pink-500 via-rose-500 to-red-600',
        initials: 'VG',
        linkedin: 'https://linkedin.com/in/',
        github: 'https://github.com/Helly1529',
    },
    {
        name: 'Abdul Munshi',
        role: 'Security & Network',
        roleSecondary: 'Cybersecurity & Cloud Security',
        color: 'from-emerald-500 via-teal-600 to-cyan-700',
        initials: 'AM',
        linkedin: 'https://linkedin.com/in/',
        github: 'https://github.com/Masjud2001',
    },
    {
        name: 'Devam Trivedi',
        role: 'Full Stack Developer',
        roleSecondary: 'DevOps & Cloud Engineering',
        color: 'from-indigo-500 via-blue-600 to-violet-700',
        initials: 'DT',
        linkedin: 'https://linkedin.com/in/devamtrivedi',
        github: 'https://github.com/Devamstark',
    }
];

const values = [
    { icon: <Target className="w-6 h-6" />, title: 'Quality First', description: 'We curate only the finest products, ensuring every item meets our high standards.', color: 'bg-blue-600' },
    { icon: <Rocket className="w-6 h-6" />, title: 'Fast & Reliable', description: 'Lightning-fast shipping and reliable service that you can count on.', color: 'bg-purple-600' },
    { icon: <Heart className="w-6 h-6" />, title: 'Customer Obsessed', description: 'Your satisfaction is our priority. We go above and beyond.', color: 'bg-pink-600' },
    { icon: <Globe className="w-6 h-6" />, title: 'Global Reach', description: 'Bringing quality products to customers worldwide.', color: 'bg-emerald-600' },
    { icon: <Zap className="w-6 h-6" />, title: 'Innovation', description: 'Constantly evolving with cutting-edge technology.', color: 'bg-amber-600' },
    { icon: <Shield className="w-6 h-6" />, title: 'Trust & Security', description: 'Your data protected with enterprise-grade security.', color: 'bg-indigo-600' }
];

const stats = [
    { number: '10K+', label: 'Happy Customers' },
    { number: '5K+', label: 'Products' },
    { number: '50+', label: 'Countries Served' },
    { number: '24/7', label: 'Customer Support' }
];

/* ────────────────── Component ────────────────── */

export const AboutUs = () => {
    return (
        <div className="bg-white min-h-screen dark:bg-gray-950 transition-colors duration-300" style={{ fontFamily: 'Inter, sans-serif' }}>

            {/* ─── Hero Section ─── */}
            <div className="relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-indigo-950 to-gray-900" />
                <motion.div
                    className="absolute top-10 left-10 w-72 h-72 bg-indigo-600/20 rounded-full blur-3xl"
                    animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.6, 0.3] }}
                    transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                />
                <motion.div
                    className="absolute bottom-10 right-10 w-96 h-96 bg-purple-600/15 rounded-full blur-3xl"
                    animate={{ y: [0, -20, 0], opacity: [0.2, 0.5, 0.2] }}
                    transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
                />

                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28">
                    <div className="text-center">
                        <motion.div
                            className="inline-flex items-center gap-2 px-5 py-2 bg-white/10 backdrop-blur-md rounded-full text-white/90 text-xs font-bold mb-6 border border-white/20"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6 }}
                        >
                            <Sparkles className="w-3.5 h-3.5" />
                            Est. January 2026
                        </motion.div>
                        <motion.h1
                            className="text-4xl md:text-6xl lg:text-7xl font-black text-white mb-5 tracking-tight"
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.7, delay: 0.2 }}
                        >
                            About <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">SmartShop</span>
                        </motion.h1>
                        <motion.p
                            className="text-base md:text-lg text-gray-300 max-w-2xl mx-auto leading-relaxed"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.7, delay: 0.4 }}
                        >
                            We're dedicated to providing the best e-commerce experience with high-quality products,
                            exceptional service, and lightning-fast delivery worldwide.
                        </motion.p>
                        <motion.div
                            className="mt-8 flex justify-center gap-4"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.7, delay: 0.6 }}
                        >
                            <Link to="/products" className="inline-flex items-center gap-2 px-6 py-3 bg-white text-gray-900 rounded-xl font-bold text-sm hover:bg-gray-100 transition-all shadow-xl shadow-white/10 hover:shadow-white/20 hover:-translate-y-0.5">
                                Explore Products <ArrowRight className="w-4 h-4" />
                            </Link>
                            <Link to="/contact" className="inline-flex items-center gap-2 px-6 py-3 border border-white/30 text-white rounded-xl font-bold text-sm hover:bg-white/10 backdrop-blur-sm transition-all hover:-translate-y-0.5">
                                Get in Touch
                            </Link>
                        </motion.div>
                    </div>
                </div>
            </div>

            {/* ─── Stats Section ─── */}
            <AnimatedSection className="py-10 bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <motion.div className="grid grid-cols-2 md:grid-cols-4 gap-6" variants={staggerContainer}>
                        {stats.map((stat, index) => (
                            <motion.div key={index} className="text-center group cursor-default" variants={fadeUp} custom={index}>
                                <div className="text-3xl md:text-4xl font-black text-gray-900 dark:text-white mb-1 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors duration-300">
                                    {stat.number}
                                </div>
                                <div className="text-xs md:text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                                    {stat.label}
                                </div>
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
            </AnimatedSection>

            {/* ─── Mission & Story ─── */}
            <AnimatedSection className="py-16 bg-white dark:bg-gray-950">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid md:grid-cols-2 gap-12 items-center">
                        <motion.div variants={slideLeft}>
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
                                {[
                                    { icon: <Users className="w-4 h-4 text-indigo-600" />, label: 'Customer First' },
                                    { icon: <Award className="w-4 h-4 text-indigo-600" />, label: 'Quality Assured' },
                                    { icon: <Globe className="w-4 h-4 text-indigo-600" />, label: 'Global Reach' },
                                ].map((item, i) => (
                                    <motion.div
                                        key={i}
                                        className="flex items-center gap-2 px-4 py-2.5 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-indigo-300 dark:hover:border-indigo-600 transition-colors duration-300"
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                    >
                                        {item.icon}
                                        <span className="text-sm font-semibold text-gray-900 dark:text-white">{item.label}</span>
                                    </motion.div>
                                ))}
                            </div>
                        </motion.div>

                        <motion.div variants={slideRight} className="relative">
                            <div className="aspect-video bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 dark:from-indigo-900/20 dark:via-purple-900/20 dark:to-pink-900/20 rounded-3xl overflow-hidden flex items-center justify-center border border-gray-200 dark:border-gray-700 relative group hover:shadow-2xl hover:shadow-indigo-200/20 transition-all duration-500">
                                <motion.div
                                    className="absolute top-6 right-8 w-12 h-12 bg-indigo-200/50 dark:bg-indigo-800/30 rounded-xl rotate-12"
                                    animate={{ y: [0, -12, 0] }}
                                    transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                                />
                                <motion.div
                                    className="absolute bottom-8 left-6 w-8 h-8 bg-purple-200/50 dark:bg-purple-800/30 rounded-lg -rotate-12"
                                    animate={{ y: [0, -10, 0] }}
                                    transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
                                />
                                <div className="text-center p-6 relative z-10">
                                    <motion.div
                                        className="w-20 h-20 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xl shadow-indigo-200 dark:shadow-indigo-900/40"
                                        animate={{ y: [0, -8, 0] }}
                                        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                                        whileHover={{ scale: 1.15, rotate: 5 }}
                                    >
                                        <Rocket className="w-9 h-9 text-white" />
                                    </motion.div>
                                    <p className="text-xl font-bold text-gray-900 dark:text-white">Building the Future</p>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">of E-Commerce</p>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </AnimatedSection>

            {/* ─── Values Section ─── */}
            <AnimatedSection className="py-16 bg-gray-50 dark:bg-gray-900">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <motion.div className="text-center mb-12" variants={fadeUp}>
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-50 dark:bg-indigo-900/30 rounded-full text-indigo-700 dark:text-indigo-400 text-xs font-bold mb-4">
                            <Target className="w-3.5 h-3.5" />
                            Our Values
                        </div>
                        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-3 tracking-tight">What Drives Us</h2>
                        <p className="text-gray-600 dark:text-gray-400 max-w-xl mx-auto">These core values guide everything we do</p>
                    </motion.div>

                    <motion.div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5" variants={staggerContainer}>
                        {values.map((value, index) => (
                            <motion.div
                                key={index}
                                className="group p-7 rounded-2xl border border-gray-200 dark:border-gray-700 hover:border-indigo-300 dark:hover:border-indigo-700 bg-white dark:bg-gray-800 cursor-default"
                                variants={scaleIn}
                                custom={index}
                                whileHover={{ y: -6, boxShadow: '0 20px 40px -12px rgba(99,102,241,0.15)' }}
                                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                            >
                                <motion.div
                                    className={`w-12 h-12 ${value.color} rounded-xl flex items-center justify-center mb-4 text-white shadow-lg`}
                                    whileHover={{ scale: 1.15, rotate: 5 }}
                                >
                                    {value.icon}
                                </motion.div>
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">{value.title}</h3>
                                <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{value.description}</p>
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
            </AnimatedSection>

            {/* ─── Team Section with 3D Tilt Cards ─── */}
            <AnimatedSection className="py-16 bg-white dark:bg-gray-950">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <motion.div className="text-center mb-12" variants={fadeUp}>
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
                    </motion.div>

                    <motion.div
                        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6"
                        variants={staggerContainer}
                    >
                        {teamMembers.map((member, index) => (
                            <motion.div
                                key={index}
                                variants={scaleIn}
                                custom={index}
                            >
                                <TiltCard className="group relative bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden hover:border-indigo-400 dark:hover:border-indigo-500 transition-colors duration-300">

                                    {/* Gradient Photo Area */}
                                    <div className="aspect-square relative overflow-hidden">
                                        <div className={`absolute inset-0 bg-gradient-to-br ${member.color}`} />

                                        {/* Floating particles */}
                                        <motion.div
                                            className="absolute top-4 right-4 w-8 h-8 bg-white/10 rounded-lg rotate-45"
                                            animate={{ y: [0, -10, 0], rotate: [45, 55, 45] }}
                                            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                                        />
                                        <motion.div
                                            className="absolute bottom-6 left-4 w-5 h-5 bg-white/10 rounded-full"
                                            animate={{ y: [0, -8, 0] }}
                                            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
                                        />
                                        <motion.div
                                            className="absolute top-1/3 left-6 w-3 h-3 bg-white/15 rounded-full"
                                            animate={{ y: [0, -6, 0], x: [0, 4, 0] }}
                                            transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
                                        />

                                        {/* Initials */}
                                        <div className="absolute inset-0 flex items-center justify-center z-[1]">
                                            <motion.div
                                                className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center border-2 border-white/30"
                                                whileHover={{ scale: 1.15, backgroundColor: 'rgba(255,255,255,0.35)' }}
                                                transition={{ type: 'spring', stiffness: 300 }}
                                            >
                                                <span className="text-2xl font-black text-white drop-shadow-lg">
                                                    {member.initials}
                                                </span>
                                            </motion.div>
                                        </div>

                                        {/* Social Overlay on hover */}
                                        <motion.div
                                            className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent flex items-end justify-center pb-5 z-[5]"
                                            initial={{ opacity: 0 }}
                                            whileHover={{ opacity: 1 }}
                                            transition={{ duration: 0.3 }}
                                        >
                                            <motion.div
                                                className="flex gap-3"
                                                initial={{ y: 20, opacity: 0 }}
                                                whileHover={{ y: 0, opacity: 1 }}
                                                transition={{ duration: 0.3, delay: 0.1 }}
                                            >
                                                {member.linkedin && (
                                                    <motion.a
                                                        href={member.linkedin}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center border border-white/20 text-white"
                                                        whileHover={{ scale: 1.2, backgroundColor: '#0077B5' }}
                                                        whileTap={{ scale: 0.9 }}
                                                        title={`${member.name} on LinkedIn`}
                                                    >
                                                        <Linkedin className="w-5 h-5" />
                                                    </motion.a>
                                                )}
                                                {member.github && (
                                                    <motion.a
                                                        href={member.github}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center border border-white/20 text-white"
                                                        whileHover={{ scale: 1.2, backgroundColor: '#333333' }}
                                                        whileTap={{ scale: 0.9 }}
                                                        title={`${member.name} on GitHub`}
                                                    >
                                                        <Github className="w-5 h-5" />
                                                    </motion.a>
                                                )}
                                            </motion.div>
                                        </motion.div>
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

                                        {/* Social icons — always visible */}
                                        <div className="flex justify-center gap-2 mt-3">
                                            {member.linkedin && (
                                                <motion.a
                                                    href={member.linkedin}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="w-8 h-8 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center text-gray-500 dark:text-gray-400"
                                                    whileHover={{ scale: 1.2, backgroundColor: '#0077B5', color: '#ffffff' }}
                                                    whileTap={{ scale: 0.9 }}
                                                    title={`${member.name} on LinkedIn`}
                                                >
                                                    <Linkedin className="w-4 h-4" />
                                                </motion.a>
                                            )}
                                            {member.github && (
                                                <motion.a
                                                    href={member.github}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="w-8 h-8 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center text-gray-500 dark:text-gray-400"
                                                    whileHover={{ scale: 1.2, backgroundColor: '#333333', color: '#ffffff' }}
                                                    whileTap={{ scale: 0.9 }}
                                                    title={`${member.name} on GitHub`}
                                                >
                                                    <Github className="w-4 h-4" />
                                                </motion.a>
                                            )}
                                        </div>
                                    </div>
                                </TiltCard>
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
            </AnimatedSection>

            {/* ─── CTA Section ─── */}
            <AnimatedSection className="py-16 bg-gradient-to-br from-gray-50 via-indigo-50/30 to-gray-50 dark:from-gray-900 dark:via-indigo-950/20 dark:to-gray-900 border-t border-gray-200 dark:border-gray-800">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <motion.div variants={fadeUp}>
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
                            <motion.div whileHover={{ y: -2 }} whileTap={{ scale: 0.95 }}>
                                <Link to="/products" className="inline-flex items-center justify-center gap-2 px-7 py-3.5 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-xl font-bold text-sm hover:bg-gray-800 dark:hover:bg-gray-100 transition-all shadow-xl shadow-gray-300/30 dark:shadow-none">
                                    Start Shopping <ArrowRight className="w-4 h-4" />
                                </Link>
                            </motion.div>
                            <motion.div whileHover={{ y: -2 }} whileTap={{ scale: 0.95 }}>
                                <Link to="/contact" className="inline-flex items-center justify-center gap-2 px-7 py-3.5 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl font-bold text-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition-all">
                                    Contact Us
                                </Link>
                            </motion.div>
                        </div>
                    </motion.div>
                </div>
            </AnimatedSection>
        </div>
    );
};
