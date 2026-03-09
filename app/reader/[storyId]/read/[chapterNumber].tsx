import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, StatusBar, Platform, SafeAreaView } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ChevronLeft, ChevronRight, Home, Settings } from 'lucide-react-native';
import { AppService } from '@/services/app.service';

export default function ReaderScreen() {
    const { storyId, chapterNumber, storyTitle } = useLocalSearchParams();
    const router = useRouter();
    const [chapter, setChapter] = useState<any>(null);
    const [totalChapters, setTotalChapters] = useState<number>(1);
    const [loading, setLoading] = useState(true);

    const currentChapterNum = Number(chapterNumber) || 1;

    useEffect(() => {
        fetchChapterContent();
    }, [storyId, currentChapterNum]);

    const fetchChapterContent = async () => {
        try {
            setLoading(true);
            const data = await AppService.getChapterContent(storyId as string, currentChapterNum);
            setChapter(data.chapter || data);

            // Assuming the API returns totalChapters. If not, fallback to a safe 1 or fetched length.
            if (data.totalChapters) {
                setTotalChapters(data.totalChapters);
            } else if (data.chapter?.totalChapters) {
                setTotalChapters(data.chapter.totalChapters);
            }

        } catch (error) {
            console.error("Error fetching chapter content:", error);
        } finally {
            setLoading(false);
        }
    };

    const handlePrevChapter = () => {
        if (currentChapterNum > 1) {
            router.replace({
                pathname: `/reader/${storyId}/read/${currentChapterNum - 1}` as any,
                params: { storyTitle }
            });
        }
    };

    const handleNextChapter = () => {
        // We only allow next if we have a total or we assume we can keeping going until we hit an error (which is handled by API 404)
        if (currentChapterNum < totalChapters || totalChapters === 1) { // totalChapters is 1 fallback if backend doesnt return it yet.
            router.replace({
                pathname: `/reader/${storyId}/read/${currentChapterNum + 1}` as any,
                params: { storyTitle }
            });
        }
    };

    if (loading) {
        return (
            <SafeAreaView className="flex-1 bg-[#0F0F10] justify-center items-center">
                <StatusBar barStyle="light-content" backgroundColor="#0F0F10" />
                <ActivityIndicator size="large" color="#E08A2A" />
            </SafeAreaView>
        );
    }

    if (!chapter) {
        return (
            <SafeAreaView className="flex-1 bg-[#0F0F10]">
                <StatusBar barStyle="light-content" backgroundColor="#0F0F10" />
                {/* Top Navigation Bar */}
                <View className="flex-row items-center justify-between px-4 py-3 border-b border-[#2A2A2A]">
                    <View className="flex-row items-center flex-1">
                        <TouchableOpacity onPress={() => router.back()} className="p-2 mr-2">
                            <ChevronLeft color="#A0A0A0" size={24} />
                        </TouchableOpacity>
                        <View className="flex-1">
                            <Text className="text-white font-bold text-[15px]" numberOfLines={1}>{storyTitle || 'Story'}</Text>
                        </View>
                    </View>
                </View>
                <View className="flex-1 justify-center items-center px-6">
                    <Text className="text-gray-400 font-serifClassic text-center leading-relaxed">Chapter cannot be loaded. It might not exist.</Text>
                </View>
                {/* Bottom Navigation */}
                <View className="flex-row items-center justify-between px-6 py-4 bg-[#1A1A1C] rounded-t-3xl border-t border-[#2A2A2A]">
                    <TouchableOpacity
                        onPress={handlePrevChapter}
                        disabled={currentChapterNum <= 1}
                        className={`p-2 ${currentChapterNum <= 1 ? 'opacity-30' : 'opacity-100'}`}
                    >
                        <ChevronLeft color="#A0A0A0" size={24} />
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={handleNextChapter}
                        className="p-2"
                    >
                        <ChevronRight color="#A0A0A0" size={24} />
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        );
    }

    // Attempt to guess totalChapters in case backend isn't sending it
    // Usually handled by backend sending { chapter, totalChapters }
    const displayTotalChapters = totalChapters > 1 ? totalChapters : (chapter.totalChapters || '?');

    return (
        <SafeAreaView className="flex-1 bg-[#0F0F10]">
            <StatusBar barStyle="light-content" backgroundColor="#0F0F10" />

            {/* Top Navigation Bar */}
            <View className="flex-row items-center justify-between px-4 py-3 border-b border-[#2A2A2A]">
                <View className="flex-row items-center flex-1 pr-4">
                    <TouchableOpacity onPress={() => router.back()} className="p-2 mr-2">
                        <ChevronLeft color="#A0A0A0" size={24} />
                    </TouchableOpacity>
                    <View className="flex-1">
                        <Text className="text-white font-bold text-[15px]" numberOfLines={1}>
                            {storyTitle || chapter.story?.name || 'Story'}
                        </Text>
                        <Text className="text-gray-400 text-xs mt-1" numberOfLines={1}>
                            Chapter {currentChapterNum}: {chapter.title || 'Untitled'}
                        </Text>
                    </View>
                </View>
                <View className="flex-row items-center">
                    <TouchableOpacity onPress={() => router.push('/(tabs)/home')} className="p-2">
                        <Home color="#A0A0A0" size={22} />
                    </TouchableOpacity>
                    <TouchableOpacity className="p-2 ml-2">
                        <Settings color="#A0A0A0" size={22} />
                    </TouchableOpacity>
                </View>
            </View>

            {/* Content Area */}
            <ScrollView
                className="flex-1 px-5"
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingTop: 24, paddingBottom: 40 }}
            >
                <Text className="text-[#F2F2F2] font-serifClassic text-2xl font-bold mb-2">
                    Chapter {currentChapterNum}: {chapter.title || 'Untitled'}
                </Text>

                <Text className="text-gray-500 text-sm mb-8">
                    {chapter.wordCount || chapter.content?.split(' ').length || 0} words
                </Text>

                <Text className="text-[#F2F2F2] font-serifClassic text-[18px] leading-[32px] mb-8">
                    {chapter.content || "No content found for this chapter. The backend might have an empty string..."}
                </Text>
            </ScrollView>

            {/* Bottom Navigation */}
            <View className="flex-row items-center justify-between px-6 py-4 bg-[#1A1A1C] rounded-t-3xl border-t border-[#2A2A2A]">
                <TouchableOpacity
                    onPress={handlePrevChapter}
                    disabled={currentChapterNum <= 1}
                    className={`nav-button p-2 ${currentChapterNum <= 1 ? 'opacity-30' : 'opacity-100'}`}
                >
                    <ChevronLeft color="#A0A0A0" size={24} />
                </TouchableOpacity>

                <Text className="text-gray-400 font-serifClassic text-[15px] tracking-widest">
                    {currentChapterNum} / {displayTotalChapters}
                </Text>

                <TouchableOpacity
                    onPress={handleNextChapter}
                    disabled={totalChapters > 1 && currentChapterNum >= totalChapters}
                    className={`nav-button p-2 ${(totalChapters > 1 && currentChapterNum >= totalChapters) ? 'opacity-30' : 'opacity-100'}`}
                >
                    <ChevronRight color="#A0A0A0" size={24} />
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}
