import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { BookOpen, Sun, Moon, Menu, ArrowLeft } from "lucide-react-native";
import { useTheme } from "@/context/ThemeContext";
import { useRouter, usePathname } from "expo-router";

type AppHeaderProps = {
  onMenuPress?: () => void;
};

export default function AppHeader({ onMenuPress }: AppHeaderProps) {
  const { toggleTheme, isDarkMode, colors } = useTheme();
  const router = useRouter();
  const pathname = usePathname();

  const isHome = pathname === "/(tabs)/home";

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    }
  };

  const handleGoHome = () => {
    router.replace("/(tabs)/home");
  };

  return (
    <View
      className="flex-row justify-between items-center px-4 py-4 border-b"
      style={{ borderBottomColor: colors.border, backgroundColor: colors.background }}
    >
      <View className="flex-row items-center gap-2">
        {!isHome && router.canGoBack() && (
          <TouchableOpacity onPress={handleBack} className="mr-2">
            <ArrowLeft color={colors.icon} size={22} />
          </TouchableOpacity>
        )}
        <TouchableOpacity onPress={handleGoHome} className="flex-row items-center gap-2">
          <BookOpen color={colors.accent} size={24} />
          <Text
            className="font-inter text-xl font-bold pt-1"
            style={{ color: colors.text }}
          >
            Storytime
          </Text>
        </TouchableOpacity>
      </View>
      <View className="flex-row items-center gap-4">
        <TouchableOpacity onPress={toggleTheme}>
          {isDarkMode ? (
            <Sun color={colors.icon} size={22} />
          ) : (
            <Moon color={colors.icon} size={22} />
          )}
        </TouchableOpacity>
        {onMenuPress && (
          <TouchableOpacity onPress={onMenuPress}>
            <Menu color={colors.icon} size={24} />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

