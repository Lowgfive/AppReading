import AppHeader from '@/components/AppHeader';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { useToast } from '@/context/ToastContext';
import { AppService } from '@/services/app.service';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { BarChart3, BookOpen, FileText, MessageSquare, Plus, Users } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, Text, TouchableOpacity, View } from 'react-native';

type DashboardResponse = {
    totalStories: number;
    totalChapters: number;
    totalComments: number;
    totalUsers: number;
    revenue: Array<{
        storyId: string;
        totalUnlocked: number;
        title?: string;
    }>;
};

const statsConfig = [
    { key: 'totalStories', label: 'Truyện', icon: BookOpen, color: '#F3A51B' },
    { key: 'totalChapters', label: 'Chương', icon: FileText, color: '#4F7CFF' },
    { key: 'totalComments', label: 'Bình luận', icon: MessageSquare, color: '#4ADE80' },
    { key: 'totalUsers', label: 'Người dùng', icon: Users, color: '#F59E0B' },
] as const;

export default function AdminDashboardScreen() {
    const { colors } = useTheme();
    const { user, isLoading } = useAuth();
    const { showToast } = useToast();
    const [dashboard, setDashboard] = useState<DashboardResponse | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (isLoading) return;

        if (user?.role !== 'admin') {
            setLoading(false);
            return;
        }

        let active = true;

        const fetchDashboard = async () => {
            try {
                setLoading(true);
                const data = await AppService.getAdminDashboard();
                if (active) {
                    setDashboard(data);
                }
            } catch (error) {
                console.error('Failed to load admin dashboard', error);
                if (active) {
                    showToast('Không thể tải thống kê dashboard.', 'error');
                }
            } finally {
                if (active) {
                    setLoading(false);
                }
            }
        };

        fetchDashboard();

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
                    <Text className="text-sm mt-3 text-center leading-6" style={{ color: colors.subtext }}>
                        Khu vực này chỉ dành cho tài khoản admin.
                    </Text>
                </View>
            </View>
        );
    }

    return (
        <View className="flex-1" style={{ backgroundColor: colors.background }}>
            <AppHeader />
            <ScrollView
                className="flex-1"
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 20, paddingBottom: 32 }}
            >
                <View className="flex-row items-start justify-between mb-6">
                    <View className="flex-1 pr-4">
                        <Text className="text-4xl font-bold leading-tight" style={{ color: colors.text }}>
                            Admin Dashboard
                        </Text>
                        <Text className="text-base mt-2" style={{ color: colors.subtext }}>
                            Quản lý nội dung nền tảng
                        </Text>
                    </View>

                    <TouchableOpacity
                        onPress={() => router.push('/admin/stories/create' as any)}
                        className="rounded-2xl px-4 py-4 flex-row items-center"
                        style={{ backgroundColor: colors.accent }}
                    >
                        <Plus color="#111111" size={18} />
                        <Text className="ml-2 text-[15px] font-bold" style={{ color: '#111111' }}>
                            Thêm truyện mới
                        </Text>
                    </TouchableOpacity>
                </View>

                <View className="flex-row flex-wrap justify-between">
                    {statsConfig.map((item) => {
                        const Icon = item.icon;
                        const value = dashboard?.[item.key] ?? 0;
                        const canOpenStories = item.key === 'totalStories' || item.key === 'totalChapters';

                        return (
                            <TouchableOpacity
                                key={item.key}
                                onPress={() => {
                                    if (canOpenStories) {
                                        router.push('/admin/stories' as any);
                                    }
                                }}
                                activeOpacity={canOpenStories ? 0.8 : 1}
                                className="w-[48%] rounded-3xl border p-5 mb-4"
                                style={{ backgroundColor: colors.card, borderColor: colors.border }}
                            >
                                <View className="flex-row items-center justify-between mb-8">
                                    <Text className="text-base font-medium" style={{ color: colors.subtext }}>
                                        {item.label}
                                    </Text>
                                    <Icon color={item.color} size={20} />
                                </View>

                                <Text className="text-4xl font-bold" style={{ color: colors.text }}>
                                    {value}
                                </Text>
                            </TouchableOpacity>
                        );
                    })}
                </View>

                <TouchableOpacity
                    onPress={() => router.push('/admin/stories' as any)}
                    className="rounded-3xl border p-5 mt-2"
                    style={{ backgroundColor: colors.card, borderColor: colors.border }}
                >
                    <View className="flex-row items-center mb-3">
                        <BookOpen color={colors.accent} size={22} />
                        <Text className="text-2xl font-bold ml-3" style={{ color: colors.text }}>
                            Quản lý truyện
                        </Text>
                    </View>
                    <Text className="text-sm leading-6" style={{ color: colors.subtext }}>
                        Xem, thêm, sửa, xóa truyện và quản lý các chương.
                    </Text>
                </TouchableOpacity>

                <View
                    className="rounded-3xl border p-5 mt-4"
                    style={{ backgroundColor: colors.card, borderColor: colors.border }}
                >
                    <View className="flex-row items-center mb-3">
                        <BarChart3 color={colors.accent} size={22} />
                        <Text className="text-2xl font-bold ml-3" style={{ color: colors.text }}>
                            Doanh thu truyện
                        </Text>
                    </View>
                    <Text className="text-sm leading-6 mb-5" style={{ color: colors.subtext }}>
                        Doanh thu được tính dựa trên số lượt mở khóa chương theo từng truyện.
                    </Text>

                    {dashboard?.revenue?.length ? (
                        <View className="gap-3">
                            {dashboard.revenue.map((item) => (
                                <View
                                    key={item.storyId}
                                    className="rounded-2xl border px-4 py-4 flex-row items-center justify-between"
                                    style={{ backgroundColor: colors.background, borderColor: colors.border }}
                                >
                                    <View className="flex-1 pr-4">
                                        <Text className="text-base font-semibold" style={{ color: colors.text }}>
                                            {item.title || 'Truyện không xác định'}
                                        </Text>
                                    </View>
                                    <View className="flex-row items-center">
                                        <Text className="text-2xl font-bold mr-2" style={{ color: colors.accent }}>
                                            {item.totalUnlocked * 50}
                                        </Text>
                                        <Ionicons name="diamond" size={16} color={colors.accent} />
                                    </View>
                                </View>
                            ))}
                        </View>
                    ) : (
                        <View
                            className="rounded-2xl border px-4 py-5"
                            style={{ backgroundColor: colors.background, borderColor: colors.border }}
                        >
                            <Text className="text-sm" style={{ color: colors.subtext }}>
                                Chưa có dữ liệu doanh thu.
                            </Text>
                        </View>
                    )}
                </View>
            </ScrollView>
        </View>
    );
}
