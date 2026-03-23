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
    const [locked, setLocked] = useState(false);

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
                    if (chapterList.length > 0) {
                        setTotalChapters((prev) => (prev > 0 ? prev : chapterList.length));
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
        // Guard: if metadata says this chapter is locked, block access immediately.
        if (!storyId) return;

        const meta = getChapterMeta(currentChapterNum);
        if (meta && meta.isPay === false) {
            setLocked(true);
            setChapter(null);
            setLoading(false);
            showToast("This chapter is locked. Please purchase it first.", "error");
            return;
        }

        setLocked(false);
        fetchChapterContent();
    }, [storyId, currentChapterNum, chapters]);

    const fetchChapterContent = async () => {
        try {
            setLoading(true);
            setLocked(false);
            const data = await AppService.getChapterContent(storyId as string, currentChapterNum);
            setChapter(data.chapter || data);
        } catch (error: any) {
            console.error("Error fetching chapter content:", error);
            if (error.response?.status === 403 || error.response?.data?.message?.includes('locked')) {
                setLocked(true);
                setChapter(null);
                showToast("This chapter is locked. Please purchase it first.", "error");
            }
        } finally {
            setLoading(false);
        }
    };

    const getChapterMeta = (num: number) => {
        if (!chapters || chapters.length === 0) return null;
        return (
            chapters.find((c, idx) => (c.chapterNumber ?? idx + 1) === num) ?? null
        );
    };

    const getChapterStatus = (num: number) => {
        // Treat "unknown" as locked to avoid navigating into paid chapters
        // before we have metadata (backend will also enforce).
        const meta = getChapterMeta(num);
        if (!meta) return false;
        return meta.isPay !== false;
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

    if (locked) {
        const displayTotalChapters = totalChapters > 0 ? totalChapters : '...';
        const prevUnlocked = currentChapterNum > 1 && getChapterStatus(currentChapterNum - 1);
        const nextUnlocked =
            !(totalChapters > 0 && currentChapterNum >= totalChapters) && getChapterStatus(currentChapterNum + 1);

        return (
            <SafeAreaView className="flex-1" style={{ backgroundColor: colors.background }}>
                <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} backgroundColor={colors.background} />
                <View className="flex-row items-center justify-between px-4 py-3 border-b" style={{ borderBottomColor: colors.border }}>
                    <View className="flex-row items-center flex-1">
                        <TouchableOpacity onPress={() => router.back()} className="p-2 mr-2">
                            <ChevronLeft color={colors.icon} size={24} />
                        </TouchableOpacity>
                        <View className="flex-1">
                            <Text className="font-bold text-[15px]" style={{ color: colors.text }} numberOfLines={1}>
                                {storyTitle || 'Story'}
                            </Text>
                            <Text className="text-xs mt-1" style={{ color: colors.subtext }} numberOfLines={1}>
                                Chapter {currentChapterNum}
                            </Text>
                        </View>
                    </View>
                </View>

                <View className="flex-1 justify-center items-center px-6">
                    <Lock color={colors.accent} size={40} />
                    <Text className="font-inter text-center mt-4 text-base" style={{ color: colors.text }}>
                        This chapter is locked
                    </Text>
                    <Text className="font-inter text-center mt-2" style={{ color: colors.subtext }}>
                        Please unlock it from the chapter list.
                    </Text>
                    <TouchableOpacity
                        onPress={() => router.back()}
                        className="mt-6 px-6 py-3 rounded-full"
                        style={{ backgroundColor: colors.accent }}
                    >
                        <Text className="font-inter font-bold" style={{ color: "#000" }}>
                            Back to chapters
                        </Text>
                    </TouchableOpacity>
                </View>

                <View className="flex-row items-center justify-between px-6 py-4 rounded-t-3xl border-t" style={{ backgroundColor: colors.card, borderTopColor: colors.border }}>
                    <TouchableOpacity
                        onPress={handlePrevChapter}
                        disabled={currentChapterNum <= 1 || !prevUnlocked}
                        className={`nav-button p-2 ${(currentChapterNum <= 1 || !prevUnlocked) ? 'opacity-30' : 'opacity-100'}`}
                    >
                        <ChevronLeft color={colors.icon} size={24} />
                    </TouchableOpacity>

                    <Text className="font-inter text-[15px] tracking-widest" style={{ color: colors.text }}>
                        {currentChapterNum} / {displayTotalChapters}
                    </Text>

                    <TouchableOpacity
                        onPress={handleNextChapter}
                        disabled={(totalChapters > 0 && currentChapterNum >= totalChapters) || !nextUnlocked}
                        className={`nav-button p-2 ${((totalChapters > 0 && currentChapterNum >= totalChapters) || !nextUnlocked) ? 'opacity-30' : 'opacity-100'}`}
                    >
                        {nextUnlocked ? (
                            <ChevronRight color={colors.icon} size={24} />
                        ) : (
                            <Lock color={colors.accent} size={20} />
                        )}
                    </TouchableOpacity>
                </View>
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
                        disabled={currentChapterNum <= 1 || !getChapterStatus(currentChapterNum - 1)}
                        className={`p-2 ${(currentChapterNum <= 1 || !getChapterStatus(currentChapterNum - 1)) ? 'opacity-30' : 'opacity-100'}`}
                    >
                        <ChevronLeft color={colors.icon} size={24} />
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={handleNextChapter}
                        disabled={(totalChapters > 0 && currentChapterNum >= totalChapters) || !getChapterStatus(currentChapterNum + 1)}
                        className={`p-2 ${((totalChapters > 0 && currentChapterNum >= totalChapters) || !getChapterStatus(currentChapterNum + 1)) ? 'opacity-30' : 'opacity-100'}`}
                    >
                        {getChapterStatus(currentChapterNum + 1) ? (
                            <ChevronRight color={colors.icon} size={24} />
                        ) : (
                            <Lock color={colors.accent} size={20} />
                        )}
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        );
    }

    const displayTotalChapters = totalChapters > 0 ? totalChapters : '...';
    const prevChapterUnlocked = currentChapterNum > 1 && getChapterStatus(currentChapterNum - 1);
    const nextChapterUnlocked = getChapterStatus(currentChapterNum + 1);
    const atEnd = totalChapters > 0 && currentChapterNum >= totalChapters;

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
                    disabled={currentChapterNum <= 1 || !prevChapterUnlocked}
                    className={`nav-button p-2 ${(currentChapterNum <= 1 || !prevChapterUnlocked) ? 'opacity-30' : 'opacity-100'}`}
                >
                    <ChevronLeft color={colors.icon} size={24} />
                </TouchableOpacity>

                <Text className="font-inter text-[15px] tracking-widest" style={{ color: colors.text }}>
                    {currentChapterNum} / {displayTotalChapters}
                </Text>

                <TouchableOpacity
                    onPress={handleNextChapter}
                    disabled={atEnd || !nextChapterUnlocked}
                    className={`nav-button p-2 ${(atEnd || !nextChapterUnlocked) ? 'opacity-30' : 'opacity-100'}`}
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
