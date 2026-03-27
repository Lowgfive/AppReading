import AppHeader from '@/components/AppHeader';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { useToast } from '@/context/ToastContext';
import { AppService } from '@/services/app.service';
import { Ionicons } from '@expo/vector-icons';
import { BarChart3 } from 'lucide-react-native';
import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, ScrollView, Text, View } from 'react-native';

type RevenueItem = {
    storyId: string;
    totalUnlocked: number;
    title?: string;
};

export default function AdminRevenueScreen() {
    const { colors } = useTheme();
    const { user, isLoading } = useAuth();
    const { showToast } = useToast();
    const [revenue, setRevenue] = useState<RevenueItem[]>([]);
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
                const data = await AppService.getAdminDashboard();
                if (active) {
                    setRevenue(data?.revenue || []);
                }
            } catch (error) {
                console.error('Failed to load revenue data', error);
                if (active) {
                    showToast('Không thể tải dữ liệu doanh thu.', 'error');
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

    const totalRevenue = useMemo(
        () => revenue.reduce((sum, item) => sum + item.totalUnlocked * 50, 0),
        [revenue]
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
                <View
                    className="rounded-3xl border p-5 mb-4"
                    style={{ backgroundColor: colors.card, borderColor: colors.border }}
                >
                    <View className="flex-row items-center justify-between mb-6">
                        <View className="flex-1 pr-4">
                            <Text className="text-3xl font-bold" style={{ color: colors.text }}>
                                Doanh thu truyện
                            </Text>
                            <Text className="text-sm mt-2 leading-6" style={{ color: colors.subtext }}>
                                Tổng doanh thu được tính theo số lượt mở khóa chương, mặc định 50 kim cương mỗi lượt.
                            </Text>
                        </View>
                        <BarChart3 color={colors.accent} size={24} />
                    </View>

                    <View
                        className="rounded-2xl px-4 py-4 flex-row items-center justify-between"
                        style={{ backgroundColor: colors.background }}
                    >
                        <Text className="text-sm font-medium" style={{ color: colors.subtext }}>
                            Tổng doanh thu
                        </Text>
                        <View className="flex-row items-center">
                            <Text className="text-2xl font-bold mr-2" style={{ color: colors.accent }}>
                                {totalRevenue}
                            </Text>
                            <Ionicons name="diamond" size={18} color={colors.accent} />
                        </View>
                    </View>
                </View>

                <View
                    className="rounded-3xl border p-5"
                    style={{ backgroundColor: colors.card, borderColor: colors.border }}
                >
                    <Text className="text-2xl font-bold mb-4" style={{ color: colors.text }}>
                        Chi tiết theo truyện
                    </Text>

                    {revenue.length ? (
                        <View className="gap-3">
                            {revenue.map((item) => (
                                <View
                                    key={item.storyId}
                                    className="rounded-2xl border px-4 py-4 flex-row items-center justify-between"
                                    style={{ backgroundColor: colors.background, borderColor: colors.border }}
                                >
                                    <View className="flex-1 pr-4">
                                        <Text className="text-base font-semibold" style={{ color: colors.text }}>
                                            {item.title || 'Truyện không xác định'}
                                        </Text>
                                        <Text className="text-sm mt-1" style={{ color: colors.subtext }}>
                                            {item.totalUnlocked} lượt mở khóa
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
