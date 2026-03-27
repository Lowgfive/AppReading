import React, { createContext, PropsWithChildren, useContext, useEffect, useMemo, useState } from "react";
import { AuthService } from "@/services/auth.service";
import { Storage } from "./wrapper";

export type Language = "en" | "vi";

type TranslationKey =
    | "tabs.home"
    | "tabs.search"
    | "tabs.library"
    | "tabs.chat"
    | "tabs.profile"
    | "menu.home"
    | "menu.search"
    | "menu.library"
    | "menu.profile"
    | "menu.signIn"
    | "menu.signOut"
    | "auth.welcome"
    | "auth.signInPrompt"
    | "auth.signIn"
    | "auth.createAccount"
    | "header.appName"
    | "profile.defaultUser"
    | "profile.defaultBio"
    | "profile.favorites"
    | "profile.settings"
    | "profile.storiesRead"
    | "profile.openAdmin"
    | "profile.noFavorites"
    | "profile.exploreNow"
    | "profile.inDevelopment"
    | "profile.loadFavoritesError"
    | "profile.signOutSuccess"
    | "profile.signOutFailed"
    | "settings.account"
    | "settings.email"
    | "settings.username"
    | "settings.password"
    | "settings.language"
    | "settings.languageEnglish"
    | "settings.languageVietnamese"
    | "settings.editTitleEmail"
    | "settings.editTitleUsername"
    | "settings.editTitlePassword"
    | "settings.oldPassword"
    | "settings.newPassword"
    | "settings.enterNewValue"
    | "settings.cancel"
    | "settings.save"
    | "settings.signOut"
    | "settings.fillPasswords"
    | "settings.passwordUpdated"
    | "settings.passwordUpdateFailed"
    | "settings.profileUpdated"
    | "settings.profileUpdateFailed"
    | "settings.genericError"
    | "settings.languageUpdated"
    | "topup.title"
    | "topup.sandbox"
    | "topup.currentBalance"
    | "topup.stones"
    | "topup.exchangeRate"
    | "topup.paymentSuccess"
    | "topup.paymentPending"
    | "topup.receivedFromTransaction"
    | "topup.choosePackage"
    | "topup.receive"
    | "topup.orEnterAmount"
    | "topup.exampleAmount"
    | "topup.amountRule"
    | "topup.summary"
    | "topup.amount"
    | "topup.stonesReceived"
    | "topup.payWithVnpay"
    | "topup.refreshBalance"
    | "topup.toastSuccess"
    | "topup.toastFailed"
    | "topup.toastLoadPackagesFailed"
    | "topup.toastAmountInvalid"
    | "topup.toastInitPaymentFailed"
    | "profile.editProfile";

const LANGUAGE_KEY = "app_language";

