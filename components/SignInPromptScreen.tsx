import React, { useState } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { BookOpen } from "lucide-react-native";
import { router } from "expo-router";
import { useLanguage } from "@/context/LanguageContext";
import { useTheme } from "@/context/ThemeContext";
import AppHeader from "@/components/AppHeader";
import SideMenu from "@/components/SideMenu";

export default function SignInPromptScreen() {
    const { colors } = useTheme();
    const { t } = useLanguage();
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    return (
        <View className="flex-1" style={{ backgroundColor: colors.background }}>
            <AppHeader onMenuPress={() => setIsMenuOpen(true)} />

            <View className="flex-1 justify-center items-center px-8">
                <View
                    className="w-[100px] h-[100px] rounded-full items-center justify-center mb-6"
                    style={{ backgroundColor: colors.card }}
                >
                    <BookOpen color={colors.icon} size={48} />
                </View>

                <Text
                    className="text-[28px] font-serif font-bold mb-4 text-center"
                    style={{ color: colors.text }}
                >
                    {t("auth.welcome")}
                </Text>

                <Text
                    className="text-[15px] text-center mb-8 font-inter leading-6"
                    style={{ color: colors.subtext }}
                >
                    {t("auth.signInPrompt")}
                </Text>

                <View className="flex-row gap-4 w-full justify-center">
                    <TouchableOpacity
                        onPress={() => router.push("/(auth)/login" as any)}
                        className="py-[12px] px-8 rounded-xl items-center justify-center"
                        style={{ backgroundColor: colors.accent }}
                    >
                        <Text className="text-black font-inter font-bold text-[15px]">{t("auth.signIn")}</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={() => router.push("/(auth)/register" as any)}
                        className="py-[12px] px-8 rounded-xl items-center justify-center border"
                        style={{ borderColor: colors.border }}
                    >
                        <Text
                            className="font-inter font-bold text-[15px]"
                            style={{ color: colors.text }}
                        >
                            {t("auth.createAccount")}
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>

            <SideMenu isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />
        </View>
    );
}
