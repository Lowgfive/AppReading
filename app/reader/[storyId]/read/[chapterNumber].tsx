import React, { useCallback, useEffect, useRef, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, StatusBar, SafeAreaView, Modal, Pressable } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ChevronLeft, ChevronRight, Home, Lock, MessageCircle, Settings } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppService } from '@/services/app.service';
import { useTheme } from '@/context/ThemeContext';
import { useToast } from '@/context/ToastContext';
import { CommentSection } from '@/components/CommentSection';
import { CommentInput } from '@/components/CommentInput';
import { useAuth } from '@/context/AuthContext';

type ChapterComment = {
    id: string;
    content: string;
    userName: string;
    avatar: string;
    createdAt: string;
};

export default function ReaderScreen() {
    const { storyId, chapterNumber, storyTitle } = useLocalSearchParams();
    const router = useRouter();
    const { colors, isDarkMode, theme, setTheme } = useTheme();
    const { showToast } = useToast();
    const { user } = useAuth();
    const insets = useSafeAreaInsets();
    const [chapter, setChapter] = useState<any>(null);
    const [chapters, setChapters] = useState<any[]>([]);
    const [totalChapters, setTotalChapters] = useState<number>(0);
    const [initialLoading, setInitialLoading] = useState(true);
    const [isChapterSwitching, setIsChapterSwitching] = useState(false);
    const [showChapterSwitchingIndicator, setShowChapterSwitchingIndicator] = useState(false);
    const [locked, setLocked] = useState(false);
    const [comments, setComments] = useState<ChapterComment[]>([]);
    const [commentsLoading, setCommentsLoading] = useState(true);
    const [commentDraft, setCommentDraft] = useState('');
    const [postingComment, setPostingComment] = useState(false);
    const [commentSectionY, setCommentSectionY] = useState(0);
    const [settingsOpen, setSettingsOpen] = useState(false);
    const [readerFont, setReaderFont] = useState<'inter' | 'serif' | 'system'>('serif');
    const [readerFontSize, setReaderFontSize] = useState<18 | 20 | 22>(18);
    const scrollViewRef = useRef<ScrollView>(null);

    const currentChapterNum = Number(chapterNumber) || 1;

    useEffect(() => {
        if (!isChapterSwitching) {
            setShowChapterSwitchingIndicator(false);
            return;
        }

        const timer = setTimeout(() => {
            setShowChapterSwitchingIndicator(true);
        }, 180);

        return () => clearTimeout(timer);
    }, [isChapterSwitching]);

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
            setInitialLoading(false);
            setIsChapterSwitching(false);
            showToast("This chapter is locked. Please purchase it first.", "error");
            return;
        }

        setLocked(false);
        fetchChapterContent();
    }, [storyId, currentChapterNum, chapters]);

    useEffect(() => {
        const chapterId = chapter?._id;

        if (!chapterId || locked) {
            setComments([]);
            setCommentsLoading(false);
            return;
        }

        let isActive = true;

        const fetchComments = async () => {
            try {
                setCommentsLoading(true);
                const response = await AppService.getChapterComments(chapterId);
                if (isActive) {
                    setComments(Array.isArray(response) ? response : []);
                }
            } catch (error) {
                console.error('Error fetching chapter comments:', error);
                if (isActive) {
                    setComments([]);
                }
            } finally {
                if (isActive) {
                    setCommentsLoading(false);
                }
            }
        };

        fetchComments();

        return () => {
            isActive = false;
        };
    }, [chapter?._id, locked]);

    const scrollToComments = useCallback(() => {
        scrollViewRef.current?.scrollTo({
            y: Math.max(commentSectionY - 16, 0),
            animated: true,
        });
    }, [commentSectionY]);

    const handleCreateComment = useCallback(async () => {
        const content = commentDraft.trim();
        const chapterId = chapter?._id;

        if (!user) {
            showToast('Please sign in to comment.', 'info');
            return;
        }

        if (!content) {
            showToast('Comment cannot be empty.', 'info');
            return;
        }

        if (!chapterId) {
            showToast('Chapter is not ready yet.', 'error');
            return;
        }

        const optimisticId = `temp-${Date.now()}`;
        const optimisticComment: ChapterComment = {
            id: optimisticId,
            content,
            userName: user.username || 'You',
            avatar: user.avatar || '',
            createdAt: new Date().toISOString(),
        };

        setCommentDraft('');
        setPostingComment(true);
        setComments((prev) => [optimisticComment, ...prev]);

        try {
            const createdComment = await AppService.createChapterComment(chapterId, content);
            setComments((prev) =>
                prev.map((comment) => (comment.id === optimisticId ? createdComment : comment))
            );
        } catch (error) {
            console.error('Error creating comment:', error);
            setComments((prev) => prev.filter((comment) => comment.id !== optimisticId));
            setCommentDraft(content);
            showToast('Failed to post comment. Please try again.', 'error');
        } finally {
            setPostingComment(false);
        }
    }, [chapter?._id, commentDraft, showToast, user]);

    const fetchChapterContent = async () => {
        try {
            if (!chapter) {
                setInitialLoading(true);
            } else {
                setIsChapterSwitching(true);
            }

            setLocked(false);
            setCommentsLoading(true);
            const data = await AppService.getChapterContent(storyId as string, currentChapterNum);
            setChapter(data.chapter || data);
        } catch (error: any) {
            console.error("Error fetching chapter content:", error);
            if (error.response?.status === 403 || error.response?.data?.message?.includes('locked')) {
                setLocked(true);
                setChapter(null);
                setComments([]);
                showToast("This chapter is locked. Please purchase it first.", "error");
            }
        } finally {
            setInitialLoading(false);
            setIsChapterSwitching(false);
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

    if (initialLoading && !chapter) {
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
    const readerFontFamily =
        readerFont === 'serif' ? 'serif' : readerFont === 'system' ? 'System' : 'Inter_400Regular';
    const contentLineHeight = readerFontSize * 1.8;

    return (
        <SafeAreaView className="flex-1" style={{ backgroundColor: colors.background, paddingTop: 10 }}>
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
                    {showChapterSwitchingIndicator ? (
                        <ActivityIndicator color={colors.accent} size="small" />
                    ) : null}
                    <TouchableOpacity onPress={() => router.push('/(tabs)/home')} className="p-2">
                        <Home color={colors.icon} size={22} />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => setSettingsOpen(true)} className="p-2 ml-2">
                        <Settings color={colors.icon} size={22} />
                    </TouchableOpacity>
                </View>
            </View>

            <ScrollView
                ref={scrollViewRef}
                className="flex-1 px-5"
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingTop: 24, paddingBottom: 40 }}
            >
                <View
                    className="rounded-[28px] border overflow-hidden"
                    style={{ backgroundColor: colors.card, borderColor: colors.border }}
                >
                    <View className="px-5 pt-6">
                        {showChapterSwitchingIndicator ? (
                            <Text className="text-xs font-semibold mb-3 tracking-[1px]" style={{ color: colors.accent }}>
                                LOADING NEXT CHAPTER
                            </Text>
                        ) : null}

                        <Text className="font-inter text-2xl font-bold mb-2" style={{ color: colors.text }}>
                            Chapter {currentChapterNum}: {chapter.title || 'Untitled'}
                        </Text>

                        <View className="flex-row items-center justify-between mb-8">
                            <Text className="text-sm" style={{ color: colors.subtext }}>
                                {chapter.wordCount || chapter.content?.split(' ').length || 0} words
                            </Text>
                        </View>

                        <Text
                            style={{
                                color: colors.text,
                                fontFamily: readerFontFamily,
                                fontSize: readerFontSize,
                                lineHeight: contentLineHeight,
                            }}
                        >
                            {chapter.content || "No content found for this chapter. The backend might have an empty string..."}
                        </Text>
                    </View>

                    <LinearGradient
                        colors={['transparent', colors.card]}
                        className="h-20 mt-4"
                    />
                </View>

                <View
                    nativeID="comment-section"
                    onLayout={(event) => setCommentSectionY(event.nativeEvent.layout.y)}
                    className="mt-8"
                >
                    <CommentInput
                        value={commentDraft}
                        onChangeText={setCommentDraft}
                        onSubmit={handleCreateComment}
                        submitting={postingComment}
                        colors={colors}
                    />
                    <CommentSection comments={comments} colors={colors} loading={commentsLoading} />
                </View>
            </ScrollView>

            <TouchableOpacity
                activeOpacity={0.92}
                onPress={scrollToComments}
                className="mx-5 mb-2 rounded-2xl border px-4 py-3 flex-row items-center"
                style={{
                    backgroundColor: colors.overlay,
                    borderColor: colors.border,
                }}
            >
                <View
                    className="w-10 h-10 rounded-full items-center justify-center"
                    style={{ backgroundColor: colors.card }}
                >
                    <MessageCircle color={colors.accent} size={18} />
                </View>
                <View className="ml-3 flex-1">
                    <Text className="text-sm font-semibold" style={{ color: colors.text }}>
                        {commentsLoading ? 'Loading comments...' : `${comments.length} comments`}
                    </Text>
                    <Text className="text-xs mt-1" style={{ color: colors.subtext }}>
                        Discussion continues below this chapter.
                    </Text>
                </View>
            </TouchableOpacity>

            <View
                className="flex-row items-center justify-between px-6 py-4 rounded-t-3xl border-t"
                style={{
                    backgroundColor: colors.card,
                    borderTopColor: colors.border,
                    paddingBottom: Math.max(insets.bottom, 12),
                }}
            >
                <TouchableOpacity
                    onPress={handlePrevChapter}
                    disabled={currentChapterNum <= 1 || !prevChapterUnlocked || isChapterSwitching}
                    className={`nav-button p-2 ${(currentChapterNum <= 1 || !prevChapterUnlocked || isChapterSwitching) ? 'opacity-30' : 'opacity-100'}`}
                >
                    <ChevronLeft color={colors.icon} size={24} />
                </TouchableOpacity>

                <Text className="font-inter text-[15px] tracking-widest" style={{ color: colors.text }}>
                    {currentChapterNum} / {displayTotalChapters}
                </Text>

                <TouchableOpacity
                    onPress={handleNextChapter}
                    disabled={atEnd || !nextChapterUnlocked || isChapterSwitching}
                    className={`nav-button p-2 ${(atEnd || !nextChapterUnlocked || isChapterSwitching) ? 'opacity-30' : 'opacity-100'}`}
                >
                    {nextChapterUnlocked ? (
                        <ChevronRight color={colors.icon} size={24} />
                    ) : (
                        <Lock color={colors.accent} size={20} />
                    )}
                </TouchableOpacity>
            </View>

            <Modal
                visible={settingsOpen}
                transparent
                animationType="fade"
                onRequestClose={() => setSettingsOpen(false)}
            >
                <Pressable
                    className="flex-1 justify-end"
                    style={{ backgroundColor: 'rgba(0,0,0,0.45)' }}
                    onPress={() => setSettingsOpen(false)}
                >
                    <Pressable
                        className="rounded-t-[28px] border px-5 pt-5"
                        style={{
                            backgroundColor: colors.card,
                            borderColor: colors.border,
                            paddingBottom: Math.max(insets.bottom + 18, 24),
                        }}
                        onPress={(event) => event.stopPropagation()}
                    >
                        <View className="w-12 h-1.5 rounded-full self-center mb-5" style={{ backgroundColor: colors.border }} />

                        <Text className="text-xl font-bold mb-1" style={{ color: colors.text }}>
                            Reader Settings
                        </Text>
                        <Text className="text-sm mb-5" style={{ color: colors.subtext }}>
                            Adjust the reading feel without leaving this chapter.
                        </Text>

                        <Text className="text-sm font-semibold mb-3" style={{ color: colors.subtext }}>
                            Theme
                        </Text>
                        <View className="flex-row gap-3 mb-6">
                            {[
                                { key: 'dark', label: 'Dark' },
                                { key: 'light', label: 'Light' },
                            ].map((option) => {
                                const active = theme === option.key;
                                return (
                                    <TouchableOpacity
                                        key={option.key}
                                        onPress={() => setTheme(option.key as 'light' | 'dark')}
                                        className="flex-1 rounded-2xl border px-4 py-4"
                                        style={{
                                            backgroundColor: active ? colors.accent : colors.background,
                                            borderColor: active ? colors.accent : colors.border,
                                        }}
                                    >
                                        <Text
                                            className="text-base font-bold text-center"
                                            style={{ color: active ? '#111111' : colors.text }}
                                        >
                                            {option.label}
                                        </Text>
                                    </TouchableOpacity>
                                );
                            })}
                        </View>

                        <Text className="text-sm font-semibold mb-3" style={{ color: colors.subtext }}>
                            Reading Font
                        </Text>
                        <View className="gap-3 mb-6">
                            {[
                                { key: 'serif', label: 'Serif', sample: 'Classic book feel' },
                                { key: 'inter', label: 'Inter', sample: 'Modern and clean' },
                                { key: 'system', label: 'System', sample: 'Native device font' },
                            ].map((option) => {
                                const active = readerFont === option.key;
                                return (
                                    <TouchableOpacity
                                        key={option.key}
                                        onPress={() => setReaderFont(option.key as 'inter' | 'serif' | 'system')}
                                        className="rounded-2xl border px-4 py-4"
                                        style={{
                                            backgroundColor: active ? `${colors.accent}18` : colors.background,
                                            borderColor: active ? colors.accent : colors.border,
                                        }}
                                    >
                                        <Text
                                            className="text-base font-bold"
                                            style={{
                                                color: colors.text,
                                                fontFamily:
                                                    option.key === 'serif'
                                                        ? 'serif'
                                                        : option.key === 'system'
                                                          ? 'System'
                                                          : 'Inter_600SemiBold',
                                            }}
                                        >
                                            {option.label}
                                        </Text>
                                        <Text className="text-sm mt-1" style={{ color: colors.subtext }}>
                                            {option.sample}
                                        </Text>
                                    </TouchableOpacity>
                                );
                            })}
                        </View>

                        <Text className="text-sm font-semibold mb-3" style={{ color: colors.subtext }}>
                            Text Size
                        </Text>
                        <View className="flex-row gap-3 mb-2">
                            {[
                                { key: 18, label: 'A' },
                                { key: 20, label: 'A+' },
                                { key: 22, label: 'A++' },
                            ].map((option) => {
                                const active = readerFontSize === option.key;
                                return (
                                    <TouchableOpacity
                                        key={option.key}
                                        onPress={() => setReaderFontSize(option.key as 18 | 20 | 22)}
                                        className="flex-1 rounded-2xl border items-center justify-center py-4"
                                        style={{
                                            backgroundColor: active ? colors.accent : colors.background,
                                            borderColor: active ? colors.accent : colors.border,
                                        }}
                                    >
                                        <Text
                                            style={{
                                                color: active ? '#111111' : colors.text,
                                                fontWeight: '700',
                                                fontSize: option.key,
                                            }}
                                        >
                                            {option.label}
                                        </Text>
                                    </TouchableOpacity>
                                );
                            })}
                        </View>
                    </Pressable>
                </Pressable>
            </Modal>
        </SafeAreaView>
    );
}
