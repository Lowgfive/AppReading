import React from "react";
import { View } from "react-native";
import { useTheme } from "@/context/ThemeContext";

export default function SkeletonStoryCard() {
    const { colors } = useTheme();
    return (
        <View className="mr-4 w-36 rounded-xl overflow-hidden mb-2">
            <View 
                className="w-full h-48 rounded-xl bg-gray-700 animate-pulse"
                style={{ backgroundColor: colors.cardImage }}
            />
            <View className="mt-2 px-1">
                <View className="h-4 bg-gray-600 rounded mb-1 w-3/4 animate-pulse" />
                <View className="h-3 bg-gray-600 rounded mb-2 w-1/2 animate-pulse" />
                <View className="flex-row items-center gap-2">
                    <View className="h-3 w-3 bg-gray-600 rounded-full animate-pulse" />
                    <View className="h-3 w-3 bg-gray-600 rounded-full animate-pulse" />
                    <View className="h-3 w-3 bg-gray-600 rounded-full animate-pulse" />
                </View>
            </View>
        </View>
    );
}