const translations: Record<Language, Record<TranslationKey, string>> = {
    en: {
        "tabs.home": "Home",
        "tabs.search": "Search",
        "tabs.library": "Library",
        "tabs.chat": "Chat",
        "tabs.profile": "Profile",
        "menu.home": "Home",
        "menu.search": "Search",
        "menu.library": "Library",
        "menu.profile": "Profile",
        "menu.signIn": "Sign In",
        "menu.signOut": "Sign Out",
        "auth.welcome": "Welcome to Storytime",
        "auth.signInPrompt": "Sign in to access your favorites, reading history, and personalized recommendations.",
        "auth.signIn": "Sign In",
        "auth.createAccount": "Create Account",
        "header.appName": "Storytime",
        "profile.defaultUser": "User",
        "profile.defaultBio": "Write something about yourself...",
        "profile.favorites": "Favorites",
        "profile.settings": "Settings",
        "profile.storiesRead": "Stories Read",
        "profile.openAdmin": "Open Admin Dashboard",
        "profile.noFavorites": "No favorites yet",
        "profile.exploreNow": "Explore Now",
        "profile.inDevelopment": "This feature is in development",
        "profile.loadFavoritesError": "Something went wrong. Please try again.",
        "profile.signOutSuccess": "Signed out successfully",
        "profile.signOutFailed": "Failed to sign out",
        "settings.account": "Account",
        "settings.email": "Email",
        "settings.username": "Username",
        "settings.password": "Password",
        "settings.language": "Language",
        "settings.languageEnglish": "English",
        "settings.languageVietnamese": "Vietnamese",
        "settings.editTitleEmail": "Edit Email",
        "settings.editTitleUsername": "Edit Username",
        "settings.editTitlePassword": "Edit Password",
        "settings.oldPassword": "Current password",
        "settings.newPassword": "New password",
        "settings.enterNewValue": "Enter new value",
        "settings.cancel": "Cancel",
        "settings.save": "Save",
        "settings.signOut": "Sign Out",
        "settings.fillPasswords": "Please enter both current and new passwords",
        "settings.passwordUpdated": "Password updated successfully",
        "settings.passwordUpdateFailed": "Failed to update password",
        "settings.profileUpdated": "Profile updated successfully",
        "settings.profileUpdateFailed": "Failed to update profile",
        "settings.genericError": "Something went wrong",
        "settings.languageUpdated": "Language updated successfully",
        "topup.title": "Top Up Stones",
        "topup.sandbox": "VNPay Sandbox",
        "topup.currentBalance": "Current balance",
        "topup.stones": "Stones",
        "topup.exchangeRate": "Exchange rate: 1,000 VND = 10 Stones",
        "topup.paymentSuccess": "Payment successful",
        "topup.paymentPending": "Payment not completed",
        "topup.receivedFromTransaction": "Received {stones} Stones from transaction {amount} VND.",
        "topup.choosePackage": "Choose a package",
        "topup.receive": "Receive {stones} Stones",
        "topup.orEnterAmount": "Or enter an amount",
        "topup.exampleAmount": "Example: 150000",
        "topup.amountRule": "Amount must be divisible by 1,000 VND.",
        "topup.summary": "Transaction summary",
        "topup.amount": "Top-up amount",
        "topup.stonesReceived": "Stones received",
        "topup.payWithVnpay": "Pay with VNPay Sandbox",
        "topup.refreshBalance": "Refresh balance",
        "topup.toastSuccess": "Top up successful",
        "topup.toastFailed": "Payment failed",
        "topup.toastLoadPackagesFailed": "Cannot load top-up packages",
        "topup.toastAmountInvalid": "Amount must be at least 1,000 VND and divisible by 1,000",
        "topup.toastInitPaymentFailed": "Cannot initialize VNPay payment",
        "profile.editProfile" : "Edit Profile"
    },
    vi: {
        "tabs.home": "Trang chủ",
        "tabs.search": "Tìm kiếm",
        "tabs.library": "Thư viện",
        "tabs.chat": "Tin nhắn",
        "tabs.profile": "Cá nhân",
        "menu.home": "Trang chủ",
        "menu.search": "Tìm kiếm",
        "menu.library": "Thư viện",
        "menu.profile": "Cá nhân",
        "menu.signIn": "Đăng nhập",
        "menu.signOut": "Đăng xuất",
        "auth.welcome": "Chào mừng đến Storytime",
        "auth.signInPrompt": "Đăng nhập để xem danh sách yêu thích, lịch sử đọc và gợi ý dành riêng cho bạn.",
        "auth.signIn": "Đăng nhập",
        "auth.createAccount": "Tạo tài khoản",
        "header.appName": "Storytime",
        "profile.defaultUser": "Người dùng",
        "profile.defaultBio": "Hãy viết đôi điều về bản thân...",
        "profile.favorites": "Yêu thích",
        "profile.settings": "Cài đặt",
        "profile.storiesRead": "Truyện đã đọc",
        "profile.openAdmin": "Mở trang quản trị",
        "profile.noFavorites": "Bạn chưa có truyện yêu thích",
        "profile.exploreNow": "Khám phá ngay",
        "profile.inDevelopment": "Tính năng đang được phát triển",
        "profile.loadFavoritesError": "Đã có lỗi xảy ra. Vui lòng thử lại.",
        "profile.signOutSuccess": "Đăng xuất thành công",
        "profile.signOutFailed": "Đăng xuất thất bại",
        "settings.account": "Tài khoản",
        "settings.email": "Email",
        "settings.username": "Tên người dùng",
        "settings.password": "Mật khẩu",
        "settings.language": "Ngôn ngữ",
        "settings.languageEnglish": "Tiếng Anh",
        "settings.languageVietnamese": "Tiếng Việt",
        "settings.editTitleEmail": "Chỉnh sửa Email",
        "settings.editTitleUsername": "Chỉnh sửa tên người dùng",
        "settings.editTitlePassword": "Đổi mật khẩu",
        "settings.oldPassword": "Mật khẩu hiện tại",
        "settings.newPassword": "Mật khẩu mới",
        "settings.enterNewValue": "Nhập giá trị mới",
        "settings.cancel": "Hủy",
        "settings.save": "Lưu",
        "settings.signOut": "Đăng xuất",
        "settings.fillPasswords": "Vui lòng nhập đầy đủ mật khẩu hiện tại và mật khẩu mới",
        "settings.passwordUpdated": "Cập nhật mật khẩu thành công",
        "settings.passwordUpdateFailed": "Đổi mật khẩu thất bại",
        "settings.profileUpdated": "Cập nhật thông tin thành công",
        "settings.profileUpdateFailed": "Cập nhật thông tin thất bại",
        "settings.genericError": "Có lỗi xảy ra",
        "settings.languageUpdated": "Cập nhật ngôn ngữ thành công",
        "topup.title": "Nạp Stone",
        "topup.sandbox": "VNPay Sandbox",
        "topup.currentBalance": "Số dư hiện tại",
        "topup.stones": "Stone",
        "topup.exchangeRate": "Tỷ lệ quy đổi: 1,000 VND = 10 Stone",
        "topup.paymentSuccess": "Thanh toán thành công",
        "topup.paymentPending": "Thanh toán chưa thành công",
        "topup.receivedFromTransaction": "Đã nhận {stones} Stone từ giao dịch {amount} VND.",
        "topup.choosePackage": "Chọn gói nạp",
        "topup.receive": "Nhận {stones} Stone",
        "topup.orEnterAmount": "Hoặc nhập số tiền",
        "topup.exampleAmount": "Ví dụ: 150000",
        "topup.amountRule": "Số tiền phải chia hết cho 1,000 VND.",
        "topup.summary": "Tóm tắt giao dịch",
        "topup.amount": "Số tiền nạp",
        "topup.stonesReceived": "Stone nhận được",
        "topup.payWithVnpay": "Thanh toán qua VNPay Sandbox",
        "topup.refreshBalance": "Làm mới số dư",
        "topup.toastSuccess": "Nạp thành công",
        "topup.toastFailed": "Thanh toán thất bại",
        "topup.toastLoadPackagesFailed": "Không thể tải gói nạp",
        "topup.toastAmountInvalid": "Số tiền phải từ 1,000 VND trở lên và chia hết cho 1,000",
        "topup.toastInitPaymentFailed": "Không thể khởi tạo thanh toán VNPay",
        "profile.editProfile": "Chỉnh sửa"
    },
};

