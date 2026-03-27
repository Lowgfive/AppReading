import React from "react";
import { View, Text, TouchableOpacity, ImageBackground } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Eye, Heart, MessageSquare } from "lucide-react-native";
import { useTheme } from "@/context/ThemeContext";

type StoryCardProps = {
    story: any;
    onPress: () => void;
};

export default function StoryCard({ story, onPress }: StoryCardProps) {
    const { colors } = useTheme();

    const author = story.userId?.username || "Unknown author";
    const likes = story.likeCount || 0;
    const views = story.viewCount >= 1000 ? `${(story.viewCount / 1000).toFixed(1)}K` : (story.viewCount || 0);
    const comments = story.commentCount || 0;

    return (
        <TouchableOpacity
            className="mr-4 w-36 rounded-xl overflow-hidden mb-2"
            onPress={onPress}
        >
            <View
                className="w-full h-48 rounded-xl overflow-hidden"
                style={{ backgroundColor: colors.cardImage }}
            >
                {story.image ? (
                    <ImageBackground source={{ uri: story.image }} className="w-full h-full" resizeMode="cover" progressiveRenderingEnabled>
                        <LinearGradient
                            colors={['rgba(0,0,0,0.6)', 'transparent', 'rgba(0,0,0,0.8)']}
                            className="w-full h-full p-2 justify-between"
                        >
                            <View className="self-start px-3 py-1 rounded-full" style={{ backgroundColor: story.status === 'COMPLETED' || story.status === 'Completed' ? '#38A169' : '#E08A2A' }}>
                                <Text className="text-gray-200 text-[10px] font-bold font-inter">
                                    {story.status === 'Completed' || story.status === 'COMPLETED' ? 'Completed' : 'Ongoing'}
                                </Text>
                            </View>
                            <View className="mt-auto items-start">
                                <View className="px-3 py-1 rounded-full border border-gray-700 mb-1" style={{ backgroundColor: 'rgba(18,18,18,0.9)' }}>
                                    <Text className="text-gray-200 text-[10px] font-bold font-inter">
                                        {story.type || "Unknown"}
                                    </Text>
                                </View>
                            </View>
                        </LinearGradient>
                    </ImageBackground>
                ) : (
                    <View className="w-full h-full justify-between p-2" style={{ backgroundColor: colors.cardImage }}>
                        <View className="self-start px-3 py-1 rounded-full" style={{ backgroundColor: story.status === 'COMPLETED' || story.status === 'Completed' ? '#38A169' : '#E08A2A' }}>
                            <Text className="text-[10px] font-bold font-inter" style={{ color: colors.text }}>
                                {story.status === 'Completed' || story.status === 'COMPLETED' ? 'Completed' : 'Ongoing'}
                            </Text>
                        </View>
                        <View className="flex-1 justify-center items-center">
                            <Text className="font-inter text-xs" style={{ color: colors.subtext }}>No Cover</Text>
                        </View>
                        <View className="mt-auto items-start">
                            <View className="px-3 py-1 rounded-full border border-gray-700 mb-1" style={{ backgroundColor: colors.background }}>
                                <Text className="text-[10px] font-bold font-inter" style={{ color: colors.text }}>
                                    {story.type || "Unknown"}
                                </Text>
                            </View>
                        </View>
                    </View>
                )}
            </View>

            <View className="mt-2 px-1">
                <Text
                    className="font-inter font-bold text-[15px] mb-1 leading-tight"
                    numberOfLines={1}
                    style={{ color: colors.accentLight }}
                >
                    {story.name}
                </Text>
                <Text
                    className="text-[11px] mb-2 font-inter"
                    numberOfLines={1}
                    style={{ color: colors.subtext }}
                >
                    {author}
                </Text>
                <View className="flex-row items-center gap-2">
                    <View className="flex-row items-center">
                        <Heart color={colors.accentLight} fill={colors.accentLight} size={12} />
                        <Text className="text-[10px] ml-1 font-inter" style={{ color: colors.subtext }}>
                            {likes}
                        </Text>
                    </View>
                    <View className="flex-row items-center">
                        <Eye color={colors.icon} size={12} />
                        <Text className="text-[10px] ml-1 font-inter" style={{ color: colors.subtext }}>
                            {views}
                        </Text>
                    </View>
                    <View className="flex-row items-center">
                        <MessageSquare color={colors.icon} size={12} />
                        <Text className="text-[10px] ml-1 font-inter" style={{ color: colors.subtext }}>
                            {comments}
                        </Text>
                    </View>
                </View>
            </View>
        </TouchableOpacity>
    );
}
