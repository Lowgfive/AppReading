import '../global.css';

import { useEffect } from 'react';
import { SplashScreen, Stack } from 'expo-router';
import { useFonts, Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold } from '@expo-google-fonts/inter';

import AppProvider from '@/context/AppContext';
import AuthProvider from '@/context/AuthContext';
import AuthFormProvider from '@/context/AuthFormContext';
import { LanguageProvider } from '@/context/LanguageContext';
import { ThemeProvider } from '@/context/ThemeContext';
import { ToastProvider } from '@/context/ToastContext';

SplashScreen.preventAutoHideAsync();

export default function Layout() {
    const [fontsLoaded, fontError] = useFonts({
        Inter_400Regular,
        Inter_500Medium,
        Inter_600SemiBold,
        Inter_700Bold,
    });

    useEffect(() => {
        if (fontsLoaded || fontError) {
            SplashScreen.hideAsync();
        }
    }, [fontsLoaded, fontError]);

    if (!fontsLoaded && !fontError) {
        return null;
    }

    return (
        <ThemeProvider>
            <ToastProvider>
                <AuthProvider>
                    <LanguageProvider>
                        <AppProvider>
                            <AuthFormProvider>
                                <Stack screenOptions={{ headerShown: false, animation: 'fade' }} />
                            </AuthFormProvider>
                        </AppProvider>
                    </LanguageProvider>
                </AuthProvider>
            </ToastProvider>
        </ThemeProvider>
    );
}
