import React, { useEffect, useState, useRef } from "react";
import { View, Text, TouchableOpacity, ScrollView, TextInput, ActivityIndicator, Animated, Platform } from "react-native";
import { useAuth } from "@/context/AuthContext";
import { AppService } from "@/services/app.service";
import { router } from "expo-router";
import { BookOpen, Sun, Moon, Menu, Search, Sparkles, Heart } from "lucide-react-native";
import SideMenu from "@/components/SideMenu";
import { useTheme } from "@/context/ThemeContext";
import StoryCard from "@/components/StoryCard";
import SkeletonStoryCard from "@/components/SkeletonStoryCard";
import AppHeader from "@/components/AppHeader";

export default function HomeScreen() {
    const { user, signOut } = useAuth();
    const { toggleTheme, isDarkMode, colors } = useTheme();
    const [loading, setLoading] = useState(true);
    const skeletonOpacity = useRef(new Animated.Value(1)).current;
    const [homeData, setHomeData] = useState<any>(null);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const useNativeDriver = Platform.OS !== 'web';

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const data = await AppService.getHomeStories();
            setHomeData(data);
        } catch (error) {
            console.error("Error fetching home data:", error);
        } finally {
            setLoading(false);
            // fade out skeleton
            Animated.timing(skeletonOpacity, {
                toValue: 0,
                duration: 300,
                useNativeDriver,
            }).start();
        }
    };

    const newest = homeData?.newest || [];
    const topViewed = homeData?.topViewed || [];
    const topLiked = homeData?.topLiked || [];
    const recommended = homeData?.recommended || [];

    const renderStorySection = (title: string, icon: any, data: any[]) => {
        if (!data || data.length === 0) return null;

        return (
            <View className="px-6 pb-12">
                <View className="flex-row justify-between items-center mb-6">
                    <View className="flex-row items-center gap-2">
                        {icon}
                        <Text className="text-xl font-inter font-bold pt-1" style={{ color: colors.text }}>
                            {title}
                        </Text>
                    </View>
                    <TouchableOpacity onPress={() => router.push("/(tabs)/search")}>
                        <Text className="text-sm font-inter" style={{ color: colors.iconMuted }}>Xem Tất Cả &gt;</Text>
                    </TouchableOpacity>
                </View>

                <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row">
                    {data.map((item: any) => (
                        <StoryCard
                            key={item._id}
                            story={item}
                            onPress={() => router.push({
                                pathname: `/story/${item._id}` as any,
                                params: { storyData: JSON.stringify(item) }
                            })}
                        />
                    ))}
                </ScrollView>
            </View>
        );
    };

    return (
        <View className="flex-1" style={{ backgroundColor: colors.background }}>
            <AppHeader onMenuPress={() => setIsMenuOpen(true)} />

            <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
                <View className="px-6 py-10 items-center">
                    <Text className="text-[32px] font-inter font-bold text-center mb-4 leading-tight" style={{ color: colors.text }}>
                        Khám Phá Truyện Mới
                    </Text>
                    <View className="w-64 h-10 mb-6 rounded-sm" style={{ backgroundColor: colors.accent }}></View>
                    <Text className="text-center text-[15px] font-inter px-2 leading-relaxed" style={{ color: colors.subtext }}>
                        Hòa mình vào những bộ truyện hấp dẫn từ các tác giả tài năng trên toàn thế giới
                    </Text>
                </View>

                <TouchableOpacity onPress = {() => {router.push("/(tabs)/search")}}>
                    <View className="px-6 mb-12">
                        <View className="flex-row items-center rounded-xl px-4 py-3 border border-transparent" style={{ backgroundColor: colors.inputBackground }}>
                            <Search color={colors.iconMuted} size={20} className="mr-3" />
                            <TextInput
                                placeholder="Tìm kiếm truyện, tác giả, hoặc thể loại..."
                                placeholderTextColor={colors.iconMuted}
                                className="flex-1 font-inter text-sm"
                                style={{ color: colors.text }}
                            />
                        </View>
                    </View>
                </TouchableOpacity>

                {loading ? (
                    <Animated.View style={{ opacity: skeletonOpacity }}>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="px-6">
                            {[...Array(4)].map((_, i) => (
                                <SkeletonStoryCard key={i} />
                            ))}
                        </ScrollView>
                    </Animated.View>
                ) : (
                    <View>
                        {renderStorySection("Đề Cử Cho Bạn", <Sparkles color={colors.accent} size={22} />, recommended)}
                        {renderStorySection("Truyện Mới Cập Nhật", <BookOpen color={colors.accent} size={22} />, newest)}
                        {renderStorySection("Nhiều Lượt Đọc Nhất", <Sun color={colors.accent} size={22} />, topViewed)}
                        {renderStorySection("Được Yêu Thích Nhất", <Heart color={colors.accent} size={22} />, topLiked)}

                        {(!recommended.length && !newest.length && !topViewed.length && !topLiked.length) && (
                            <Text className="font-inter text-center flex-1 py-10" style={{ color: colors.subtext }}>
                                Không có dữ liệu truyện
                            </Text>
                        )}
                    </View>
                )}
            </ScrollView>
            <SideMenu isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />
        </View>
    );
}