import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, ImageBackground, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Play, Heart, Star, Eye, BookOpen, Clock, ChevronRight, ChevronLeft } from 'lucide-react-native';
import { AppService } from '@/services/app.service';

export default function StoryDetailScreen() {
    const { id, storyData } = useLocalSearchParams();
    const router = useRouter();
    const [story, setStory] = useState<any>(null);
    const [chapters, setChapters] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (storyData) {
            try {
                setStory(JSON.parse(storyData as string));
            } catch (e) {
                console.error("Failed to parse story data", e);
            }
        }
        fetchChapters();
    }, [id, storyData]);

    const fetchChapters = async () => {
        try {
            setLoading(true);
            const data = await AppService.getStoryChapters(id as string);
            // the API might return an object with a chapters array or just an array directly
            setChapters(data?.chapters || data || []);
        } catch (error) {
            console.error("Error fetching chapters:", error);
        } finally {
            setLoading(false);
        }
    };

    if (!story) {
        return (
            <View className="flex-1 bg-[#121212] justify-center items-center">
                <ActivityIndicator size="large" color="#E08A2A" />
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

    return (
        <View className="flex-1 bg-[#121212]">
            <ScrollView className="flex-1" showsVerticalScrollIndicator={false} bounces={false}>
                {/* Header Image Section */}
                <View className="w-full h-[400px]">
                    {story.image ? (
                        <ImageBackground
                            source={{ uri: story.image }}
                            className="w-full h-full"
                            resizeMode="cover"
                        >
                            <LinearGradient
                                colors={['rgba(18,18,18,0.4)', 'rgba(18,18,18,0.8)', '#121212']}
                                className="w-full h-full px-5 pt-14 pb-4 justify-between"
                            >
                                <TouchableOpacity onPress={() => router.back()} className="w-10 h-10 bg-black/50 rounded-full items-center justify-center">
                                    <ChevronLeft color="#FFF" size={24} />
                                </TouchableOpacity>

                                <View className="mt-auto">
                                    <Text className="text-white font-serifClassic text-4xl font-bold mb-3 leading-tight">
                                        {story.name}
                                    </Text>
                                    <Text className="text-gray-400 text-[15px] mb-4">
                                        by <Text className="text-white font-semibold">{author}</Text>
                                    </Text>

                                    <View className="flex-row gap-2 mb-4">
                                        <View className="border border-gray-400 rounded-full px-4 py-[3px]">
                                            <Text className="text-gray-300 text-xs font-semibold">{story.type || "Fantasy"}</Text>
                                        </View>
                                        {/* You can map out other genres similarly if they exist in story.tags */}
                                    </View>

                                    <View className="flex-row items-center gap-4 flex-wrap">
                                        <View className="flex-row items-center">
                                            <Star color="#F19C38" fill="#F19C38" size={14} />
                                            <Text className="text-gray-300 text-xs ml-[6px]">{rating} rating</Text>
                                        </View>
                                        <View className="flex-row items-center">
                                            <Eye color="#A0A0A0" size={14} />
                                            <Text className="text-gray-300 text-xs ml-[6px]">{views} views</Text>
                                        </View>
                                        <View className="flex-row items-center">
                                            <BookOpen color="#A0A0A0" size={14} />
                                            <Text className="text-gray-300 text-xs ml-[6px]">{chapters.length || story.chapterCount || 0} chapters</Text>
                                        </View>
                                    </View>

                                    <View className="flex-row items-center mt-3">
                                        <Clock color="#A0A0A0" size={14} />
                                        <Text className="text-gray-400 text-xs ml-[6px]">
                                            Updated {formatDate(story.createdDate || story.updatedAt || new Date().toISOString())}
                                        </Text>
                                    </View>
                                </View>
                            </LinearGradient>
                        </ImageBackground>
                    ) : (
                        <LinearGradient
                            colors={['#2A2A2A', '#1A1A1A', '#121212']}
                            className="w-full h-full px-5 pt-14 pb-4 justify-between"
                        >
                            <TouchableOpacity onPress={() => router.back()} className="w-10 h-10 bg-black/50 rounded-full items-center justify-center">
                                <ChevronLeft color="#FFF" size={24} />
                            </TouchableOpacity>

                            <View className="mt-auto">
                                <Text className="text-white font-serifClassic text-4xl font-bold mb-3 leading-tight">
                                    {story.name}
                                </Text>
                                <Text className="text-gray-400 text-[15px] mb-4">
                                    by <Text className="text-white font-semibold">{author}</Text>
                                </Text>

                                <View className="flex-row gap-2 mb-4">
                                    <View className="border border-gray-400 rounded-full px-4 py-[3px]">
                                        <Text className="text-gray-300 text-xs font-semibold">{story.type || "Fantasy"}</Text>
                                    </View>
                                </View>

                                <View className="flex-row items-center gap-4 flex-wrap">
                                    <View className="flex-row items-center">
                                        <Star color="#F19C38" fill="#F19C38" size={14} />
                                        <Text className="text-gray-300 text-xs ml-[6px]">{rating} rating</Text>
                                    </View>
                                    <View className="flex-row items-center">
                                        <Eye color="#A0A0A0" size={14} />
                                        <Text className="text-gray-300 text-xs ml-[6px]">{views} views</Text>
                                    </View>
                                    <View className="flex-row items-center">
                                        <BookOpen color="#A0A0A0" size={14} />
                                        <Text className="text-gray-300 text-xs ml-[6px]">{chapters.length || story.chapterCount || 0} chapters</Text>
                                    </View>
                                </View>

                                <View className="flex-row items-center mt-3">
                                    <Clock color="#A0A0A0" size={14} />
                                    <Text className="text-gray-400 text-xs ml-[6px]">
                                        Updated {formatDate(story.createdDate || story.updatedAt || new Date().toISOString())}
                                    </Text>
                                </View>
                            </View>
                        </LinearGradient>
                    )}
                </View>

                {/* Content Section */}
                <View className="px-6 py-2">
                    {/* Description */}
                    <Text className="text-gray-300 text-[15px] leading-[26px] mb-7 font-serifClassic">
                        {story.description || "In a world where books have become forbidden, one librarian guards the last sanctuary of stories. When a mysterious stranger arrives seeking a particular volume, she must decide whether to protect her secrets or risk everything for the truth."}
                    </Text>

                    {/* Action Buttons */}
                    <View className="gap-3 mb-10 items-start">
                        <TouchableOpacity className="flex-row items-center pl-6 pr-8 bg-[#E08A2A] py-[14px] rounded-xl flex min-w-[190px]">
                            <Play fill="#000" color="#000" size={16} className="mr-3" />
                            <Text className="text-black font-semibold text-[15px]">Read Now</Text>
                        </TouchableOpacity>
                        <TouchableOpacity className="flex-row items-center pl-6 pr-8 border border-[#E08A2A] py-[14px] rounded-xl bg-transparent min-w-[190px]">
                            <Heart color="#E08A2A" size={16} className="mr-3" />
                            <Text className="text-[#E08A2A] font-medium text-[15px]">Add to Favorites</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Chapters Section */}
                    <Text className="text-white text-[22px] font-serifClassic font-bold mb-5">
                        Chapters ({chapters.length || 0})
                    </Text>

                    {loading ? (
                        <ActivityIndicator size="large" color="#E08A2A" className="mt-8 mb-12" />
                    ) : (
                        <View className="gap-3 mb-12">
                            {chapters.length > 0 ? chapters.map((chapter: any, index: number) => (
                                <TouchableOpacity
                                    key={chapter._id || index}
                                    className="bg-[#1C1C1E] rounded-xl p-[18px] flex-row items-center justify-between"
                                    onPress={() => {
                                        const cNum = chapter.chapterNumber || index + 1;
                                        router.push({
                                            pathname: `/reader/${id}/read/${cNum}` as any,
                                            params: { storyTitle: story.name }
                                        });
                                    }}
                                >
                                    <View className="flex-row items-center flex-1">
                                        <View className="w-10 h-10 rounded-full bg-[#2C2C2E] items-center justify-center mr-4">
                                            <Text className="text-white font-bold text-[15px]">{chapter.chapterNumber || index + 1}</Text>
                                        </View>
                                        <View className="flex-1 pr-4">
                                            <Text className="text-white font-bold text-[15px] mb-[6px]" numberOfLines={1}>
                                                {chapter.title || `Chapter ${chapter.chapterNumber || index + 1}`}
                                            </Text>
                                            <Text className="text-gray-400 text-[13px]">
                                                {chapter.wordCount || (Math.floor(Math.random() * (3000 - 1500 + 1) + 1500))} words • {formatDate(chapter.createdAt || new Date().toISOString())}
                                            </Text>
                                        </View>
                                    </View>
                                    <ChevronRight color="#666" size={20} />
                                </TouchableOpacity>
                            )) : (
                                <Text className="text-gray-500 font-serifClassic text-center py-8 text-[15px]">There are no chapters available yet.</Text>
                            )}
                        </View>
                    )}
                </View>
            </ScrollView>
        </View>
    );
}
