import React, { useEffect, useMemo, useState } from "react";
import { View, Text, ScrollView, ActivityIndicator, TouchableOpacity } from "react-native";
import { useTheme } from "@/context/ThemeContext";
import { useAuth } from "@/context/AuthContext";
import { AppService } from "@/services/app.service";
import StoryCard from "@/components/StoryCard";
import SkeletonStoryCard from "@/components/SkeletonStoryCard";
import { router } from "expo-router";
import AppHeader from "@/components/AppHeader";
import SignInPromptScreen from "@/components/SignInPromptScreen";
import SideMenu from "@/components/SideMenu";

type LibraryItem = {
    story: any;
    lastChapterNumber: number;
    updatedAt: string;
};

export default function LibraryScreen() {
    const { colors } = useTheme();
    const { user, isLoading: authLoading } = useAuth();
    const [items, setItems] = useState<LibraryItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeFilter, setActiveFilter] = useState<"favorites" | "continue" | "completed" | "ongoing">("continue");
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    useEffect(() => {
        const fetchLibrary = async () => {
            try {
                setLoading(true);
                const data = await AppService.getLibrary();
                setItems(data || []);
            } catch (error) {
                console.error("Error fetching library:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchLibrary();
    }, []);

    const filteredItems = useMemo(() => {
        if (!items || items.length === 0) return [];

        switch (activeFilter) {
            case "completed":
                return items.filter((item) => item.story?.status === "COMPLETED");
            case "ongoing":
                return items.filter((item) => item.story?.status !== "COMPLETED");
            // "favorites" and "continue" can later be refined when we have more data
            default:
                return items;
        }
    }, [items, activeFilter]);

    if (authLoading) {
        return (
            <View className="flex-1 justify-center items-center" style={{ backgroundColor: colors.background }}>
                <ActivityIndicator size="large" color={colors.accent} />
            </View>
        );
    }

    if (!user) {
        return <SignInPromptScreen />;
    }

    return (
        <View className="flex-1" style={{ backgroundColor: colors.background }}>
            <AppHeader onMenuPress={() => setIsMenuOpen(true)} />

            {loading ? (
                <ScrollView horizontal showsHorizontalScrollIndicator={false} className="px-4 py-6">
                    {[...Array(4)].map((_, i) => (
                        <SkeletonStoryCard key={i} />
                    ))}
                </ScrollView>
            ) : items.length === 0 ? (
                <View className="flex-1 justify-center items-center px-6">
                    <Text className="font-inter text-base text-center" style={{ color: colors.subtext }}>
                        Bạn chưa có truyện nào trong thư viện đọc. Hãy bắt đầu đọc để lưu lịch sử tại đây.
                    </Text>
                </View>
            ) : (
                <ScrollView className="flex-1 px-4 pt-4" showsVerticalScrollIndicator={false}>
                    <Text
                        className="text-2xl font-inter font-bold mb-4"
                        style={{ color: colors.text }}
                    >
                        My Library
                    </Text>

                    <View className="mb-6 flex-row"  style={{ backgroundColor: colors.card }}>
                        {[
                            { key: "favorites", label: "Favorites" },
                            { key: "continue", label: "Continue Reading" },
                            { key: "completed", label: "Complete" },
                        ].map((tab) => {
                            const isActive = activeFilter === tab.key;
                            return (
                                <TouchableOpacity
                                    key={tab.key}
                                    onPress={() => setActiveFilter(tab.key as any)}
                                    className="py-2 items-center rounded-sm p-2"
                                    style={{
                                        backgroundColor: isActive ? colors.accent : "transparent",
                                    }}
                                >
                                    <Text
                                        className="font-inter text-sm"
                                        style={{ color: isActive ? "#000" : colors.text }}
                                    >
                                        {tab.label}
                                    </Text>
                                </TouchableOpacity>
                            );
                        })}
                    </View>

                    <View className="flex-row flex-wrap justify-between">
                        {filteredItems.map((item) => (
                            <View key={item.story._id} className="mb-6 w-[47%]">
                                <StoryCard
                                    story={item.story}
                                    onPress={() =>
                                        router.push({
                                            pathname: `/story/${item.story._id}` as any,
                                            params: { storyData: JSON.stringify(item.story) }
                                        })
                                    }
                                />
                                <Text
                                    className="mt-1 text-xs font-inter"
                                    style={{ color: colors.subtext }}
                                    numberOfLines={1}
                                >
                                    Đang đọc: Chương {item.lastChapterNumber} / {item.story.totalChapters || "?"}
                                </Text>
                            </View>
                        ))}
                    </View>
                </ScrollView>
            )}
            <SideMenu isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />
        </View>
    );
}
