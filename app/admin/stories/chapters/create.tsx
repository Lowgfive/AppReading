import AppHeader from '@/components/AppHeader';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { useToast } from '@/context/ToastContext';
import { AppService } from '@/services/app.service';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function CreateChapterScreen() {
    const { colors } = useTheme();
    const { user, isLoading } = useAuth();
    const { showToast } = useToast();
    const insets = useSafeAreaInsets();
    const params = useLocalSearchParams<{ storyId?: string; storyTitle?: string }>();

    const storyId = Array.isArray(params.storyId) ? params.storyId[0] : params.storyId;
    const storyTitle = Array.isArray(params.storyTitle) ? params.storyTitle[0] : params.storyTitle;

    const [chapterNumber, setChapterNumber] = useState('');
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const normalizedChapterNumber = useMemo(() => Number(chapterNumber), [chapterNumber]);
    const canSubmit = !!storyId && normalizedChapterNumber > 0 && title.trim() && content.trim() && !submitting;

    const handleSubmit = async () => {
        if (!storyId) {
            showToast('Thiếu mã truyện để tạo chương.', 'error');
            return;
        }

        if (!normalizedChapterNumber || normalizedChapterNumber <= 0) {
            showToast('Số chương phải lớn hơn 0.', 'error');
            return;
        }

        if (!title.trim() || !content.trim()) {
            showToast('Vui lòng nhập đầy đủ tiêu đề và nội dung chương.', 'error');
            return;
        }

        try {
            setSubmitting(true);
            await AppService.createChapter({
                storyId,
                chapters: [
                    {
                        chapterNumber: normalizedChapterNumber,
                        title: title.trim(),
                        content: content.trim(),
                    },
                ],
            });

            showToast('Tạo chương thành công.', 'success');
            router.back();
        } catch (error: any) {
            console.error('Failed to create chapter', error);
            showToast(error?.response?.data?.message || 'Không thể tạo chương.', 'error');
        } finally {
            setSubmitting(false);
        }
    };

    if (isLoading) {
        return (
            <View className="flex-1" style={{ backgroundColor: colors.background }}>
                <AppHeader />
                <View className="flex-1 items-center justify-center">
                    <ActivityIndicator size="large" color={colors.accent} />
                </View>
            </View>
        );
    }

    if (user?.role !== 'admin') {
        return (
            <View className="flex-1" style={{ backgroundColor: colors.background }}>
                <AppHeader />
                <View className="flex-1 items-center justify-center px-6">
                    <Text className="text-2xl font-bold text-center" style={{ color: colors.text }}>
                        Cần quyền quản trị viên
                    </Text>
                </View>
            </View>
        );
    }

    return (
        <View className="flex-1" style={{ backgroundColor: colors.background }}>
            <AppHeader />
            <KeyboardAvoidingView
                className="flex-1"
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 96 : 72}
            >
                <ScrollView
                    className="flex-1"
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                    keyboardDismissMode="on-drag"
                    automaticallyAdjustKeyboardInsets={Platform.OS === 'ios'}
                    contentContainerStyle={{
                        paddingHorizontal: 16,
                        paddingTop: 18,
                        paddingBottom: Math.max(insets.bottom + 140, 180),
                    }}
                >
                    <Text className="text-4xl font-bold" style={{ color: colors.text }}>
                        Thêm chương mới
                    </Text>
                    <Text className="text-base mt-2" style={{ color: colors.subtext }}>
                        {storyTitle || 'Thêm chương cho truyện đã chọn'}
                    </Text>

                    <View
                        className="rounded-3xl border px-5 py-6 mt-6"
                        style={{ backgroundColor: colors.card, borderColor: colors.border }}
                    >
                        <Text className="text-3xl font-bold mb-6" style={{ color: colors.text }}>
                            Thông tin chương
                        </Text>

                        <View className="mb-5">
                            <Text className="text-base font-semibold mb-3" style={{ color: colors.text }}>
                                Số chương *
                            </Text>
                            <TextInput
                                value={chapterNumber}
                                onChangeText={(value) => setChapterNumber(value.replace(/[^0-9]/g, ''))}
                                placeholder="Ví dụ: 1"
                                placeholderTextColor={colors.subtext}
                                keyboardType="number-pad"
                                inputMode="numeric"
                                autoCorrect={false}
                                returnKeyType="next"
                                className="rounded-2xl px-4 py-4 text-[15px]"
                                style={{ backgroundColor: colors.background, color: colors.text, borderWidth: 1, borderColor: colors.border }}
                            />
                        </View>

                        <View className="mb-5">
                            <Text className="text-base font-semibold mb-3" style={{ color: colors.text }}>
                                Tiêu đề *
                            </Text>
                            <TextInput
                                value={title}
                                onChangeText={setTitle}
                                placeholder="Nhập tiêu đề chương"
                                placeholderTextColor={colors.subtext}
                                autoCorrect={false}
                                returnKeyType="next"
                                className="rounded-2xl px-4 py-4 text-[15px]"
                                style={{ backgroundColor: colors.background, color: colors.text, borderWidth: 1, borderColor: colors.border }}
                            />
                        </View>

                        <View className="mb-7">
                            <Text className="text-base font-semibold mb-3" style={{ color: colors.text }}>
                                Nội dung *
                            </Text>
                            <TextInput
                                value={content}
                                onChangeText={setContent}
                                placeholder="Nhập nội dung chương"
                                placeholderTextColor={colors.subtext}
                                multiline
                                textAlignVertical="top"
                                autoCorrect={false}
                                scrollEnabled={false}
                                className="rounded-2xl px-4 py-4 text-[15px] min-h-[260px]"
                                style={{ backgroundColor: colors.background, color: colors.text, borderWidth: 1, borderColor: colors.border }}
                            />
                        </View>

                        <TouchableOpacity
                            onPress={handleSubmit}
                            disabled={!canSubmit}
                            className="rounded-2xl items-center justify-center py-4"
                            style={{ backgroundColor: canSubmit ? colors.accent : `${colors.accent}66` }}
                        >
                            {submitting ? (
                                <ActivityIndicator color="#111111" />
                            ) : (
                                <Text className="text-base font-bold" style={{ color: '#111111' }}>
                                    Tạo chương
                                </Text>
                            )}
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </View>
    );
}
