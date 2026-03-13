import React from 'react';
import { View, Text } from 'react-native';
import AppHeader from '@/components/AppHeader';
import { useTheme } from '@/context/ThemeContext';

export default function TopUpScreen() {
    const { colors } = useTheme();

    return (
        <View className="flex-1" style={{ backgroundColor: colors.background }}>
            <AppHeader />
            <View className="flex-1 justify-center items-center px-4">
                <Text className="text-2xl font-bold font-serif mb-4" style={{ color: colors.text }}>
                    Top Up Diamonds
                </Text>
                <Text className="text-base text-center font-inter" style={{ color: colors.subtext }}>
                    Please implement your payment gateway or top-up mechanism here.
                </Text>
            </View>
        </View>
    );
}
