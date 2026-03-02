import React, { useEffect } from 'react';
import { useTelegram } from '../hooks/useTelegram';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';

export const TelegramInitializer: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { tg, initData } = useTelegram();
    const { login, isAuthenticated, isLoading } = useAuth();
    const [isAutoLoggingIn, setIsAutoLoggingIn] = React.useState(false);

    useEffect(() => {
        const tryTelegramLogin = async () => {
            // Don't run if already authenticated, loading, or already attempted in this session
            if (tg && initData && !isAuthenticated && !isLoading && !isAutoLoggingIn) {
                // Prevent double-execution
                if (sessionStorage.getItem('tma_login_attempted')) return;

                try {
                    setIsAutoLoggingIn(true);
                    console.log("🚀 TMA: Attempting Telegram Auto-Login...");

                    const baseUrl = import.meta.env.VITE_API_URL || 'https://api.smartshop1.us/api';
                    // Ensure we don't double up on /api/
                    const cleanBase = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
                    const apiUrl = cleanBase.includes('/api')
                        ? `${cleanBase}/auth/telegram/`
                        : `${cleanBase}/api/auth/telegram/`;

                    console.log(`🚀 TMA: Calling API: ${apiUrl}`);

                    const response = await fetch(apiUrl, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ initData }),
                    });

                    if (response.ok) {
                        const data = await response.json();
                        console.log("✅ TMA: Login Successful, saving session...");
                        sessionStorage.setItem('tma_login_attempted', 'true');
                        login(data.user, data.access);

                        // Allow state to settle before reload if needed, 
                        // but login() already sets user in context
                    } else {
                        console.error("❌ TMA: Login Failed", await response.text());
                        sessionStorage.setItem('tma_login_attempted', 'error');
                    }
                } catch (error) {
                    console.error("❌ TMA: Error during login:", error);
                } finally {
                    setIsAutoLoggingIn(false);
                }
            }
        };

        tryTelegramLogin();
    }, [tg, initData, isAuthenticated, isLoading, isAutoLoggingIn, login]);

    // Sync theme
    useEffect(() => {
        if (tg) {
            document.documentElement.setAttribute('data-theme', tg.colorScheme || 'light');
            if (tg.themeParams?.button_color) {
                document.documentElement.style.setProperty('--primary-color', tg.themeParams.button_color);
            }
        }
    }, [tg]);

    if (isAutoLoggingIn) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-white space-y-4">
                <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-gray-500 font-bold animate-pulse">Connecting to SmartShop Bot...</p>
            </div>
        );
    }

    return <>{children}</>;
};
