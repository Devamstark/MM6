import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import {
    Calendar as CalendarIcon, ChevronLeft, ChevronRight,
    Mail, Send, Clock, FileText, TrendingUp, X
} from 'lucide-react';

interface CalendarCampaign {
    id: string;
    title: string;
    start: string;
    end?: string;
    status: 'draft' | 'scheduled' | 'sending' | 'sent' | 'paused' | 'failed';
    campaign_type: string;
    emails_sent: number;
    delivery_rate: number;
    subject: string;
}

interface CalendarData {
    year: number;
    month: number;
    campaigns: CalendarCampaign[];
    total_campaigns: number;
    by_status: Record<string, number>;
}

const STATUS_COLORS: Record<string, string> = {
    draft: 'bg-gray-100 text-gray-600 border-gray-200 dark:bg-gray-800 dark:text-gray-400',
    scheduled: 'bg-orange-50 text-orange-600 border-orange-200 dark:bg-orange-900/30 dark:text-orange-400',
    sending: 'bg-blue-50 text-blue-600 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400',
    sent: 'bg-green-50 text-green-600 border-green-200 dark:bg-green-900/30 dark:text-green-400',
    paused: 'bg-yellow-50 text-yellow-600 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400',
    failed: 'bg-red-50 text-red-600 border-red-200 dark:bg-red-900/30 dark:text-red-400',
};

