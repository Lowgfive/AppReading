import AppHeader from '@/components/AppHeader';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { useToast } from '@/context/ToastContext';
import { AppService } from '@/services/app.service';
import { router } from 'expo-router';
import { ArrowLeft, BookOpen, Pencil, Plus, Trash2 } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, Text, TouchableOpacity, View } from 'react-native';

type AdminStory = {
    _id: string;
    title?: string;
    name?: string;
    author?: string;
    description?: string;
    coverImageUrl?: string;
    image?: string;
    status?: 'Ongoing' | 'Completed';
    genres?: string[];
    viewCount?: number;
    totalChapters?: number;
};

export default function AdminStoriesScreen() {
    const { colors } = useTheme();
    const { user, isLoading } = useAuth();
    const { showToast } = useToast();
    const [stories, setStories] = useState<AdminStory[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (isLoading) return;
        if (user?.role !== 'admin') {
            setLoading(false);
            return;
        }

        let active = true;

        const run = async () => {
            try {
                setLoading(true);
                const res = await AppService.getAdminStories();
                if (active) {
                    setStories(res?.data || []);
                }
            } catch (error) {
                console.error('Failed to load admin stories', error);
                if (active) {
                    showToast('Không thể tải danh sách truyện.', 'error');
                }
            } finally {
                if (active) {
                    setLoading(false);
                }
            }
        };

        run();
        return () => {
            active = false;
        };
    }, [isLoading, showToast, user?.role]);

    if (loading || isLoading) {
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
            <View className="px-4 pt-5 pb-3 flex-row items-start justify-between">
                <View className="flex-row flex-1 pr-4">
                    <TouchableOpacity onPress={() => router.back()} className="mr-3 mt-1">
                        <ArrowLeft color={colors.text} size={22} />
                    </TouchableOpacity>
                    <View className="flex-1">
                        <Text className="text-4xl font-bold leading-tight" style={{ color: colors.text }}>
                            Quản lý truyện
                        </Text>
                        <Text className="text-base mt-1" style={{ color: colors.subtext }}>
                            {stories.length} truyện
                        </Text>
                    </View>
                </View>

                <TouchableOpacity
                    onPress={() => router.push('/admin/stories/create' as any)}
                    className="rounded-2xl px-4 py-4 flex-row items-center"
                    style={{ backgroundColor: colors.accent }}
                >
                    <Plus color="#111111" size={18} />
                    <Text className="ml-2 text-[15px] font-bold" style={{ color: '#111111' }}>
                        Thêm truyện
                    </Text>
                </TouchableOpacity>
            </View>

            <ScrollView horizontal showsHorizontalScrollIndicator contentContainerStyle={{ paddingBottom: 8 }}>
                <View style={{ minWidth: 760, paddingHorizontal: 16, paddingBottom: 24 }}>
                    <View
                        className="rounded-3xl border overflow-hidden"
                        style={{ backgroundColor: colors.card, borderColor: colors.border }}
                    >
                        <View
                            className="flex-row px-6 py-4 border-b"
                            style={{ borderBottomColor: colors.border, backgroundColor: colors.background }}
                        >
                            <Text style={{ width: 180, color: colors.subtext, fontWeight: '600' }}>Tiêu đề</Text>
                            <Text style={{ width: 120, color: colors.subtext, fontWeight: '600' }}>Tác giả</Text>
                            <Text style={{ width: 120, color: colors.subtext, fontWeight: '600' }}>Trạng thái</Text>
                            <Text style={{ width: 90, color: colors.subtext, fontWeight: '600' }}>Lượt xem</Text>
                            <Text style={{ width: 90, color: colors.subtext, fontWeight: '600' }}>Chương</Text>
                            <Text style={{ width: 160, color: colors.subtext, fontWeight: '600' }}>Thao tác</Text>
                        </View>

                        {stories.map((story) => {
                            const title = story.title || story.name || 'Untitled';
                            const statusLabel = story.status === 'Completed' ? 'Hoàn thành' : 'Đang tiến hành';
                            const statusColor = story.status === 'Completed' ? '#F3A51B' : '#2B2B33';
                            const statusTextColor = story.status === 'Completed' ? '#111111' : '#FFFFFF';

                            return (
                                <View
                                    key={story._id}
                                    className="flex-row px-6 py-5 border-b items-center"
                                    style={{ borderBottomColor: colors.border }}
                                >
                                    <Text style={{ width: 180, color: colors.text, fontWeight: '700', lineHeight: 28 }}>
                                        {title}
                                    </Text>
                                    <Text style={{ width: 120, color: colors.text }}>
                                        {story.author || '-'}
                                    </Text>
                                    <View style={{ width: 120 }}>
                                        <View
                                            className="rounded-full px-3 py-2 self-start"
                                            style={{ backgroundColor: statusColor }}
                                        >
                                            <Text style={{ color: statusTextColor, fontWeight: '700', fontSize: 12 }}>
                                                {statusLabel}
                                            </Text>
                                        </View>
                                    </View>
                                    <Text style={{ width: 90, color: colors.text }}>
                                        {story.viewCount || 0}
                                    </Text>
                                    <Text style={{ width: 90, color: colors.text }}>
                                        {story.totalChapters || 0}
                                    </Text>
                                    <View style={{ width: 160 }} className="flex-row items-center">
                                        <TouchableOpacity
                                            onPress={() =>
                                                router.push({
                                                    pathname: '/admin/stories/create' as any,
                                                    params: { story: JSON.stringify(story) }
                                                })
                                            }
                                            className="mr-5"
                                        >
                                            <Pencil color={colors.text} size={18} />
                                        </TouchableOpacity>
                                        <TouchableOpacity className="mr-5">
                                            <BookOpen color={colors.text} size={18} />
                                        </TouchableOpacity>
                                        <TouchableOpacity>
                                            <Trash2 color="#EF4444" size={18} />
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            );
                        })}
                    </View>
                </View>
            </ScrollView>
        </View>
    );
}
