import AppHeader from '@/components/AppHeader';
import CoverImagePicker from '@/components/CoverImagePicker';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { useToast } from '@/context/ToastContext';
import { AppService } from '@/services/app.service';
import { router, useLocalSearchParams } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Platform, ScrollView, Text, TextInput, TouchableOpacity, View, KeyboardAvoidingView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const GENRE_OPTIONS = [
    'Fantasy',
    'Romance',
    'Action',
    'Adventure',
    'Mystery',
    'Historical',
    'Slice of Life',
    'Urban',
    'Martial Arts',
    'Cultivation',
    'Boys Love',
    'Girls Love',
];

export default function CreateStoryScreen() {
    const params = useLocalSearchParams<{ story?: string }>();
    const { colors } = useTheme();
    const { user, isLoading } = useAuth();
    const { showToast } = useToast();
    const insets = useSafeAreaInsets();
    const [title, setTitle] = useState('');
    const [author, setAuthor] = useState('');
    const [description, setDescription] = useState('');
    const [selectedFile, setSelectedFile] = useState<ImagePicker.ImagePickerAsset | null>(null);
    const [existingCoverImage, setExistingCoverImage] = useState('');
    const [status, setStatus] = useState<'ongoing' | 'completed'>('ongoing');
    const [genres, setGenres] = useState<string[]>(['Fantasy']);
    const [submitting, setSubmitting] = useState(false);

    const editingStory = useMemo(() => {
        if (!params.story) return null;
        try {
            return JSON.parse(params.story);
        } catch {
            return null;
        }
    }, [params.story]);

    useEffect(() => {
        if (!editingStory) return;

        setTitle(editingStory.title || editingStory.name || '');
        setAuthor(editingStory.author || '');
        setDescription(editingStory.description || '');
        setExistingCoverImage(editingStory.coverImageUrl || editingStory.image || '');
        setStatus(editingStory.status === 'Completed' ? 'completed' : 'ongoing');
        setGenres(Array.isArray(editingStory.genres) && editingStory.genres.length ? editingStory.genres : ['Fantasy']);
    }, [editingStory]);

    const canSubmit = useMemo(() => {
        return title.trim().length > 0 && author.trim().length > 0 && !submitting;
    }, [author, submitting, title]);

    const toggleGenre = (genre: string) => {
        setGenres((prev) =>
            prev.includes(genre) ? prev.filter((item) => item !== genre) : [...prev, genre]
        );
    };

    const handleSubmit = async () => {
        if (!canSubmit) {
            showToast('Tiêu đề và tác giả là bắt buộc.', 'info');
            return;
        }

        try {
            setSubmitting(true);

            let coverImageUrl = existingCoverImage;
            if (selectedFile?.uri) {
                coverImageUrl = await AppService.uploadStoryCover({
                    uri: selectedFile.uri,
                    fileName: selectedFile.fileName,
                    mimeType: selectedFile.mimeType,
                    file: Platform.OS === 'web' ? selectedFile.file : undefined,
                });
            }

            const payload = {
                title: title.trim(),
                author: author.trim(),
                description: description.trim(),
                coverImageUrl,
                status,
                genres,
            };

            if (editingStory?._id) {
                await AppService.updateAdminStory(editingStory._id, payload);
                showToast('Cập nhật truyện thành công.', 'success');
            } else {
                await AppService.createAdminStory(payload);
                showToast('Tạo truyện thành công.', 'success');
            }

            router.replace('/admin/stories' as any);
        } catch (error) {
            console.error('Failed to submit story', error);
            const message = error instanceof Error ? error.message : 'Không thể lưu truyện.';
            showToast(message, 'error');
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
                nestedScrollEnabled
                automaticallyAdjustKeyboardInsets={Platform.OS === 'ios'}
                contentContainerStyle={{
                    paddingHorizontal: 16,
                    paddingTop: 18,
                    paddingBottom: Math.max(insets.bottom + 140, 180),
                }}
            >
                <Text className="text-4xl font-bold" style={{ color: colors.text }}>
                    {editingStory ? 'Cập nhật truyện' : 'Thêm truyện mới'}
                </Text>

                <View
                    className="rounded-3xl border px-5 py-6 mt-6"
                    style={{ backgroundColor: colors.card, borderColor: colors.border }}
                >
                    <Text className="text-3xl font-bold mb-6" style={{ color: colors.text }}>
                        Thông tin truyện
                    </Text>

                    <View className="mb-5">
                        <Text className="text-base font-semibold mb-3" style={{ color: colors.text }}>
                            Tiêu đề *
                        </Text>
                        <TextInput
                            value={title}
                            onChangeText={setTitle}
                            placeholder="Nhập tiêu đề truyện"
                            placeholderTextColor={colors.subtext}
                            autoCorrect={false}
                            returnKeyType="next"
                            className="rounded-2xl px-4 py-4 text-[15px]"
                            style={{ backgroundColor: colors.background, color: colors.text, borderWidth: 1, borderColor: colors.border }}
                        />
                    </View>

                    <View className="mb-5">
                        <Text className="text-base font-semibold mb-3" style={{ color: colors.text }}>
                            Tác giả *
                        </Text>
                        <TextInput
                            value={author}
                            onChangeText={setAuthor}
                            placeholder="Nhập tên tác giả"
                            placeholderTextColor={colors.subtext}
                            autoCorrect={false}
                            returnKeyType="next"
                            className="rounded-2xl px-4 py-4 text-[15px]"
                            style={{ backgroundColor: colors.background, color: colors.text, borderWidth: 1, borderColor: colors.border }}
                        />
                    </View>

                    <View className="mb-5">
                        <Text className="text-base font-semibold mb-3" style={{ color: colors.text }}>
                            Mô tả
                        </Text>
                        <TextInput
                            value={description}
                            onChangeText={setDescription}
                            placeholder="Mô tả nội dung truyện"
                            placeholderTextColor={colors.subtext}
                            multiline
                            textAlignVertical="top"
                            autoCorrect={false}
                            className="rounded-2xl px-4 py-4 text-[15px] min-h-[140px]"
                            style={{ backgroundColor: colors.background, color: colors.text, borderWidth: 1, borderColor: colors.border }}
                        />
                    </View>

                    <CoverImagePicker
                        colors={colors}
                        disabled={submitting}
                        isUploading={submitting}
                        selectedFile={selectedFile}
                        currentImageUri={existingCoverImage}
                        title="Ảnh bìa"
                        emptyTitle="Chọn ảnh bìa từ thiết bị"
                        helperText="Ảnh sẽ được upload trực tiếp lên Cloudinary trước khi gửi dữ liệu truyện."
                        onChange={setSelectedFile}
                        onError={(message) => showToast(message, 'error')}
                    />

                    <View className="mb-5">
                        <Text className="text-base font-semibold mb-3" style={{ color: colors.text }}>
                            Trạng thái
                        </Text>
                        <View className="flex-row gap-3">
                            {[
                                { key: 'ongoing', label: 'Đang tiến hành' },
                                { key: 'completed', label: 'Hoàn thành' },
                            ].map((option) => {
                                const active = status === option.key;
                                return (
                                    <TouchableOpacity
                                        key={option.key}
                                        onPress={() => setStatus(option.key as 'ongoing' | 'completed')}
                                        className="flex-1 rounded-2xl border px-4 py-4"
                                        style={{
                                            backgroundColor: active ? colors.accent : colors.background,
                                            borderColor: active ? colors.accent : colors.border,
                                        }}
                                    >
                                        <Text className="text-center font-semibold" style={{ color: active ? '#111111' : colors.text }}>
                                            {option.label}
                                        </Text>
                                    </TouchableOpacity>
                                );
                            })}
                        </View>
                    </View>

                    <View className="mb-7">
                        <Text className="text-base font-semibold mb-3" style={{ color: colors.text }}>
                            Thể loại
                        </Text>
                        <View className="flex-row flex-wrap">
                            {GENRE_OPTIONS.map((genre) => {
                                const active = genres.includes(genre);
                                return (
                                    <TouchableOpacity
                                        key={genre}
                                        onPress={() => toggleGenre(genre)}
                                        className="rounded-2xl border px-4 py-3 mr-3 mb-3"
                                        style={{
                                            backgroundColor: active ? `${colors.accent}18` : colors.background,
                                            borderColor: active ? colors.accent : colors.border,
                                        }}
                                    >
                                        <Text className="font-semibold" style={{ color: active ? colors.accent : colors.text }}>
                                            {genre}
                                        </Text>
                                    </TouchableOpacity>
                                );
                            })}
                        </View>
                    </View>

                    <TouchableOpacity
                        onPress={handleSubmit}
                        disabled={!canSubmit}
                        className="rounded-2xl items-center justify-center py-4"
                        style={{
                            backgroundColor: canSubmit ? colors.accent : `${colors.accent}66`,
                        }}
                    >
                        {submitting ? (
                            <ActivityIndicator color="#111111" />
                        ) : (
                            <Text className="text-base font-bold" style={{ color: '#111111' }}>
                                {editingStory ? 'Lưu cập nhật' : 'Đăng truyện'}
                            </Text>
                        )}
                    </TouchableOpacity>
                </View>
            </ScrollView>
            </KeyboardAvoidingView>
        </View>
    );
}