const MONTH_NAMES = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
];

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export const CampaignCalendar: React.FC = () => {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [calendarData, setCalendarData] = useState<CalendarData | null>(null);
    const [loading, setLoading] = useState(true);
    const [selectedCampaign, setSelectedCampaign] = useState<CalendarCampaign | null>(null);

    const loadCalendar = async () => {
        setLoading(true);
        try {
            const data = await api.getCampaignCalendar(
                currentDate.getFullYear(),
                currentDate.getMonth() + 1 // API expects 1-based month
            );
            setCalendarData(data);
        } catch (e) {
            console.error('Failed to load calendar', e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadCalendar();
    }, [currentDate]);

    const prevMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    };

    const nextMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    };

    const goToToday = () => {
        setCurrentDate(new Date());
    };

    // Generate calendar grid
    const generateCalendarDays = () => {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();

        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const startingDay = firstDay.getDay();
        const totalDays = lastDay.getDate();

        const days = [];

        // Previous month's days
        const prevMonthLastDay = new Date(year, month, 0).getDate();
        for (let i = startingDay - 1; i >= 0; i--) {
            days.push({
                day: prevMonthLastDay - i,
                isCurrentMonth: false,
                date: new Date(year, month - 1, prevMonthLastDay - i)
            });
        }

        // Current month's days
        for (let i = 1; i <= totalDays; i++) {
            days.push({
                day: i,
                isCurrentMonth: true,
                date: new Date(year, month, i),
                isToday: i === new Date().getDate() && month === new Date().getMonth() && year === new Date().getFullYear()
            });
        }

        // Next month's days
        const remainingDays = 42 - days.length; // 6 rows * 7 days
        for (let i = 1; i <= remainingDays; i++) {
            days.push({
                day: i,
                isCurrentMonth: false,
                date: new Date(year, month + 1, i)
            });
        }

        return days;
    };

    const getCampaignsForDay = (date: Date) => {
        if (!calendarData) return [];
        return calendarData.campaigns.filter(c => {
            const campaignDate = new Date(c.start);
            return campaignDate.toDateString() === date.toDateString();
        });
    };

    const calendarDays = generateCalendarDays();

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 bg-white dark:bg-gray-900 rounded-xl p-1 border border-gray-200 dark:border-gray-700">
                        <button
                            onClick={prevMonth}
                            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-all"
                        >
                            <ChevronLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                        </button>
                        <button
                            onClick={nextMonth}
                            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-all"
                        >
                            <ChevronRight className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                        </button>
                    </div>
                    <div>
                        <h2 className="text-2xl font-black text-gray-900 dark:text-white flex items-center gap-2">
                            <CalendarIcon className="w-6 h-6 text-indigo-600" />
                            {MONTH_NAMES[currentDate.getMonth()]} {currentDate.getFullYear()}
                        </h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                            {calendarData?.total_campaigns || 0} campaign{calendarData?.total_campaigns !== 1 ? 's' : ''} this month
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={goToToday}
                        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-sm transition-all"
                    >
                        Today
                    </button>
                </div>
            </div>

            {/* Stats */}
            {calendarData && (
                <div className="grid grid-cols-3 gap-4">
                    <StatCard
                        label="Scheduled"
                        value={calendarData.by_status.scheduled}
                        color="orange"
                        icon={<Clock className="w-4 h-4" />}
                    />
                    <StatCard
                        label="Sent"
                        value={calendarData.by_status.sent}
                        color="green"
                        icon={<Send className="w-4 h-4" />}
                    />
                    <StatCard
                        label="Draft"
                        value={calendarData.by_status.draft}
                        color="gray"
                        icon={<FileText className="w-4 h-4" />}
                    />
                </div>
            )}

            {/* Calendar Grid */}
            <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 overflow-hidden shadow-sm">
                {/* Day Headers */}
                <div className="grid grid-cols-7 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                    {DAY_NAMES.map(day => (
                        <div key={day} className="py-3 text-center text-xs font-black text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            {day}
                        </div>
                    ))}
                </div>

                {/* Calendar Days */}
                <div className="grid grid-cols-7">
                    {loading ? (
                        <div className="col-span-7 py-20 flex justify-center">
                            <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent animate-spin rounded-full"></div>
                        </div>
                    ) : (
                        calendarDays.map((dayInfo, idx) => {
                            const dayCampaigns = getCampaignsForDay(dayInfo.date);
                            return (
                                <div
                                    key={idx}
                                    className={`min-h-[120px] p-2 border-b border-r border-gray-100 dark:border-gray-800 ${!dayInfo.isCurrentMonth ? 'bg-gray-50 dark:bg-gray-800/50' : ''
                                        }`}
                                >
                                    <div className={`text-sm font-bold mb-2 ${dayInfo.isToday
                                        ? 'w-7 h-7 bg-indigo-600 text-white rounded-full flex items-center justify-center'
                                        : dayInfo.isCurrentMonth
                                            ? 'text-gray-900 dark:text-white'
                                            : 'text-gray-400 dark:text-gray-600'
                                        }`}>
                                        {dayInfo.day}
                                    </div>
                                    <div className="space-y-1">
                                        {dayCampaigns.slice(0, 3).map(campaign => (
                                            <button
                                                key={campaign.id}
                                                onClick={() => setSelectedCampaign(campaign)}
                                                className={`w-full text-left text-xs px-2 py-1.5 rounded-lg border truncate transition-all hover:scale-105 ${STATUS_COLORS[campaign.status]
                                                    }`}
                                            >
                                                {campaign.title}
                                            </button>
                                        ))}
                                        {dayCampaigns.length > 3 && (
                                            <div className="text-xs text-gray-500 dark:text-gray-400 text-center py-1">
                                                +{dayCampaigns.length - 3} more
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>

            {/* Campaign Detail Modal */}
            {selectedCampaign && (
                <div className="fixed inset-0 z-1100 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm">
                    <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden">
                        <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center">
                            <div>
                                <h3 className="text-xl font-black text-gray-900 dark:text-white">{selectedCampaign.title}</h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{selectedCampaign.subject}</p>
                            </div>
                            <button
                                onClick={() => setSelectedCampaign(null)}
                                className="text-gray-400 hover:text-gray-600 dark:hover:text-white p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="p-6 space-y-4">
                            <div className="flex items-center gap-3">
                                <span className={`px-3 py-1 text-xs font-black uppercase tracking-wider rounded-lg border ${STATUS_COLORS[selectedCampaign.status]
                                    }`}>
                                    {selectedCampaign.status}
                                </span>
                                <span className="text-xs font-bold text-gray-500 dark:text-gray-400 capitalize">
                                    {selectedCampaign.campaign_type}
                                </span>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Emails Sent</p>
                                    <p className="text-2xl font-black text-gray-900 dark:text-white">
                                        {selectedCampaign.emails_sent.toLocaleString()}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Delivery Rate</p>
                                    <p className="text-2xl font-black text-green-600">
                                        {selectedCampaign.delivery_rate}%
                                    </p>
                                </div>
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Scheduled/Sent Date</p>
                                <p className="text-sm font-bold text-gray-900 dark:text-white">
                                    {new Date(selectedCampaign.start).toLocaleString()}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

// Stat Card Component
const StatCard = ({ label, value, color, icon }: { label: string; value: number; color: string; icon: React.ReactNode }) => {
    const colorMap: Record<string, string> = {
        orange: 'bg-orange-50 text-orange-600 dark:bg-orange-900/20 dark:text-orange-400 border-orange-100 dark:border-orange-800',
        green: 'bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400 border-green-100 dark:border-green-800',
        gray: 'bg-gray-50 text-gray-600 dark:bg-gray-900/20 dark:text-gray-400 border-gray-100 dark:border-gray-800',
    };

    return (
        <div className={`p-4 rounded-2xl border ${colorMap[color] || colorMap.gray}`}>
            <div className="flex items-center gap-2 mb-2">
                {icon}
                <span className="text-[10px] font-black uppercase tracking-wider opacity-80">{label}</span>
            </div>
            <p className="text-2xl font-black text-gray-900 dark:text-white">{value}</p>
        </div>
    );
};
