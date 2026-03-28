import AppHeader from '@/components/AppHeader';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { useToast } from '@/context/ToastContext';
import { AppService } from '@/services/app.service';
import { router } from 'expo-router';
import { BarChart3, BookOpen, FileText, MessageSquare, Plus, Users } from 'lucide-react-native';
import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, ScrollView, Text, TouchableOpacity, View } from 'react-native';

type RevenueItem = {
    storyId: string;
    totalUnlocked: number;
    title?: string;
    viewCount?: number;
    likeCount?: number;
};

type TopStoryItem = {
    storyId: string;
    title: string;
    viewCount: number;
    likeCount: number;
    totalUnlocked: number;
};

type UserGrowthItem = {
    date: string;
    newUsers: number;
};

type DashboardResponse = {
    totalStories: number;
    totalChapters: number;
    totalComments: number;
    totalUsers: number;
    totalViews: number;
    totalChatMessages: number;
    totalTopupTransactions: number;
    totalTopupAmount: number;
    paidUsers: number;
    paidUserRate: number;
    usersByDate: UserGrowthItem[];
    revenue: RevenueItem[];
    topStories: {
        byViews: TopStoryItem[];
        byLikes: TopStoryItem[];
        byUnlocks: TopStoryItem[];
    };
};

const statsConfig = [
    { key: 'totalStories', label: 'Truyện', icon: BookOpen, color: '#F3A51B' },
    { key: 'totalChapters', label: 'Chương', icon: FileText, color: '#4F7CFF' },
    { key: 'totalComments', label: 'Bình luận', icon: MessageSquare, color: '#4ADE80' },
    { key: 'totalUsers', label: 'Người dùng', icon: Users, color: '#F59E0B' },
    { key: 'totalViews', label: 'Lượt đọc', icon: BookOpen, color: '#FB7185' },
    { key: 'totalChatMessages', label: 'Tin nhắn', icon: MessageSquare, color: '#06B6D4' },
    { key: 'totalTopupTransactions', label: 'Giao dịch nạp', icon: BarChart3, color: '#A855F7' },
    { key: 'paidUsers', label: 'User trả phí', icon: Users, color: '#0EA5E9' },
] as const;

type StatsKey = typeof statsConfig[number]['key'];

function RankingSection({
    title,
    items,
    metricKey,
    colors,
}: {
    title: string;
    items: TopStoryItem[];
    metricKey: 'viewCount' | 'likeCount' | 'totalUnlocked';
    colors: any;
}) {
    return (
        <View
            className="rounded-3xl border p-5 mt-4"
            style={{ backgroundColor: colors.card, borderColor: colors.border }}
        >
            <Text className="text-2xl font-bold" style={{ color: colors.text }}>
                {title}
            </Text>

            <View className="mt-4">
                {items.length ? items.map((item, index) => (
                    <View key={`${metricKey}-${item.storyId}-${index}`} className="flex-row items-center justify-between py-2">
                        <Text className="flex-1 pr-3" style={{ color: colors.text }}>
                            {index + 1}. {item.title}
                        </Text>
                        <Text className="font-bold" style={{ color: colors.subtext }}>
                            {item[metricKey]}
                        </Text>
                    </View>
                )) : (
                    <Text style={{ color: colors.subtext }}>Chưa có dữ liệu.</Text>
                )}
            </View>
        </View>
    );
}

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

    const totalRevenue = useMemo(
        () => (dashboard?.revenue || []).reduce((sum, item) => sum + item.totalUnlocked * 50, 0),
        [dashboard?.revenue]
    );

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
                            Trang quản trị
                        </Text>
                        <Text className="text-base mt-2" style={{ color: colors.subtext }}>
                            Thống kê, xếp hạng và tổng quan thanh toán
                        </Text>
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

                <View className="flex-row flex-wrap justify-between">
                    {statsConfig.map((item) => {
                        const Icon = item.icon;
                        const value = dashboard?.[item.key as StatsKey] ?? 0;
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

                    <TouchableOpacity
                        onPress={() => router.push('/admin/revenue' as any)}
                        activeOpacity={0.8}
                        className="w-[48%] rounded-3xl border p-5 mb-4"
                        style={{ backgroundColor: colors.card, borderColor: colors.border }}
                    >
                        <View className="flex-row items-center justify-between mb-8">
                            <Text className="text-base font-medium" style={{ color: colors.subtext }}>
                                Doanh thu
                            </Text>
                            <BarChart3 color="#FB7185" size={20} />
                        </View>

                        <Text className="text-4xl font-bold" style={{ color: colors.text }}>
                            {totalRevenue}
                        </Text>
                    </TouchableOpacity>
                </View>

                <View
                    className="rounded-3xl border p-5"
                    style={{ backgroundColor: colors.card, borderColor: colors.border }}
                >
                    <Text className="text-2xl font-bold" style={{ color: colors.text }}>
                        Tổng quan thanh toán
                    </Text>
                    <Text className="text-sm mt-3" style={{ color: colors.subtext }}>
                        Tổng giao dịch nạp: {dashboard?.totalTopupTransactions || 0}
                    </Text>
                    <Text className="text-sm mt-2" style={{ color: colors.subtext }}>
                        Tổng tiền nạp: {dashboard?.totalTopupAmount || 0} VND
                    </Text>
                    <Text className="text-sm mt-2" style={{ color: colors.subtext }}>
                        Tỉ lệ user trả phí: {dashboard?.paidUserRate || 0}%
                    </Text>
                </View>

                <View
                    className="rounded-3xl border p-5 mt-4"
                    style={{ backgroundColor: colors.card, borderColor: colors.border }}
                >
                    <Text className="text-2xl font-bold" style={{ color: colors.text }}>
                        User mới theo ngày
                    </Text>
                    <View className="mt-4">
                        {(dashboard?.usersByDate || []).map((item) => (
                            <View key={item.date} className="flex-row items-center justify-between py-2">
                                <Text style={{ color: colors.subtext }}>{item.date}</Text>
                                <Text className="font-bold" style={{ color: colors.text }}>
                                    {item.newUsers}
                                </Text>
                            </View>
                        ))}
                    </View>
                </View>

                <RankingSection
                    title="Top truyện theo lượt đọc"
                    items={dashboard?.topStories?.byViews || []}
                    metricKey="viewCount"
                    colors={colors}
                />

                <RankingSection
                    title="Top truyện theo lượt thích"
                    items={dashboard?.topStories?.byLikes || []}
                    metricKey="likeCount"
                    colors={colors}
                />

                <RankingSection
                    title="Top truyện theo lượt mở khóa"
                    items={dashboard?.topStories?.byUnlocks || []}
                    metricKey="totalUnlocked"
                    colors={colors}
                />

                <TouchableOpacity
                    onPress={() => router.push('/admin/stories' as any)}
                    className="rounded-3xl border p-5 mt-4"
                    style={{ backgroundColor: colors.card, borderColor: colors.border }}
                >
                    <View className="flex-row items-center mb-3">
                        <BookOpen color={colors.accent} size={22} />
                        <Text className="text-2xl font-bold ml-3" style={{ color: colors.text }}>
                            Quản lý truyện
                        </Text>
                    </View>
                    <Text className="text-sm leading-6" style={{ color: colors.subtext }}>
                        Mở khu quản lý truyện để thêm, sửa và quản lý chương.
                    </Text>
                </TouchableOpacity>
            </ScrollView>
        </View>
    );
}
