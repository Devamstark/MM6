import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Clock, Calendar as CalendarIcon, Check } from 'lucide-react';

interface DateTimePickerProps {
    value: string;
    onChange: (value: string) => void;
    minDate?: Date;
}

export const CustomDateTimePicker: React.FC<DateTimePickerProps> = ({ value, onChange, minDate = new Date() }) => {
    const [currentDate, setCurrentDate] = useState(value ? new Date(value) : new Date());
    const [viewDate, setViewDate] = useState(new Date(currentDate));
    const [showTimePicker, setShowTimePicker] = useState(false);

    // Update internal state when value prop changes
    useEffect(() => {
        if (value) {
            const date = new Date(value);
            setCurrentDate(date);
            setViewDate(new Date(date));
        }
    }, [value]);

    const daysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
    const firstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

    const handlePrevMonth = () => {
        setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1));
    };

    const handleNextMonth = () => {
        setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1));
    };

    const handleDateSelect = (day: number) => {
        const newDate = new Date(viewDate.getFullYear(), viewDate.getMonth(), day);
        newDate.setHours(currentDate.getHours());
        newDate.setMinutes(currentDate.getMinutes());
        setCurrentDate(newDate);
        onChange(newDate.toISOString());
    };

    const handleTimeChange = (type: 'hours' | 'minutes', val: number) => {
        const newDate = new Date(currentDate);
        if (type === 'hours') newDate.setHours(val);
        else newDate.setMinutes(val);
        setCurrentDate(newDate);
        onChange(newDate.toISOString());
    };

    const renderCalendar = () => {
        const days = [];
        const totalDays = daysInMonth(viewDate.getFullYear(), viewDate.getMonth());
        const firstDay = firstDayOfMonth(viewDate.getFullYear(), viewDate.getMonth());

        // Fill empty slots for previous month
        for (let i = 0; i < firstDay; i++) {
            days.push(<div key={`empty-${i}`} className="h-10"></div>);
        }

        for (let day = 1; day <= totalDays; day++) {
            const date = new Date(viewDate.getFullYear(), viewDate.getMonth(), day);
            const isSelected = currentDate.getDate() === day &&
                currentDate.getMonth() === viewDate.getMonth() &&
                currentDate.getFullYear() === viewDate.getFullYear();
            const isToday = new Date().toDateString() === date.toDateString();
            const isPast = date < new Date(new Date().setHours(0, 0, 0, 0));

            days.push(
                <button
                    key={day}
                    type="button"
                    disabled={isPast}
                    onClick={() => handleDateSelect(day)}
                    className={`h-10 w-10 flex items-center justify-center rounded-xl text-sm font-bold transition-all
                        ${isSelected ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30 ring-2 ring-indigo-500/20' :
                            isPast ? 'text-gray-300 cursor-not-allowed' :
                                isToday ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400' :
                                    'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'}`}
                >
                    {day}
                </button>
            );
        }
        return days;
    };

    return (
        <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl overflow-hidden shadow-xl animate-fade-in ring-1 ring-black/5">
            {/* Header / Tabs */}
            <div className="flex border-b border-gray-100 dark:border-gray-800">
                <button
                    type="button"
                    onClick={() => setShowTimePicker(false)}
                    className={`flex-1 py-4 flex items-center justify-center gap-2 text-xs font-black uppercase tracking-widest transition-all ${!showTimePicker ? 'text-indigo-600 bg-indigo-50/50 dark:bg-indigo-900/10' : 'text-gray-400 hover:text-gray-600'}`}
                >
                    <CalendarIcon className="w-4 h-4" />
                    Select Date
                </button>
                <button
                    type="button"
                    onClick={() => setShowTimePicker(true)}
                    className={`flex-1 py-4 flex items-center justify-center gap-2 text-xs font-black uppercase tracking-widest transition-all ${showTimePicker ? 'text-indigo-600 bg-indigo-50/50 dark:bg-indigo-900/10' : 'text-gray-400 hover:text-gray-600'}`}
                >
                    <Clock className="w-4 h-4" />
                    Set Time
                </button>
            </div>

            <div className="p-6">
                {!showTimePicker ? (
                    <div>
                        {/* Month/Year Navigation */}
                        <div className="flex items-center justify-between mb-6">
                            <h4 className="text-base font-black text-gray-900 dark:text-white">
                                {viewDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
                            </h4>
                            <div className="flex items-center gap-2">
                                <button type="button" onClick={handlePrevMonth} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl text-gray-500 transition-colors">
                                    <ChevronLeft className="w-5 h-5" />
                                </button>
                                <button type="button" onClick={handleNextMonth} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl text-gray-500 transition-colors">
                                    <ChevronRight className="w-5 h-5" />
                                </button>
                            </div>
                        </div>

                        {/* Calendar Grid */}
                        <div className="grid grid-cols-7 gap-1 mb-2">
                            {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
                                <div key={day} className="h-8 flex items-center justify-center text-[10px] font-black text-gray-400 uppercase tracking-widest">
                                    {day}
                                </div>
                            ))}
                            {renderCalendar()}
                        </div>

                        <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800 flex justify-between items-center text-[10px] font-bold text-gray-500">
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-indigo-600"></div>
                                Selected: {currentDate.toLocaleDateString()}
                            </div>
                            <button type="button" onClick={() => setShowTimePicker(true)} className="text-indigo-600 flex items-center gap-1 hover:underline">
                                Set Time <ChevronRight className="w-3 h-3" />
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-8 py-4">
                        <div className="flex justify-center items-center gap-6">
                            {/* Hours Selector */}
                            <div className="text-center">
                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Hours</label>
                                <div className="h-40 overflow-y-auto no-scrollbar py-10 space-y-2 w-16 bg-gray-50 dark:bg-gray-800/50 rounded-2xl scroll-smooth">
                                    {Array.from({ length: 24 }).map((_, i) => (
                                        <button
                                            key={i}
                                            type="button"
                                            onClick={() => handleTimeChange('hours', i)}
                                            className={`w-12 h-10 mx-auto flex items-center justify-center rounded-xl text-lg font-black transition-all ${currentDate.getHours() === i ? 'bg-indigo-600 text-white scale-110 shadow-lg' : 'text-gray-400 hover:text-gray-600 dark:hover:text-white'}`}
                                        >
                                            {i.toString().padStart(2, '0')}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <span className="text-3xl font-black text-gray-300 mt-6">:</span>

                            {/* Minutes Selector */}
                            <div className="text-center">
                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Minutes</label>
                                <div className="h-40 overflow-y-auto no-scrollbar py-10 space-y-2 w-16 bg-gray-50 dark:bg-gray-800/50 rounded-2xl scroll-smooth">
                                    {Array.from({ length: 12 }).map((_, i) => (
                                        <button
                                            key={i * 5}
                                            type="button"
                                            onClick={() => handleTimeChange('minutes', i * 5)}
                                            className={`w-12 h-10 mx-auto flex items-center justify-center rounded-xl text-lg font-black transition-all ${currentDate.getMinutes() === i * 5 ? 'bg-indigo-600 text-white scale-110 shadow-lg' : 'text-gray-400 hover:text-gray-600 dark:hover:text-white'}`}
                                        >
                                            {(i * 5).toString().padStart(2, '0')}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="bg-indigo-50 dark:bg-indigo-900/20 p-4 rounded-2xl border border-indigo-100 dark:border-indigo-800 flex items-center gap-4">
                            <div className="w-10 h-10 bg-white dark:bg-gray-800 rounded-xl flex items-center justify-center shadow-sm">
                                <Clock className="w-5 h-5 text-indigo-600" />
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Planned Delivery</p>
                                <p className="text-base font-black text-indigo-900 dark:text-indigo-200">
                                    {currentDate.getHours().toString().padStart(2, '0')}:{currentDate.getMinutes().toString().padStart(2, '0')}
                                </p>
                            </div>
                            <div className="ml-auto">
                                <button type="button" onClick={() => setShowTimePicker(false)} className="px-4 py-2 bg-indigo-600 text-white text-xs font-black rounded-lg shadow-lg shadow-indigo-500/20">
                                    Done
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
