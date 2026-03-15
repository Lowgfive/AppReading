import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, StatusBar, Platform, SafeAreaView } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ChevronLeft, ChevronRight, Home, Settings, Lock } from 'lucide-react-native';
import { AppService } from '@/services/app.service';
import { useTheme } from '@/context/ThemeContext';
import { useToast } from '@/context/ToastContext';

export default function ReaderScreen() {
    const { storyId, chapterNumber, storyTitle } = useLocalSearchParams();
    const router = useRouter();
    const { colors, isDarkMode } = useTheme();
    const { showToast } = useToast();
    const [chapter, setChapter] = useState<any>(null);
    const [chapters, setChapters] = useState<any[]>([]);
    const [totalChapters, setTotalChapters] = useState<number>(0);
    const [loading, setLoading] = useState(true);

    const currentChapterNum = Number(chapterNumber) || 1;

    useEffect(() => {
        const fetchStoryData = async () => {
            try {
                const [storyRes, chaptersRes] = await Promise.all([
                    AppService.getStoryById(storyId as string),
                    AppService.getStoryChapters(storyId as string)
                ]);

                if (storyRes) {
                    setTotalChapters(storyRes.chapterCount || storyRes.totalChapters || 0);
                }

                if (chaptersRes) {
                    const chapterList = chaptersRes.chapters || chaptersRes || [];
                    setChapters(chapterList);
                    
                    if (totalChapters === 0 && chapterList.length > 0) {
                        setTotalChapters(chapterList.length);
                    }
                }
            } catch (error) {
                console.error("Error fetching story or chapters:", error);
            }
        };

        if (storyId) {
            fetchStoryData();
        }
    }, [storyId]);

    useEffect(() => {
        fetchChapterContent();
    }, [storyId, currentChapterNum]);

    const fetchChapterContent = async () => {
        try {
            setLoading(true);
            const data = await AppService.getChapterContent(storyId as string, currentChapterNum);
            setChapter(data.chapter || data);
        } catch (error: any) {
            console.error("Error fetching chapter content:", error);
            if (error.response?.status === 403 || error.response?.data?.message?.includes('locked')) {
                showToast("This chapter is locked. Please purchase it first.", "error");
            }
        } finally {
            setLoading(false);
        }
    };

    const getChapterStatus = (num: number) => {
        if (chapters.length === 0) return true;
        const targetChapter = chapters.find(c => (c.chapterNumber || chapters.indexOf(c) + 1) === num);
        return targetChapter ? targetChapter.isPay !== false : true;
    };

    const handlePrevChapter = () => {
        if (currentChapterNum <= 1) return;
        
        const isUnlocked = getChapterStatus(currentChapterNum - 1);
        if (!isUnlocked) {
            showToast("This chapter is locked. Please purchase it first.", "error");
            return;
        }

        router.replace({
            pathname: `/reader/${storyId}/read/${currentChapterNum - 1}` as any,
            params: { storyTitle }
        });
    };

    const handleNextChapter = () => {
        if (totalChapters > 0 && currentChapterNum >= totalChapters) return;

        const isUnlocked = getChapterStatus(currentChapterNum + 1);
        if (!isUnlocked) {
            showToast("This chapter is locked. Please purchase it first.", "error");
            return;
        }

        router.replace({
            pathname: `/reader/${storyId}/read/${currentChapterNum + 1}` as any,
            params: { storyTitle }
        });
    };

    if (loading) {
        return (
            <SafeAreaView className="flex-1 justify-center items-center" style={{ backgroundColor: colors.background }}>
                <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} backgroundColor={colors.background} />
                <ActivityIndicator size="large" color={colors.accent} />
            </SafeAreaView>
        );
    }

    if (!chapter) {
        return (
            <SafeAreaView className="flex-1" style={{ backgroundColor: colors.background }}>
                <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} backgroundColor={colors.background} />
                <View className="flex-row items-center justify-between px-4 py-3 border-b" style={{ borderBottomColor: colors.border }}>
                    <View className="flex-row items-center flex-1">
                        <TouchableOpacity onPress={() => router.back()} className="p-2 mr-2">
                            <ChevronLeft color={colors.icon} size={24} />
                        </TouchableOpacity>
                        <View className="flex-1">
                            <Text className="font-bold text-[15px]" style={{ color: colors.text }} numberOfLines={1}>{storyTitle || 'Story'}</Text>
                        </View>
                    </View>
                </View>
                <View className="flex-1 justify-center items-center px-6">
                    <Text className="font-inter text-center leading-relaxed" style={{ color: colors.subtext }}>Chapter cannot be loaded. It might not exist.</Text>
                </View>
                <View className="flex-row items-center justify-between px-6 py-4 rounded-t-3xl border-t" style={{ backgroundColor: colors.card, borderTopColor: colors.border }}>
                    <TouchableOpacity
                        onPress={handlePrevChapter}
                        disabled={currentChapterNum <= 1}
                        className={`p-2 ${currentChapterNum <= 1 ? 'opacity-30' : 'opacity-100'}`}
                    >
                        <ChevronLeft color={colors.icon} size={24} />
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={handleNextChapter}
                        className="p-2"
                    >
                        <ChevronRight color={colors.icon} size={24} />
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        );
    }

    const displayTotalChapters = totalChapters > 0 ? totalChapters : '...';
    const nextChapterUnlocked = getChapterStatus(currentChapterNum + 1);

    return (
        <SafeAreaView className="flex-1" style={{ backgroundColor: colors.background }}>
            <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} backgroundColor={colors.background} />

            <View className="flex-row items-center justify-between px-4 py-3 border-b" style={{ borderBottomColor: colors.border }}>
                <View className="flex-row items-center flex-1 pr-4">
                    <TouchableOpacity onPress={() => router.back()} className="p-2 mr-2">
                        <ChevronLeft color={colors.icon} size={24} />
                    </TouchableOpacity>
                    <View className="flex-1">
                        <Text className="font-bold text-[15px]" style={{ color: colors.text }} numberOfLines={1}>
                            {storyTitle || chapter.story?.name || 'Story'}
                        </Text>
                        <Text className="text-xs mt-1" style={{ color: colors.subtext }} numberOfLines={1}>
                            Chapter {currentChapterNum}: {chapter.title || 'Untitled'}
                        </Text>
                    </View>
                </View>
                <View className="flex-row items-center">
                    <TouchableOpacity onPress={() => router.push('/(tabs)/home')} className="p-2">
                        <Home color={colors.icon} size={22} />
                    </TouchableOpacity>
                    <TouchableOpacity className="p-2 ml-2">
                        <Settings color={colors.icon} size={22} />
                    </TouchableOpacity>
                </View>
            </View>

            <ScrollView
                className="flex-1 px-5"
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingTop: 24, paddingBottom: 40 }}
            >
                <Text className="font-inter text-2xl font-bold mb-2" style={{ color: colors.text }}>
                    Chapter {currentChapterNum}: {chapter.title || 'Untitled'}
                </Text>

                <Text className="text-sm mb-8" style={{ color: colors.subtext }}>
                    {chapter.wordCount || chapter.content?.split(' ').length || 0} words
                </Text>

                <Text className="font-inter text-[18px] leading-[32px] mb-8" style={{ color: colors.text }}>
                    {chapter.content || "No content found for this chapter. The backend might have an empty string..."}
                </Text>
            </ScrollView>

            <View className="flex-row items-center justify-between px-6 py-4 rounded-t-3xl border-t" style={{ backgroundColor: colors.card, borderTopColor: colors.border }}>
                <TouchableOpacity
                    onPress={handlePrevChapter}
                    disabled={currentChapterNum <= 1}
                    className={`nav-button p-2 ${currentChapterNum <= 1 ? 'opacity-30' : 'opacity-100'}`}
                >
                    <ChevronLeft color={colors.icon} size={24} />
                </TouchableOpacity>

                <Text className="font-inter text-[15px] tracking-widest" style={{ color: colors.text }}>
                    {currentChapterNum} / {displayTotalChapters}
                </Text>

                <TouchableOpacity
                    onPress={handleNextChapter}
                    disabled={totalChapters > 0 && currentChapterNum >= totalChapters}
                    className={`nav-button p-2 ${(totalChapters > 0 && currentChapterNum >= totalChapters) ? 'opacity-30' : 'opacity-100'}`}
                >
                    {nextChapterUnlocked ? (
                        <ChevronRight color={colors.icon} size={24} />
                    ) : (
                        <Lock color={colors.accent} size={20} />
                    )}
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}
