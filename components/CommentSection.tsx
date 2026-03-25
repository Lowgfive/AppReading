import React, { memo } from 'react';
import { Image, Text, View } from 'react-native';
import { MessageCircle } from 'lucide-react-native';

type CommentItem = {
    id: string;
    content: string;
    userName: string;
    avatar: string;
    createdAt: string;
};

type CommentSectionProps = {
    comments: CommentItem[];
    colors: {
        background: string;
        text: string;
        subtext: string;
        card: string;
        border: string;
        accent: string;
        icon: string;
    };
    loading: boolean;
};

const formatDate = (value: string) => {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '';

    return new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    }).format(date);
};

function CommentSectionComponent({ comments, colors, loading }: CommentSectionProps) {
    return (
        <View nativeID="comment-section">
            <View className="flex-row items-center justify-between mb-5">
                <View>
                    <Text className="text-2xl font-bold" style={{ color: colors.text }}>
                        Comments
                    </Text>
                    <Text className="mt-1 text-sm" style={{ color: colors.subtext }}>
                        Join the discussion after this chapter.
                    </Text>
                </View>

                <View
                    className="px-3 py-2 rounded-full border"
                    style={{ backgroundColor: colors.card, borderColor: colors.border }}
                >
                    <Text className="text-sm font-semibold" style={{ color: colors.accent }}>
                        {comments.length}
                    </Text>
                </View>
            </View>

            {loading ? (
                <View
                    className="rounded-3xl border p-5"
                    style={{ backgroundColor: colors.card, borderColor: colors.border }}
                >
                    <Text className="text-sm" style={{ color: colors.subtext }}>
                        Loading comments...
                    </Text>
                </View>
            ) : comments.length === 0 ? (
                <View
                    className="rounded-3xl border p-6 items-center"
                    style={{ backgroundColor: colors.card, borderColor: colors.border }}
                >
                    <MessageCircle color={colors.accent} size={24} />
                    <Text className="mt-4 text-base font-semibold" style={{ color: colors.text }}>
                        No comments yet
                    </Text>
                    <Text className="mt-2 text-center text-sm leading-6" style={{ color: colors.subtext }}>
                        Be the first reader to leave a thought about this chapter.
                    </Text>
                </View>
            ) : (
                <View className="gap-4">
                    {comments.map((comment) => (
                        <View
                            key={comment.id}
                            className="rounded-3xl border p-4"
                            style={{ backgroundColor: colors.card, borderColor: colors.border }}
                        >
                            <View className="flex-row items-center">
                                {comment.avatar ? (
                                    <Image
                                        source={{ uri: comment.avatar }}
                                        className="w-11 h-11 rounded-full"
                                    />
                                ) : (
                                    <View
                                        className="w-11 h-11 rounded-full items-center justify-center"
                                        style={{ backgroundColor: colors.background }}
                                    >
                                        <Text className="text-base font-bold" style={{ color: colors.accent }}>
                                            {comment.userName.slice(0, 1).toUpperCase()}
                                        </Text>
                                    </View>
                                )}

                                <View className="ml-3 flex-1">
                                    <Text className="text-base font-bold" style={{ color: colors.text }}>
                                        {comment.userName}
                                    </Text>
                                    <Text className="text-xs mt-1" style={{ color: colors.subtext }}>
                                        {formatDate(comment.createdAt)}
                                    </Text>
                                </View>
                            </View>

                            <Text className="mt-4 text-[15px] leading-7" style={{ color: colors.text }}>
                                {comment.content}
                            </Text>
                        </View>
                    ))}
                </View>
            )}
        </View>
    );
}

export const CommentSection = memo(CommentSectionComponent);
