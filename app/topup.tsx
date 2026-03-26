import React, { useContext, useEffect, useState } from 'react';
import { ActivityIndicator, Platform, Pressable, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import AppHeader from '@/components/AppHeader';
import { useTheme } from '@/context/ThemeContext';
import { AppService } from '@/services/app.service';
import { AppContext } from '@/context/AppContext';
import { useLocalSearchParams } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import { Gem, Wallet, ArrowRight, RefreshCcw } from 'lucide-react-native';

type TopupPackage = {
    amount: number;
    label: string;
    stones: number;
};

export default function TopUpScreen() {
    const { colors } = useTheme();
    const params = useLocalSearchParams<{
        status?: string;
        message?: string;
        stones?: string;
        amount?: string;
        paymentRef?: string;
        balance?: string;
    }>();
    const paymentStatus = Array.isArray(params.status) ? params.status[0] : params.status;
    const paymentMessage = Array.isArray(params.message) ? params.message[0] : params.message;
    const paymentStones = Array.isArray(params.stones) ? params.stones[0] : params.stones;
    const paymentAmount = Array.isArray(params.amount) ? params.amount[0] : params.amount;
    const paymentRef = Array.isArray(params.paymentRef) ? params.paymentRef[0] : params.paymentRef;
    const appContext = useContext(AppContext);
    const balance = appContext?.balance ?? 0;
    const fetchBalance = appContext?.fetchBalance || (async () => {});
    const showToast = appContext?.showToast || (() => {});

    const [packages, setPackages] = useState<TopupPackage[]>([]);
    const [selectedAmount, setSelectedAmount] = useState<number>(100000);
    const [customAmount, setCustomAmount] = useState("100000");
    const [loading, setLoading] = useState(true);
    const [paying, setPaying] = useState(false);
    const [lastHandledRef, setLastHandledRef] = useState<string | null>(null);

    useEffect(() => {
        loadPackages();
    }, []);

    useEffect(() => {
        if (!paymentRef || lastHandledRef === paymentRef) {
            return;
        }

        setLastHandledRef(paymentRef);

        if (paymentStatus === "success") {
            fetchBalance();
            showToast(paymentMessage || "Top up successful", "success");
            return;
        }

        if (paymentStatus === "failed") {
            showToast(paymentMessage || "Payment failed", "error");
        }
    }, [paymentStatus, paymentMessage, paymentRef, lastHandledRef, fetchBalance, showToast]);

    const loadPackages = async () => {
        try {
            setLoading(true);
            const res = await AppService.getTopupPackages();
            setPackages(res.packages || []);
        } catch (error) {
            console.error("Failed to load topup packages", error);
            showToast("Cannot load top-up packages", "error");
        } finally {
            setLoading(false);
        }
    };

    const normalizeAmount = (value: string) => {
        const digits = value.replace(/\D/g, "");
        setCustomAmount(digits);
        if (!digits) {
            setSelectedAmount(0);
            return;
        }
        setSelectedAmount(Number(digits));
    };

    const selectedStones = selectedAmount > 0 ? Math.floor(selectedAmount / 1000) * 10 : 0;

    const handlePackageSelect = (amount: number) => {
        setSelectedAmount(amount);
        setCustomAmount(String(amount));
    };

    const handlePayment = async () => {
        if (!selectedAmount || selectedAmount < 1000 || selectedAmount % 1000 !== 0) {
            showToast("Amount must be at least 1,000 VND and divisible by 1,000", "error");
            return;
        }

        try {
            setPaying(true);
            const res = await AppService.createVnpayPaymentUrl(selectedAmount);

            if (Platform.OS === "web") {
                await WebBrowser.openBrowserAsync(res.paymentUrl);
                return;
            }

            await WebBrowser.openAuthSessionAsync(res.paymentUrl, "appreading://topup");
            await fetchBalance();
        } catch (error: any) {
            const message = error?.response?.data?.message || "Cannot initialize VNPay payment";
            showToast(message, "error");
        } finally {
            setPaying(false);
        }
    };

    return (
        <View className="flex-1" style={{ backgroundColor: colors.background }}>
            <AppHeader />
            <ScrollView className="flex-1" contentContainerStyle={{ padding: 20, paddingBottom: 40 }}>
                <View
                    className="rounded-[28px] p-6 mb-5"
                    style={{ backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border }}
                >
                    <View className="flex-row items-center justify-between mb-6">
                        <View>
                            <Text className="text-sm font-inter mb-2" style={{ color: colors.subtext }}>
                                VNPay Sandbox
                            </Text>
                            <Text className="text-[28px] font-inter font-bold" style={{ color: colors.text }}>
                                Nap Stone
                            </Text>
                        </View>
                        <View
                            className="w-14 h-14 rounded-full items-center justify-center"
                            style={{ backgroundColor: `${colors.accent}20` }}
                        >
                            <Wallet color={colors.accent} size={24} />
                        </View>
                    </View>

                    <View className="rounded-2xl px-4 py-4 mb-4" style={{ backgroundColor: colors.background }}>
                        <Text className="text-sm font-inter mb-2" style={{ color: colors.subtext }}>
                            So du hien tai
                        </Text>
                        <View className="flex-row items-center">
                            <Gem color={colors.accent} size={18} />
                            <Text className="text-2xl font-inter font-bold ml-2" style={{ color: colors.text }}>
                                {balance}
                            </Text>
                            <Text className="text-sm font-inter ml-2" style={{ color: colors.subtext }}>
                                Stones
                            </Text>
                        </View>
                    </View>

                    <Text className="text-sm font-inter" style={{ color: colors.subtext }}>
                        Ty le quy doi: 1,000 VND = 10 Stone
                    </Text>
                </View>

                {paymentStatus ? (
                    <View
                        className="rounded-2xl p-4 mb-5"
                        style={{
                            backgroundColor: paymentStatus === "success" ? `${colors.accent}18` : colors.card,
                            borderWidth: 1,
                            borderColor: paymentStatus === "success" ? `${colors.accent}66` : colors.border,
                        }}
                    >
                        <Text className="text-base font-inter font-bold mb-1" style={{ color: colors.text }}>
                            {paymentStatus === "success" ? "Thanh toan thanh cong" : "Thanh toan chua thanh cong"}
                        </Text>
                        <Text className="text-sm font-inter mb-2" style={{ color: colors.subtext }}>
                            {paymentMessage}
                        </Text>
                        {!!paymentStones && (
                            <Text className="text-sm font-inter" style={{ color: colors.text }}>
                                Da nhan {paymentStones} Stones tu giao dich {paymentAmount} VND.
                            </Text>
                        )}
                    </View>
                ) : null}

                <View className="mb-5">
                    <Text className="text-lg font-inter font-bold mb-3" style={{ color: colors.text }}>
                        Chon goi nap
                    </Text>

                    {loading ? (
                        <ActivityIndicator size="large" color={colors.accent} className="mt-6" />
                    ) : (
                        <View className="gap-3">
                            {packages.map((item) => {
                                const active = selectedAmount === item.amount;

                                return (
                                    <Pressable
                                        key={item.amount}
                                        className="rounded-2xl p-4"
                                        style={{
                                            backgroundColor: active ? `${colors.accent}18` : colors.card,
                                            borderWidth: 1,
                                            borderColor: active ? colors.accent : colors.border,
                                        }}
                                        onPress={() => handlePackageSelect(item.amount)}
                                    >
                                        <View className="flex-row items-center justify-between">
                                            <View>
                                                <Text className="text-lg font-inter font-bold mb-1" style={{ color: colors.text }}>
                                                    {item.label}
                                                </Text>
                                                <Text className="text-sm font-inter" style={{ color: colors.subtext }}>
                                                    Nhan {item.stones} Stones
                                                </Text>
                                            </View>
                                            <View className="flex-row items-center">
                                                <Gem color={colors.accent} size={16} />
                                                <Text className="ml-2 font-inter font-bold" style={{ color: colors.text }}>
                                                    {item.stones}
                                                </Text>
                                            </View>
                                        </View>
                                    </Pressable>
                                );
                            })}
                        </View>
                    )}
                </View>

                <View className="rounded-2xl p-5 mb-5" style={{ backgroundColor: colors.card }}>
                    <Text className="text-lg font-inter font-bold mb-3" style={{ color: colors.text }}>
                        Hoac nhap so tien
                    </Text>
                    <TextInput
                        keyboardType="numeric"
                        value={customAmount}
                        onChangeText={normalizeAmount}
                        placeholder="Vi du: 150000"
                        placeholderTextColor={colors.iconMuted}
                        className="rounded-2xl px-4 py-4 text-base font-inter"
                        style={{ backgroundColor: colors.background, color: colors.text }}
                    />
                    <Text className="text-sm font-inter mt-3" style={{ color: colors.subtext }}>
                        So tien phai chia het cho 1,000 VND.
                    </Text>
                </View>

                <View className="rounded-2xl p-5 mb-6" style={{ backgroundColor: colors.card }}>
                    <Text className="text-lg font-inter font-bold mb-3" style={{ color: colors.text }}>
                        Tom tat giao dich
                    </Text>
                    <View className="flex-row items-center justify-between mb-2">
                        <Text className="text-sm font-inter" style={{ color: colors.subtext }}>So tien nap</Text>
                        <Text className="text-sm font-inter font-bold" style={{ color: colors.text }}>
                            {selectedAmount.toLocaleString("vi-VN")} VND
                        </Text>
                    </View>
                    <View className="flex-row items-center justify-between">
                        <Text className="text-sm font-inter" style={{ color: colors.subtext }}>Stone nhan duoc</Text>
                        <View className="flex-row items-center">
                            <Gem color={colors.accent} size={16} />
                            <Text className="text-sm font-inter font-bold ml-2" style={{ color: colors.text }}>
                                {selectedStones}
                            </Text>
                        </View>
                    </View>
                </View>

                <TouchableOpacity
                    className="rounded-2xl px-5 py-4 flex-row items-center justify-center"
                    style={{ backgroundColor: colors.accent, opacity: paying ? 0.7 : 1 }}
                    onPress={handlePayment}
                    disabled={paying}
                >
                    {paying ? (
                        <ActivityIndicator color="#111111" />
                    ) : (
                        <>
                            <Text className="text-black font-inter font-bold text-base mr-2">
                                Thanh toan qua VNPay Sandbox
                            </Text>
                            <ArrowRight color="#111111" size={18} />
                        </>
                    )}
                </TouchableOpacity>

                <TouchableOpacity
                    className="flex-row items-center justify-center mt-4"
                    onPress={() => {
                        fetchBalance();
                        loadPackages();
                    }}
                >
                    <RefreshCcw color={colors.iconMuted} size={16} />
                    <Text className="text-sm font-inter ml-2" style={{ color: colors.subtext }}>
                        Lam moi so du
                    </Text>
                </TouchableOpacity>
            </ScrollView>
        </View>
    );
}
