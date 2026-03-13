import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/context/AuthContext';
import SignInPromptScreen from '@/components/SignInPromptScreen';
import { useTheme } from '@/context/ThemeContext';
import AppHeader from '@/components/AppHeader';
import SideMenu from '@/components/SideMenu';

export default function MessageScreen() {
    const { user } = useAuth();
    const { colors } = useTheme();
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    if (!user) {
        return <SignInPromptScreen />;
    }

    return (
        <View className="flex-1 px-4 pt-6" style={{ backgroundColor: colors.background }}>
            <AppHeader onMenuPress={() => setIsMenuOpen(true)} />
            
            <View className="flex-1 justify-center items-center">
                <Text className="text-2xl font-bold mb-4" style={{ color: colors.text }}>Community Chat</Text>
                
                <View className="flex-1 w-full max-w-md justify-center items-center rounded-2xl border p-6 mb-4" style={{ borderColor: colors.border, backgroundColor: colors.card }}>
                    <Text className="text-center" style={{ color: colors.subtext }}>No messages yet. Start the conversation!</Text>
                </View>
                
                <View className="flex-row items-center w-full max-w-md rounded-xl px-4 py-3 mb-6" style={{ backgroundColor: colors.card, borderColor: colors.border, borderWidth: 1 }}>
                    <TextInput
                        className="flex-1 mr-3"
                        style={{ color: colors.text }}
                        placeholder="Type a message..."
                        placeholderTextColor={colors.iconMuted}
                    />
                    <TouchableOpacity className="rounded-xl p-2" style={{ backgroundColor: colors.accent }}>
                        <Ionicons name="paper-plane" size={20} color={colors.background} />
                    </TouchableOpacity>
                </View>
            </View>
            
            <SideMenu isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />
        </View>
    );
}
