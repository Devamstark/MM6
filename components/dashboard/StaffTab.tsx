import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { Shield, UserPlus, Mail, Phone, Calendar, MoreVertical, ShieldAlert, ShieldCheck, Loader2, User as UserIcon } from 'lucide-react';
import { User as UserType } from '../../types';

export const StaffTab: React.FC = () => {
    const [staff, setStaff] = useState<UserType[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeFilter, setActiveFilter] = useState<'all' | 'admin' | 'seller'>('all');

    useEffect(() => {
        loadStaff();
    }, []);

    const loadStaff = async () => {
        setLoading(true);
        try {
            const users = await api.getUsers();
            // Filter only staff (admin and sellers)
            setStaff(users.filter(u => u.role === 'admin' || u.role === 'seller'));
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const handleToggleStatus = async (user: UserType) => {
        const action = user.isActive ? 'deactivate' : 'activate';
        if (window.confirm(`Are you sure you want to ${action} this staff member?`)) {
            try {
                // Assuming updateUserStatus takes (id, isActive)
                await api.updateUserStatus(user.id, !user.isActive);
                loadStaff();
            } catch (e) {
                alert('Failed to update status.');
            }
        }
    };

    const filteredStaff = activeFilter === 'all'
        ? staff
        : staff.filter(u => u.role === activeFilter);

    if (loading) return <div className="p-10 flex justify-center"><Loader2 className="w-10 h-10 animate-spin text-indigo-600" /></div>;

    return (
        <div className="space-y-8 animate-fade-in">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h2 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">Staff Management</h2>
                    <p className="text-gray-500 dark:text-gray-400 font-medium">Control administrative access and seller permissions.</p>
                </div>
                <div className="flex bg-white dark:bg-gray-900 p-1 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm transition-colors">
                    {(['all', 'admin', 'seller'] as const).map((filter) => (
                        <button
                            key={filter}
                            onClick={() => setActiveFilter(filter)}
                            className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeFilter === filter
                                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100 dark:shadow-none'
                                : 'text-gray-400 hover:text-indigo-600 dark:text-gray-500 dark:hover:text-indigo-400'
                                }`}
                        >
                            {filter}
                        </button>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                {filteredStaff.map((member, idx) => (
                    <div
                        key={member.id}
                        className="bg-white dark:bg-gray-900 p-8 rounded-4xl border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-xl transition-all duration-500 group animate-fade-up relative overflow-hidden"
                        style={{ animationDelay: `${idx * 50}ms` }}
                    >
                        {/* Status Indicator Bar */}
                        <div className={`absolute top-0 left-0 w-2 h-full ${member.isActive ? 'bg-green-500' : 'bg-red-500'} opacity-30`} />

                        <div className="flex flex-col sm:flex-row gap-6 items-center sm:items-start">
                            {/* Avatar */}
                            <div className="relative">
                                <div className="w-24 h-24 rounded-4xl bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center text-indigo-600 dark:text-indigo-400 overflow-hidden border-4 border-white dark:border-gray-800 shadow-inner">
                                    {member.profilePicture ? (
                                        <img src={member.profilePicture} alt={member.name} className="w-full h-full object-cover" />
                                    ) : (
                                        <UserIcon className="w-10 h-10" />
                                    )}
                                </div>
                                <div className={`absolute -bottom-1 -right-1 w-8 h-8 rounded-xl flex items-center justify-center shadow-lg border-2 border-white ${member.role === 'admin' ? 'bg-indigo-600 text-white' : 'bg-orange-500 text-white'
                                    }`}>
                                    <Shield className="w-4 h-4" />
                                </div>
                            </div>

                            <div className="grow space-y-4 text-center sm:text-left w-full">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h3 className="text-xl font-black text-gray-900 dark:text-white tracking-tight">{member.name}</h3>
                                        <div className="flex flex-wrap justify-center sm:justify-start gap-2 mt-2">
                                            <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-[0.15em] border ${member.role === 'admin'
                                                ? 'bg-indigo-50 border-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:border-indigo-800 dark:text-indigo-400'
                                                : 'bg-orange-50 border-orange-100 text-orange-600 dark:bg-orange-900/30 dark:border-orange-800 dark:text-orange-400'
                                                }`}>
                                                {member.role === 'admin' ? 'Super Admin' : 'Certified Seller'}
                                            </span>
                                            <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-[0.15em] border ${member.isActive
                                                ? 'bg-green-50 border-green-100 text-green-600 dark:bg-green-900/30 dark:border-green-800 dark:text-green-400'
                                                : 'bg-red-50 border-red-100 text-red-600 dark:bg-red-900/30 dark:border-red-800 dark:text-red-400'
                                                }`}>
                                                {member.isActive ? 'Active' : 'Account Disabled'}
                                            </span>
                                        </div>
                                    </div>
                                    <button className="text-gray-300 hover:text-indigo-600 transition-colors p-2">
                                        <MoreVertical className="w-5 h-5" />
                                    </button>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                                    <div className="flex items-center gap-3 text-gray-500 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white transition-colors">
                                        <div className="w-8 h-8 rounded-lg bg-gray-50 dark:bg-gray-800 flex items-center justify-center">
                                            <Mail className="w-4 h-4" />
                                        </div>
                                        <span className="text-xs font-bold truncate">{member.email}</span>
                                    </div>
                                    <div className="flex items-center gap-3 text-gray-500 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white transition-colors">
                                        <div className="w-8 h-8 rounded-lg bg-gray-50 dark:bg-gray-800 flex items-center justify-center">
                                            <Phone className="w-4 h-4" />
                                        </div>
                                        <span className="text-xs font-bold">{member.phoneNumber || 'No phone'}</span>
                                    </div>
                                </div>

                                <div className="flex flex-col sm:flex-row justify-between items-center pt-6">
                                    <div className="flex items-center gap-2 text-gray-400 mb-4">
                                        <Calendar className="w-4 h-4" />
                                        <span className="text-[10px] font-black uppercase tracking-widest">Joined {new Date(member.createdAt).toLocaleDateString()}</span>
                                    </div>
                                    <button
                                        onClick={() => handleToggleStatus(member)}
                                        className={`px-5 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${member.isActive
                                            ? 'text-red-600 hover:bg-red-50'
                                            : 'text-green-600 hover:bg-green-50'
                                            }`}
                                    >
                                        {member.isActive ? <><ShieldAlert className="w-3 h-3 inline mr-1" /> Revoke Access</> : <><ShieldCheck className="w-3 h-3 inline mr-1" /> Restore Access</>}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="bg-indigo-600 rounded-4xl p-12 relative overflow-hidden group shadow-2xl shadow-indigo-200">
                {/* Abstract patterns */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 blur-3xl group-hover:bg-white/20 transition-all duration-700" />
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-black/10 rounded-full -ml-24 -mb-24 blur-2xl" />

                <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
                    <div className="text-center md:text-left">
                        <h3 className="text-3xl font-black text-white tracking-tight mb-2">Need to Expand Your Team?</h3>
                        <p className="text-indigo-100 font-medium opacity-80">Invite new administrators or onboard verified sellers to your platform.</p>
                    </div>
                    <button className="bg-white text-indigo-600 px-10 py-5 rounded-4xl font-black text-xs uppercase tracking-[0.2em] hover:scale-105 active:scale-95 transition-all shadow-2xl flex items-center gap-3">
                        <UserPlus className="w-5 h-5" />
                        Onboard New Staff
                    </button>
                </div>
            </div>
        </div>
    );
};
