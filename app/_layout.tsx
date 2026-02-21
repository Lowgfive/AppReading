import AppProvider from '@/context/AppContext'
import AuthProvider from '@/context/AuthContext'
import { Stack } from 'expo-router'


export default function Layout() {
    return(
        <AuthProvider>
            <AppProvider>
                {
                    <Stack screenOptions={{headerShown : false}} />
                }
            </AppProvider>
        </AuthProvider>
    )
}