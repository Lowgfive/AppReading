import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, ScrollView, ImageBackground, TextInput, ActivityIndicator } from "react-native";
import { useAuth } from "@/context/AuthContext";
import { AppService } from "@/services/app.service";
import { router } from "expo-router";
import { BookOpen, Sun, Menu, Search, Sparkles, MessageSquare, Star, Eye, Heart } from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";
import SideMenu from "@/components/SideMenu";

export default function HomeScreen() {
    const { user, signOut } = useAuth();
    const [loading, setLoading] = useState(true);
    const [homeData, setHomeData] = useState<any>(null);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    console.log(homeData)
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
        }
    };


    const renderStoryCard = (item: any, index: number) => {
        // Fallback info if not available from API
        const author = item.userId.username || "Tác giả ẩn danh";
        const rating = (item.likeCount || 4.8).toFixed(1);
        const views = item.viewCount >= 1000 ? `${(item.viewCount / 1000).toFixed(1)}K` : (item.viewCount || 0);
        const comments = item.commentCount || 0; // Comment temporarily 0 as requested

        return (
            <TouchableOpacity
                key={item._id || index}
                className="mr-4 w-36 rounded-xl overflow-hidden mb-2"
                onPress={() => router.push({
                    pathname: `/story/${item._id}` as any,
                    params: { storyData: JSON.stringify(item) }
                })}
            >
                {/* Image Section */}
                <View className="w-full h-48 rounded-xl overflow-hidden bg-[#2A2A2A]">
                    {item.image ? (
                        <ImageBackground
                            source={{ uri: item.image }}
                            className="w-full h-full"
                            resizeMode="cover"
                        >
                            <LinearGradient
                                colors={['rgba(0,0,0,0.6)', 'transparent', 'rgba(0,0,0,0.8)']}
                                className="w-full h-full p-2 justify-between"
                            >
                                {/* Top Badge */}
                                <View className="self-start bg-[#121212]/90 px-3 py-1 rounded-full border border-gray-700">
                                    <Text className="text-gray-200 text-[10px] font-bold">
                                        {item.status === 'COMPLETED' ? 'Completed' : 'Ongoing'}
                                    </Text>
                                </View>

                                {/* Bottom Image Content (Genres) */}
                                <View className="mt-auto items-start">
                                    <View className="bg-[#121212]/90 px-3 py-1 rounded-full border border-gray-700 mb-1">
                                        <Text className="text-gray-200 text-[10px] font-bold">{item.type || "Fantasy"}</Text>
                                    </View>
                                </View>
                            </LinearGradient>
                        </ImageBackground>
                    ) : (
                        <View className="w-full h-full justify-between p-2 bg-[#2A2A2A]">
                            <View className="self-start bg-[#121212] px-3 py-1 rounded-full border border-gray-700">
                                <Text className="text-gray-200 text-[10px] font-bold">
                                    {item.status === 'COMPLETED' ? 'Completed' : 'Ongoing'}
                                </Text>
                            </View>
                            <View className="flex-1 justify-center items-center">
                                <Text className="text-gray-500 font-serifClassic text-xs">No Cover</Text>
                            </View>
                            <View className="mt-auto items-start">
                                <View className="bg-[#121212] px-3 py-1 rounded-full border border-gray-700 mb-1">
                                    <Text className="text-gray-200 text-[10px] font-bold">{item.type || "Fantasy"}</Text>
                                </View>
                            </View>
                        </View>
                    )}
                </View>

                {/* Info Text Section Below Image */}
                <View className="mt-2 px-1">
                    {/* Title */}
                    <Text className="text-[#F19C38] font-serifClassic font-bold text-[15px] mb-1 leading-tight" numberOfLines={1}>
                        {item.name}
                    </Text>

                    {/* Author */}
                    <Text className="text-gray-400 text-[11px] mb-2" numberOfLines={1}>
                        {author}
                    </Text>

                    {/* Stats Row */}
                    <View className="flex-row items-center gap-2">
                        <View className="flex-row items-center">
                            <Heart  color="#F19C38" fill="#F19C38" size={12} />
                            <Text className="text-gray-400 text-[10px] ml-1">{rating}</Text>
                        </View>
                        <View className="flex-row items-center">
                            <Eye color="#A0A0A0" size={12} />
                            <Text className="text-gray-400 text-[10px] ml-1">{views}</Text>
                        </View>
                        <View className="flex-row items-center">
                            <MessageSquare color="#A0A0A0" size={12} />
                            <Text className="text-gray-400 text-[10px] ml-1">{comments}</Text>
                        </View>
                    </View>
                </View>
            </TouchableOpacity>
        );
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
                        <Text className="text-white text-xl font-serifClassic font-bold pt-1">{title}</Text>
                    </View>
                    <TouchableOpacity>
                        <Text className="text-[#A0A0A0] text-sm font-serifClassic">Xem Tất Cả &gt;</Text>
                    </TouchableOpacity>
                </View>

                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    className="flex-row"
                >
                    {data.map((item: any, index: number) => renderStoryCard(item, index))}
                </ScrollView>
            </View>
        );
    };

    return (
        <View className="flex-1 bg-[#121212] pt-10">
            {/* Top Bar */}
            <View className="flex-row justify-between items-center px-4 py-4 border-b border-gray-800">
                <View className="flex-row items-center gap-2">
                    <BookOpen color="#E08A2A" size={24} />
                    <Text className="text-white font-serifClassic text-xl font-bold pt-1">Storytime</Text>
                </View>
                <View className="flex-row items-center gap-4">
                    <TouchableOpacity>
                        <Sun color="#A0A0A0" size={22} />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => setIsMenuOpen(true)}>
                        <Menu color="#A0A0A0" size={24} />
                    </TouchableOpacity>
                </View>
            </View>

            <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
                {/* Hero Section */}
                <View className="px-6 py-10 items-center">
                    <Text className="text-white text-[32px] font-serifClassic font-bold text-center mb-4 leading-tight">
                        Khám Phá Truyện Mới
                    </Text>
                    <View className="bg-[#E08A2A] w-64 h-10 mb-6 rounded-sm"></View>
                    <Text className="text-[#A0A0A0] text-center text-[15px] font-serifClassic px-2 leading-relaxed">
                        Hòa mình vào những bộ truyện hấp dẫn từ các tác giả tài năng trên toàn thế giới
                    </Text>
                </View>

                {/* Search Bar */}
                <View className="px-6 mb-12">
                    <View className="flex-row items-center bg-[#202020] rounded-xl px-4 py-3 border border-transparent focus:border-gray-700">
                        <Search color="#808080" size={20} className="mr-3" />
                        <TextInput
                            placeholder="Tìm kiếm truyện, tác giả, hoặc thể loại..."
                            placeholderTextColor="#808080"
                            className="flex-1 text-white font-serifClassic text-sm"
                        />
                    </View>
                </View>

                {/* Story Sections */}
                {loading ? (
                    <View className="py-10">
                        <ActivityIndicator size="large" color="#E08A2A" />
                    </View>
                ) : (
                    <View>
                        {renderStorySection("Đề Cử Cho Bạn", <Sparkles color="#E08A2A" size={22} />, recommended)}
                        {renderStorySection("Truyện Mới Cập Nhật", <BookOpen color="#E08A2A" size={22} />, newest)}
                        {renderStorySection("Nhiều Lượt Đọc Nhất", <Sun color="#E08A2A" size={22} />, topViewed)}
                        {renderStorySection("Được Yêu Thích Nhất", <Sun color="#E08A2A" size={22} />, topLiked)}

                        {(!recommended.length && !newest.length && !topViewed.length && !topLiked.length) && (
                            <Text className="text-gray-500 font-serifClassic text-center flex-1 py-10">
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