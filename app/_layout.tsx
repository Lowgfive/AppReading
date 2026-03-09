import '../global.css';

import AppProvider from '@/context/AppContext'
import AuthProvider from '@/context/AuthContext'
import AuthFormProvider from '@/context/AuthFormContext'
import { Stack } from 'expo-router'

export default function Layout() {
    return (
        <AuthProvider>
            <AppProvider>
                <AuthFormProvider>
                    <Stack screenOptions={{ headerShown: false }} />
                </AuthFormProvider>
            </AppProvider>
        </AuthProvider>
    )
}