type LanguageContextType = {
    language: Language;
    setLanguage: (nextLanguage: Language) => Promise<void>;
    t: (key: TranslationKey, params?: Record<string, string | number>) => string;
};

const LanguageContext = createContext<LanguageContextType>({
    language: "vi",
    setLanguage: async () => {},
    t: (key) => key,
});

export function LanguageProvider({ children }: PropsWithChildren) {
    const [language, setLanguageState] = useState<Language>("vi");

    useEffect(() => {
        const loadLanguage = async () => {
            const storedLanguage = await Storage.getItem(LANGUAGE_KEY);
            if (storedLanguage === "en" || storedLanguage === "vi") {
                setLanguageState(storedLanguage);
                return;
            }

            try {
                const token = await AuthService.getToken();
                if (!token) return;

                const profileRes = await AuthService.getProfile();
                const profileLanguage = profileRes?.user?.language;
                if (profileLanguage === "en" || profileLanguage === "vi") {
                    setLanguageState(profileLanguage);
                    await Storage.setItem(LANGUAGE_KEY, profileLanguage);
                }
            } catch (error) {
                console.log("Unable to load language preference:", error);
            }
        };

        loadLanguage();
    }, []);

    const setLanguage = async (nextLanguage: Language) => {
        setLanguageState(nextLanguage);
        await Storage.setItem(LANGUAGE_KEY, nextLanguage);
    };

    const value = useMemo(
        () => ({
            language,
            setLanguage,
            t: (key: TranslationKey, params?: Record<string, string | number>) => {
                const template = translations[language][key] ?? key;
                if (!params) return template;

                return Object.entries(params).reduce(
                    (result, [paramKey, value]) => result.replaceAll(`{${paramKey}}`, String(value)),
                    template
                );
            },
        }),
        [language]
    );

    return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export const useLanguage = () => useContext(LanguageContext);
