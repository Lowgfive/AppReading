import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, ImageBackground, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Play, Heart, Star, Eye, BookOpen, Clock, ChevronRight, ChevronLeft } from 'lucide-react-native';
import { AppService } from '@/services/app.service';
import { useTheme } from '@/context/ThemeContext';
import { useAuth } from '@/context/AuthContext';

export default function StoryDetailScreen() {
    const { id, storyData } = useLocalSearchParams();
    const router = useRouter();
    const { colors, isDarkMode } = useTheme();
    const { user } = useAuth();
    const [story, setStory] = useState<any>(null);
    const [chapters, setChapters] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isLiked, setIsLiked] = useState(false);
    const [isLiking, setIsLiking] = useState(false);

    useEffect(() => {
        if (storyData) {
            try {
                setStory(JSON.parse(storyData as string));
            } catch (e) {
                console.error("Failed to parse story data", e);
            }
        }
        fetchChapters();
        checkIfLiked();
    }, [id, storyData]);

    const checkIfLiked = async () => {
        try {
            if (user) {
                const likedRes = await AppService.likeStories(story._id);
                if (likedRes && likedRes.result && likedRes.result.length > 0) {
                    const likedStoryIds = likedRes.result[0].stories.map((story: any) => story._id);
                    setIsLiked(likedStoryIds.includes(id));
                }
            }
        } catch (error) {
            console.error("Error checking if story is liked:", error);
        }
    };

    const fetchChapters = async () => {
        try {
            setLoading(true);
            const data = await AppService.getStoryChapters(id as string);
            setChapters(data?.chapters || data || []);
        } catch (error) {
            console.error("Error fetching chapters:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddToFavorites = async () => {
        if (!user) {
            Alert.alert("Sign In Required", "Please sign in to save your favorite stories.");
            return;
        }

        try {
            setIsLiking(true);
            await AppService.likeStories(story._id);
            setIsLiked(!isLiked);
            const message = isLiked ? "Removed from Favorites" : "Added to Favorites";
            Alert.alert("Success", message);
        } catch (error) {
            console.error("Error toggling like:", error);
            Alert.alert("Error", "Failed to update favorites. Please try again.");
        } finally {
            setIsLiking(false);
        }
    };

    if (!story) {
        return (
            <View className="flex-1 justify-center items-center" style={{ backgroundColor: colors.background }}>
                <ActivityIndicator size="large" color={colors.accent} />
            </View>
        );
    }

    const author = story.userId?.username || "Tác giả ẩn danh";
    const rating = (story.rating || 4.8).toFixed(1);
    const views = story.viewCount >= 1000 ? `${(story.viewCount / 1000).toFixed(1)}K` : (story.viewCount || 0);
    const formatDate = (dateString: string) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    };

    const gradientColors = (isDarkMode 
        ? ['rgba(18,18,18,0.4)', 'rgba(18,18,18,0.8)', '#121212'] 
        : ['rgba(255,255,255,0.4)', 'rgba(255,255,255,0.8)', '#FFFFFF']) as [string, string, string];

    const fallbackGradientColors = (isDarkMode
        ? ['#2A2A2A', '#1A1A1A', '#121212']
        : ['#E5E5E5', '#F5F5F5', '#FFFFFF']) as [string, string, string];

    return (
        <View className="flex-1" style={{ backgroundColor: colors.background }}>
            <ScrollView className="flex-1" showsVerticalScrollIndicator={false} bounces={false}>
                <View className="w-full h-[400px]">
                    {story.image ? (
                        <ImageBackground
                            source={{ uri: story.image }}
                            className="w-full h-full"
                            resizeMode="cover"
                        >
                            <LinearGradient
                                colors={gradientColors}
                                className="w-full h-full px-5 pt-14 pb-4 justify-between"
                            >
                                <TouchableOpacity onPress={() => router.back()} className="w-10 h-10 rounded-full items-center justify-center" style={{ backgroundColor: colors.overlay }}>
                                    <ChevronLeft color={colors.text} size={24} />
                                </TouchableOpacity>

                                <View className="mt-auto">
                                    <Text className="font-inter text-4xl font-bold mb-3 leading-tight" style={{ color: colors.text }}>
                                        {story.name}
                                    </Text>
                                    <Text className="text-[15px] mb-4 font-inter" style={{ color: colors.subtext }}>
                                        by <Text className="font-semibold" style={{ color: colors.text }}>{author}</Text>
                                    </Text>

                                    <View className="flex-row gap-2 mb-4">
                                        <View className="border rounded-full px-4 py-[3px]" style={{ borderColor: colors.subtext }}>
                                            <Text className="text-xs font-semibold font-inter" style={{ color: colors.text }}>{story.type || "Fantasy"}</Text>
                                        </View>
                                    </View>

                                    <View className="flex-row items-center gap-4 flex-wrap">
                                        <View className="flex-row items-center">
                                            <Star color={colors.accentLight} fill={colors.accentLight} size={14} />
                                            <Text className="text-xs ml-[6px] font-inter" style={{ color: colors.text }}>{rating} rating</Text>
                                        </View>
                                        <View className="flex-row items-center">
                                            <Eye color={colors.iconMuted} size={14} />
                                            <Text className="text-xs ml-[6px] font-inter" style={{ color: colors.text }}>{views} views</Text>
                                        </View>
                                        <View className="flex-row items-center">
                                            <BookOpen color={colors.iconMuted} size={14} />
                                            <Text className="text-xs ml-[6px] font-inter" style={{ color: colors.text }}>{chapters.length || story.chapterCount || 0} chapters</Text>
                                        </View>
                                    </View>

                                    <View className="flex-row items-center mt-3">
                                        <Clock color={colors.iconMuted} size={14} />
                                        <Text className="text-xs ml-[6px] font-inter" style={{ color: colors.subtext }}>
                                            Updated {formatDate(story.createdDate || story.updatedAt || new Date().toISOString())}
                                        </Text>
                                    </View>
                                </View>
                            </LinearGradient>
                        </ImageBackground>
                    ) : (
                        <LinearGradient
                            colors={fallbackGradientColors}
                            className="w-full h-full px-5 pt-14 pb-4 justify-between"
                        >
                            <TouchableOpacity onPress={() => router.back()} className="w-10 h-10 rounded-full items-center justify-center" style={{ backgroundColor: colors.overlay }}>
                                <ChevronLeft color={colors.text} size={24} />
                            </TouchableOpacity>

                            <View className="mt-auto">
                                <Text className="font-inter text-4xl font-bold mb-3 leading-tight" style={{ color: colors.text }}>
                                    {story.name}
                                </Text>
                                <Text className="text-[15px] mb-4 font-inter" style={{ color: colors.subtext }}>
                                    by <Text className="font-semibold" style={{ color: colors.text }}>{author}</Text>
                                </Text>

                                <View className="flex-row gap-2 mb-4">
                                    <View className="border rounded-full px-4 py-[3px]" style={{ borderColor: colors.subtext }}>
                                        <Text className="text-xs font-semibold font-inter" style={{ color: colors.text }}>{story.type || "Fantasy"}</Text>
                                    </View>
                                </View>

                                <View className="flex-row items-center gap-4 flex-wrap">
                                    <View className="flex-row items-center">
                                        <Star color={colors.accentLight} fill={colors.accentLight} size={14} />
                                        <Text className="text-xs ml-[6px] font-inter" style={{ color: colors.text }}>{rating} rating</Text>
                                    </View>
                                    <View className="flex-row items-center">
                                        <Eye color={colors.iconMuted} size={14} />
                                        <Text className="text-xs ml-[6px] font-inter" style={{ color: colors.text }}>{views} views</Text>
                                    </View>
                                    <View className="flex-row items-center">
                                        <BookOpen color={colors.iconMuted} size={14} />
                                        <Text className="text-xs ml-[6px] font-inter" style={{ color: colors.text }}>{chapters.length || story.chapterCount || 0} chapters</Text>
                                    </View>
                                </View>

                                <View className="flex-row items-center mt-3">
                                    <Clock color={colors.iconMuted} size={14} />
                                    <Text className="text-xs ml-[6px] font-inter" style={{ color: colors.subtext }}>
                                        Updated {formatDate(story.createdDate || story.updatedAt || new Date().toISOString())}
                                    </Text>
                                </View>
                            </View>
                        </LinearGradient>
                    )}
                </View>

                {/* Content Section */}
                <View className="px-6 py-2">
                    <Text className="text-[15px] leading-[26px] mb-7 font-inter" style={{ color: colors.text }}>
                        {story.description || "In a world where books have become forbidden, one librarian guards the last sanctuary of stories. When a mysterious stranger arrives seeking a particular volume, she must decide whether to protect her secrets or risk everything for the truth."}
                    </Text>

                    <View className="gap-3 mb-10 items-start">
                        <TouchableOpacity className="flex-row items-center pl-6 pr-8 py-[14px] rounded-xl flex min-w-[190px]" style={{ backgroundColor: colors.accent }}>
                            <Play fill="#000" color="#000" size={16} className="mr-3" />
                            <Text className="text-black font-semibold text-[15px] font-inter">Read Now</Text>
                        </TouchableOpacity>
                        <TouchableOpacity 
                            disabled={isLiking}
                            onPress={handleAddToFavorites}
                            className="flex-row items-center pl-6 pr-8 border py-[14px] rounded-xl bg-transparent min-w-[190px]" 
                            style={{ 
                                borderColor: isLiked ? colors.accent : colors.accent,
                                backgroundColor: isLiked ? `${colors.accent}10` : 'transparent'
                            }}
                        >
                            {isLiking ? (
                                <ActivityIndicator size={16} color={colors.accent} className="mr-3" />
                            ) : (
                                <Heart 
                                    color={isLiked ? colors.accent : colors.accent} 
                                    fill={isLiked ? colors.accent : 'transparent'}
                                    size={16} 
                                    className="mr-3" 
                                />
                            )}
                            <Text 
                                className="font-medium text-[15px] font-inter" 
                                style={{ color: colors.accent, opacity: isLiking ? 0.6 : 1 }}
                            >
                                {isLiked ? "Added to Favorites" : "Add to Favorites"}
                            </Text>
                        </TouchableOpacity>
                    </View>

                    <Text className="text-[22px] font-inter font-bold mb-5" style={{ color: colors.text }}>
                        Chapters ({chapters.length || 0})
                    </Text>

                    {loading ? (
                        <ActivityIndicator size="large" color={colors.accent} className="mt-8 mb-12" />
                    ) : (
                        <View className="gap-3 mb-12">
                            {chapters.length > 0 ? chapters.map((chapter: any, index: number) => (
                                <TouchableOpacity
                                    key={chapter._id || index}
                                    className="rounded-xl p-[18px] flex-row items-center justify-between"
                                    style={{ backgroundColor: colors.card }}
                                    onPress={() => {
                                        const cNum = chapter.chapterNumber || index + 1;
                                        router.push({
                                            pathname: `/reader/${id}/read/${cNum}` as any,
                                            params: { storyTitle: story.name }
                                        });
                                    }}
                                >
                                    <View className="flex-row items-center flex-1">
                                        <View className="w-10 h-10 rounded-full items-center justify-center mr-4" style={{ backgroundColor: colors.border }}>
                                            <Text className="font-bold text-[15px] font-inter" style={{ color: colors.text }}>{chapter.chapterNumber || index + 1}</Text>
                                        </View>
                                        <View className="flex-1 pr-4">
                                            <Text className="font-bold text-[15px] mb-[6px] font-inter" style={{ color: colors.text }} numberOfLines={1}>
                                                {chapter.title || `Chapter ${chapter.chapterNumber || index + 1}`}
                                            </Text>
                                            <Text className="text-[13px] font-inter" style={{ color: colors.subtext }}>
                                                {chapter.wordCount || (Math.floor(Math.random() * (3000 - 1500 + 1) + 1500))} words • {formatDate(chapter.createdAt || new Date().toISOString())}
                                            </Text>
                                        </View>
                                    </View>
                                    <ChevronRight color={colors.iconMuted} size={20} />
                                </TouchableOpacity>
                            )) : (
                                <Text className="font-inter text-center py-8 text-[15px]" style={{ color: colors.subtext }}>There are no chapters available yet.</Text>
                            )}
                        </View>
                    )}
                </View>
            </ScrollView>
        </View>
    );
}
