import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, ImageBackground, TouchableOpacity, ActivityIndicator, Alert, Platform } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Play, Heart, Star, Eye, BookOpen, Clock, ChevronRight, ChevronLeft, Lock, Gem } from 'lucide-react-native';
import { AppService } from '@/services/app.service';
import { useTheme } from '@/context/ThemeContext';
import { useAuth } from '@/context/AuthContext';
import { AppContext } from '@/context/AppContext';
import { useContext } from 'react';

export default function StoryDetailScreen() {
    const { id, storyData } = useLocalSearchParams();
    const router = useRouter();
    const { colors, isDarkMode } = useTheme();
    const { user } = useAuth();
    
    // Defaulting context to empty objects/functions in case it's not wrapped (though it is)
    const appContext = useContext(AppContext);
    const showToast = appContext?.showToast || (() => {});
    const fetchBalance = appContext?.fetchBalance || (async () => {});
    const [story, setStory] = useState<any>(null);
    const [chapters, setChapters] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isLiked, setIsLiked] = useState(false);
    const [isLiking, setIsLiking] = useState(false);
    console.log("isLiked", isLiked)
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
    }, [id, storyData, user]);


    const handleChapterPress = (chapter: any, index: number) => {
        if (chapter.isPay === false) {
            handleUnlockChapter(chapter);
            return;
        }
        const cNum = chapter.chapterNumber || index + 1;
        router.push({
            pathname: `/reader/${id}/read/${cNum}` as any,
            params: { storyTitle: story.name }
        });
    };

    const handleUnlockChapter = async (chapter: any) => {

        if (!user) {
            if (Platform.OS === 'web') {
                window.alert("Please sign in to unlock chapters.");
            } else {
                Alert.alert("Sign In Required", "Please sign in to unlock chapters.");
            }
            return;
        }

        const confirmMessage = `Do you want to unlock this chapter for ${chapter.price || 50} stones?`;

        const executeUnlock = async () => {
            try {
                setLoading(true);

                await AppService.unlockChapter(id as string, chapter._id);
                if (Platform.OS === 'web') window.alert("Chapter unlocked successfully!");
                else Alert.alert("Success", "Chapter unlocked successfully!");
                await fetchChapters();
            } catch (error: any) {
                const errorMsg = error?.response?.data?.message || "Failed to unlock chapter. Please check your balance.";
                if (Platform.OS === 'web') window.alert(errorMsg);
                else Alert.alert("Error", errorMsg);
            } finally {
                setLoading(false);
            }
        };

        if (Platform.OS === 'web') {
            const result = window.confirm(confirmMessage);
            if (result) {
                executeUnlock();
            } else {
                console.log("Unlock Cancelled on Web");
            }
        } else {
            Alert.alert(
                "Unlock Chapter",
                confirmMessage,
                [
                    { text: "Cancel", style: "cancel", onPress: () => console.log("Unlock Cancelled on Mobile") },
                    { text: "Unlock", onPress: executeUnlock }
                ]
            );
        }
    };
    const checkIfLiked = async () => {
        try {
            // Use the route param (id) to avoid missing the story object when navigating directly
            if (user && id) {
                const liked = await AppService.checkIfLiked(id as string);
                setIsLiked(liked);
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
            showToast("Please sign in to save your favorite stories.", 'info');
            return;
        }

        try {
            setIsLiking(true);
            await AppService.likeStories(story._id);
            setIsLiked(!isLiked);
            const message = isLiked ? "Removed from Favorites" : "Added to Favorites";
            showToast(message, 'success');
        } catch (error) {
            console.error("Error toggling like:", error);
            showToast("Failed to update favorites. Please try again.", 'error');
        } finally {
            setIsLiking(false);
        }
    };

    if (!story) {
        // simplified skeleton mimic header and a few lines
        return (
            <ScrollView className="flex-1" style={{ backgroundColor: colors.background }}>
                <View className="w-full h-[400px] bg-gray-700 animate-pulse" />
                <View className="p-4">
                    <View className="h-6 bg-gray-600 rounded mb-2 w-3/4 animate-pulse" />
                    <View className="h-4 bg-gray-600 rounded mb-4 w-1/2 animate-pulse" />
                    <View className="h-4 bg-gray-600 rounded mb-2 w-full animate-pulse" />
                    <View className="h-4 bg-gray-600 rounded mb-2 w-full animate-pulse" />
                    <View className="h-4 bg-gray-600 rounded mb-2 w-2/3 animate-pulse" />
                </View>
            </ScrollView>
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
            <ScrollView className="flex-1" showsVerticalScrollIndicator={false} bounces={false} keyboardShouldPersistTaps="handled">
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
                    </View>

                    <View className="mb-10 items-start">
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
                                    activeOpacity={0.7}
                                    className="rounded-xl p-[18px] flex-row items-center justify-between"
                                    style={{ backgroundColor: colors.card, opacity: chapter.isPay === false ? 0.8 : 1 }}
                                    onPress={() => handleChapterPress(chapter, index)}
                                >
                                    <View className="flex-row items-center flex-1">
                                        {chapter.isPay === false ? (
                                            <View className="w-10 h-10 items-center justify-center mr-4">
                                                <Lock color={colors.text} size={20} />
                                            </View>
                                        ) : (
                                            <View className="w-10 h-10 rounded-full items-center justify-center mr-4" style={{ backgroundColor: colors.border }}>
                                                <Text className="font-bold text-[15px] font-inter" style={{ color: colors.text }}>{chapter.chapterNumber || index + 1}</Text>
                                            </View>
                                        )}
                                        <View className="flex-1 pr-4">
                                            <Text className="font-bold text-[15px] mb-[4px] font-inter" style={{ color: chapter.isPay === false ? colors.accent : colors.text }} numberOfLines={1}>
                                                {chapter.title || `Chapter ${chapter.chapterNumber || index + 1}`}
                                            </Text>
                                            <View className="flex-row items-center flex-wrap">
                                                <Text className="text-[13px] font-inter" style={{ color: colors.subtext }}>
                                                    {chapter.wordCount ? `${chapter.wordCount} words • ` : ''}{formatDate(chapter.createdAt || new Date().toISOString())}
                                                </Text>
                                                {chapter.isPay === false && (
                                                    <View className="flex-row items-center ml-2">
                                                        <Gem size={12} color="#F59E0B" />
                                                        <Text className="text-[13px] ml-1 font-inter font-bold text-amber-500">
                                                            50 stones
                                                        </Text>
                                                    </View>
                                                )}
                                            </View>
                                        </View>
                                    </View>
                                    {chapter.isPay === false ? (
                                        <View className="flex-row items-center px-4 py-2 rounded-lg" style={{ backgroundColor: colors.border }}>
                                            <Lock color={colors.text} size={14} />
                                            <Text className="ml-2 font-bold font-inter text-[13px]" style={{ color: colors.text }}>Unlock</Text>
                                        </View>
                                    ) : (
                                        <ChevronRight color={colors.iconMuted} size={20} />
                                    )}
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
