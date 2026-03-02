import React, { useEffect } from 'react';
import { useTelegram } from '../hooks/useTelegram';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';

export const TelegramInitializer: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { tg, initData, user: tgUser } = useTelegram();
    const { login, isAuthenticated, isLoading } = useAuth();

    useEffect(() => {
        const tryTelegramLogin = async () => {
            if (tg && initData && !isAuthenticated && !isLoading) {
                try {
                    console.log("Attempting Telegram Auto-Login...");
                    const response = await fetch(`${import.meta.env.VITE_API_URL || 'https://api.smartshop1.us'}/api/auth/telegram/`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({ initData }),
                    });

                    if (response.ok) {
                        const data = await response.json();
                        login(data.user, data.access);

                        // Store tokens manually since we are using fetch here
                        localStorage.setItem('cm_token', data.access);
                        localStorage.setItem('cm_refresh', data.refresh);
                        localStorage.setItem('cm_user_data', JSON.stringify(data.user));

                        console.log("Telegram Login Successful!");

                        // Haptic feedback if available
                        if (tg.HapticFeedback) {
                            tg.HapticFeedback.notificationOccurred('success');
                        }
                    } else {
                        console.error("Telegram Login Failed", await response.text());
                    }
                } catch (error) {
                    console.error("Error during Telegram login:", error);
                }
            }
        };

        tryTelegramLogin();
    }, [tg, initData, isAuthenticated, isLoading, login]);

    // Sync theme with Telegram
    useEffect(() => {
        if (tg) {
            const colorScheme = tg.colorScheme; // 'light' or 'dark'
            document.documentElement.setAttribute('data-theme', colorScheme);

            // Update primary color from Telegram if provided
            if (tg.themeParams?.button_color) {
                document.documentElement.style.setProperty('--primary-color', tg.themeParams.button_color);
            }
        }
    }, [tg]);

    return <>{children}</>;
};
