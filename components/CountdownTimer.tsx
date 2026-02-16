import React, { useState, useEffect } from 'react';

interface CountdownTimerProps {
    endTime: string;
    onExpire?: () => void;
}

export const CountdownTimer: React.FC<CountdownTimerProps> = ({ endTime, onExpire }) => {
    const [timeLeft, setTimeLeft] = useState<{
        days: string;
        hours: string;
        minutes: string;
        seconds: string;
    } | null>(null);

    useEffect(() => {
        const calculateTimeLeft = () => {
            const difference = +new Date(endTime) - +new Date();

            if (difference <= 0) {
                setTimeLeft(null);
                if (onExpire) onExpire();
                return;
            }

            const timeLeftData = {
                days: Math.floor(difference / (1000 * 60 * 60 * 24)).toString().padStart(2, '0'),
                hours: Math.floor((difference / (1000 * 60 * 60)) % 24).toString().padStart(2, '0'),
                minutes: Math.floor((difference / 1000 / 60) % 60).toString().padStart(2, '0'),
                seconds: Math.floor((difference / 1000) % 60).toString().padStart(2, '0'),
            };

            setTimeLeft(timeLeftData);
        };

        calculateTimeLeft();
        const timer = setInterval(calculateTimeLeft, 1000);

        return () => clearInterval(timer);
    }, [endTime, onExpire]);

    if (!timeLeft) return null;

    return (
        <div className="flex gap-4">
            {[
                { label: 'Days', value: timeLeft.days },
                { label: 'Hrs', value: timeLeft.hours },
                { label: 'Mins', value: timeLeft.minutes },
                { label: 'Secs', value: timeLeft.seconds },
            ].map((item, i) => (
                <div key={i} className="flex flex-col items-center">
                    <div className="w-12 h-12 bg-black text-white rounded-lg flex items-center justify-center font-bold text-xl shadow-lg ring-4 ring-white/10 group-hover:scale-110 transition-transform">
                        {item.value}
                    </div>
                    <span className="text-[10px] uppercase font-bold text-gray-500 mt-2 tracking-widest">{item.label}</span>
                </div>
            ))}
        </div>
    );
};
