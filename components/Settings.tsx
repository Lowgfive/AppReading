import React, { useMemo, useState } from "react";
import { View, Text, TouchableOpacity, Modal, TextInput, ActivityIndicator, Platform, KeyboardAvoidingView } from "react-native";
import { LogOut, Camera, Edit3 } from "lucide-react-native";
import * as ImagePicker from "expo-image-picker";
import { Language, useLanguage } from "@/context/LanguageContext";
import { AuthService } from "@/services/auth.service";
import { AppService } from "@/services/app.service";
import { useTheme } from "@/context/ThemeContext";
import { useToast } from "@/context/ToastContext";
import CoverImagePicker from "./CoverImagePicker";

interface SettingsProps {
    profileData: any;
    setProfileData: (data: any) => void;
    handleSignOut: () => void;
    onProfileUpdated?: (data: any) => void;
}

export default function Settings({ profileData, setProfileData, handleSignOut, onProfileUpdated }: SettingsProps) {
    const { colors } = useTheme();
    const { language, setLanguage, t } = useLanguage();
    const { showToast } = useToast();

    const [editModalVisible, setEditModalVisible] = useState(false);
    const [editField, setEditField] = useState<'username' | 'email' | 'password' | 'description' | null>(null);
    const [editValue, setEditValue] = useState('');
    const [oldPassword, setOldPassword] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [avatarFile, setAvatarFile] = useState<ImagePicker.ImagePickerAsset | null>(null);
    const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);

    const currentDescription = useMemo(() => profileData?.description || '', [profileData?.description]);

    const applyProfileData = (nextProfile: any) => {
        setProfileData(nextProfile);
        onProfileUpdated?.(nextProfile);
    };

    const openEditModal = (field: 'username' | 'email' | 'password' | 'description') => {
        setEditField(field);

        if (field === 'username') {
            setEditValue(profileData?.username || '');
        } else if (field === 'email') {
            setEditValue(profileData?.email || '');
        } else if (field === 'description') {
            setEditValue(profileData?.description || '');
        } else {
            setEditValue('');
            setOldPassword('');
        }

        setEditModalVisible(true);
    };

    const handleSaveProfileOptions = async () => {
        if (!editField) return;

        try {
            setIsSaving(true);

            if (editField === 'password') {
                if (!oldPassword || !editValue) {
                    showToast(t("settings.fillPasswords"), "error");
                    return;
                }

                const res = await AuthService.updatePassword(oldPassword, editValue);
                if (res.success) {
                    showToast(t("settings.passwordUpdated"), "success");
                    setEditModalVisible(false);
                } else {
                    showToast(res.message || t("settings.passwordUpdateFailed"), "error");
                }

                return;
            }

            const dataToUpdate: any = {};
            dataToUpdate[editField] = editValue;

            const res = await AuthService.updateProfile(dataToUpdate);
            if (res.success) {
                const nextProfile = { ...profileData, ...(res.data || dataToUpdate) };
                applyProfileData(nextProfile);
                showToast(t("settings.profileUpdated"), "success");
                setEditModalVisible(false);
            } else {
                showToast(res.message || t("settings.profileUpdateFailed"), "error");
            }
        } catch (error: any) {
            showToast(error?.response?.data?.message || error?.message || t("settings.genericError"), "error");
        } finally {
            setIsSaving(false);
        }
    };

    const handleAvatarUpdate = async () => {
        if (!avatarFile?.uri) return;

        try {
            setIsUploadingAvatar(true);

            const avatarUrl = await AppService.uploadImageToCloudinary({
                uri: avatarFile.uri,
                fileName: avatarFile.fileName,
                mimeType: avatarFile.mimeType,
                file: Platform.OS === 'web' ? avatarFile.file : undefined,
                base64: Platform.OS !== 'web' ? avatarFile.base64 : undefined,
            });

            const res = await AuthService.updateAvatar(avatarUrl);
            if (res.success) {
                const nextProfile = { ...profileData, ...(res.data || {}), avatar: avatarUrl };
                applyProfileData(nextProfile);
                setAvatarFile(null);
                showToast(t("settings.profileUpdated"), "success");
            } else {
                showToast(res.message || t("settings.profileUpdateFailed"), "error");
            }
        } catch (error: any) {
            console.error("Avatar update failed:", error);
            showToast(error?.response?.data?.message || error?.message || t("settings.genericError"), "error");
        } finally {
            setIsUploadingAvatar(false);
        }
    };

    const handleLanguageChange = async (nextLanguage: Language) => {
        if (nextLanguage === language) return;

        try {
            setIsSaving(true);
            const res = await AuthService.updateProfile({ language: nextLanguage });
            if (res.success) {
                await setLanguage(nextLanguage);
                applyProfileData({ ...profileData, language: nextLanguage });
                showToast(t("settings.languageUpdated"), "success");
            } else {
                showToast(res.message || t("settings.profileUpdateFailed"), "error");
            }
        } catch (error: any) {
            showToast(error?.response?.data?.message || error?.message || t("settings.genericError"), "error");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <View className="px-6 py-6 flex-1" style={{ backgroundColor: colors.background }}>
            <View className="rounded-xl p-5 mb-6" style={{ backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border }}>
                <Text className="text-xl font-bold font-inter mb-4" style={{ color: colors.text }}>
                    Hồ sơ cá nhân
                </Text>

                <CoverImagePicker
                    colors={colors}
                    selectedFile={avatarFile}
                    currentImageUri={profileData?.avatar}
                    isUploading={isUploadingAvatar}
                    disabled={isUploadingAvatar}
                    title="Ảnh đại diện"
                    emptyTitle="Chọn ảnh đại diện"
                    helperText="Ảnh sẽ được upload lên Cloudinary trước, sau đó lưu URL xuống backend."
                    aspectRatio={1}
                    onChange={setAvatarFile}
                    onError={(message) => showToast(message, 'error')}
                />

                <TouchableOpacity
                    onPress={handleAvatarUpdate}
                    disabled={!avatarFile || isUploadingAvatar}
                    className="rounded-2xl flex-row items-center justify-center py-3 mb-4"
                    style={{ backgroundColor: avatarFile && !isUploadingAvatar ? colors.accent : `${colors.accent}66` }}
                >
                    {isUploadingAvatar ? (
                        <ActivityIndicator color="#111111" />
                    ) : (
                        <>
                            <Camera color="#111111" size={16} />
                            <Text className="font-bold ml-2" style={{ color: "#111111" }}>
                                Cập nhật ảnh đại diện
                            </Text>
                        </>
                    )}
                </TouchableOpacity>

                <TouchableOpacity className="flex-row justify-between items-center py-4 border-b" style={{ borderBottomColor: colors.border }} onPress={() => openEditModal('username')}>
                    <View className="flex-1 pr-4">
                        <Text className="font-inter" style={{ color: colors.subtext }}>{t("settings.username")}</Text>
                        <Text className="font-inter mt-1" style={{ color: colors.text }}>
                            {profileData?.username || t("profile.defaultUser")}
                        </Text>
                    </View>
                    <Edit3 color={colors.iconMuted} size={16} />
                </TouchableOpacity>

                <TouchableOpacity className="flex-row justify-between items-start py-4 border-b" style={{ borderBottomColor: colors.border }} onPress={() => openEditModal('description')}>
                    <View className="flex-1 pr-4">
                        <Text className="font-inter" style={{ color: colors.subtext }}>Mô tả bản thân</Text>
                        <Text className="font-inter mt-1 leading-6" style={{ color: colors.text }}>
                            {currentDescription || t("profile.defaultBio")}
                        </Text>
                    </View>
                    <Edit3 color={colors.iconMuted} size={16} style={{ marginTop: 4 }} />
                </TouchableOpacity>

                <TouchableOpacity className="flex-row justify-between items-center py-4" onPress={() => openEditModal('email')}>
                    <View className="flex-1 pr-4">
                        <Text className="font-inter" style={{ color: colors.subtext }}>{t("settings.email")}</Text>
                        <Text className="font-inter mt-1" style={{ color: colors.text }}>
                            {profileData?.email || ''}
                        </Text>
                    </View>
                    <Edit3 color={colors.iconMuted} size={16} />
                </TouchableOpacity>
            </View>

            <View className="rounded-xl p-5 mb-8" style={{ backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border }}>
                <Text className="text-xl font-bold font-inter mb-4" style={{ color: colors.text }}>{t("settings.account")}</Text>

                <TouchableOpacity className="flex-row justify-between items-center py-4 border-b" style={{ borderBottomColor: colors.border }} onPress={() => openEditModal('password')}>
                    <Text className="font-inter" style={{ color: colors.subtext }}>{t("settings.password")}</Text>
                    <Text className="font-inter" style={{ color: colors.text }}>********</Text>
                </TouchableOpacity>

                <View className="py-4">
                    <Text className="font-inter mb-3" style={{ color: colors.subtext }}>{t("settings.language")}</Text>
                    <View className="flex-row gap-3">
                        <TouchableOpacity
                            onPress={() => handleLanguageChange("vi")}
                            disabled={isSaving}
                            className="flex-1 py-3 rounded-xl items-center border"
                            style={{
                                borderColor: language === "vi" ? colors.accent : colors.border,
                                backgroundColor: language === "vi" ? colors.accent : "transparent",
                            }}
                        >
                            <Text className="font-inter font-bold" style={{ color: language === "vi" ? "#111111" : colors.text }}>
                                {t("settings.languageVietnamese")}
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={() => handleLanguageChange("en")}
                            disabled={isSaving}
                            className="flex-1 py-3 rounded-xl items-center border"
                            style={{
                                borderColor: language === "en" ? colors.accent : colors.border,
                                backgroundColor: language === "en" ? colors.accent : "transparent",
                            }}
                        >
                            <Text className="font-inter font-bold" style={{ color: language === "en" ? "#111111" : colors.text }}>
                                {t("settings.languageEnglish")}
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>

            <TouchableOpacity
                onPress={handleSignOut}
                className="flex-row items-center justify-center p-4 rounded-xl"
                style={{ backgroundColor: '#d9534f' }}
            >
                <LogOut color="white" size={20} className="mr-2" />
                <Text className="font-inter font-bold text-white text-base">{t("settings.signOut")}</Text>
            </TouchableOpacity>

            <Modal visible={editModalVisible} transparent animationType="fade">
                <KeyboardAvoidingView
                    className="flex-1"
                    behavior={Platform.OS === "ios" ? "padding" : "height"}
                    keyboardVerticalOffset={Platform.OS === "ios" ? 12 : 0}
                >
                    <View className="flex-1 justify-center items-center" style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}>
                        <View className="w-11/12 p-6 rounded-2xl" style={{ backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border }}>
                        <Text className="text-xl font-bold font-inter mb-4" style={{ color: colors.text }}>
                            {editField === "password"
                                ? t("settings.editTitlePassword")
                                : editField === "email"
                                    ? t("settings.editTitleEmail")
                                    : editField === "description"
                                        ? "Chỉnh sửa mô tả"
                                        : t("settings.editTitleUsername")}
                        </Text>

                        {editField === 'password' && (
                            <TextInput
                                className="w-full px-4 py-3 rounded-xl mb-4 font-inter"
                                style={{ backgroundColor: colors.background, borderWidth: 1, borderColor: colors.border, color: colors.text }}
                                placeholder={t("settings.oldPassword")}
                                placeholderTextColor={colors.iconMuted}
                                secureTextEntry
                                autoCapitalize="none"
                                autoCorrect={false}
                                autoComplete="password"
                                textContentType="password"
                                returnKeyType="next"
                                value={oldPassword}
                                onChangeText={setOldPassword}
                            />
                        )}

                        <TextInput
                            className="w-full px-4 py-3 rounded-xl mb-6 font-inter"
                            style={{
                                backgroundColor: colors.background,
                                borderWidth: 1,
                                borderColor: colors.border,
                                color: colors.text,
                                minHeight: editField === 'description' ? 140 : undefined,
                                textAlignVertical: editField === 'description' ? 'top' : 'center',
                            }}
                            placeholder={
                                editField === "password"
                                    ? t("settings.newPassword")
                                    : editField === "description"
                                        ? "Viết vài dòng giới thiệu về bạn"
                                        : t("settings.enterNewValue")
                            }
                            placeholderTextColor={colors.iconMuted}
                            secureTextEntry={editField === 'password'}
                            multiline={editField === 'description'}
                            autoCapitalize={editField === 'email' || editField === 'password' ? 'none' : 'sentences'}
                            autoCorrect={editField !== 'email' && editField !== 'password'}
                            autoComplete={editField === 'email' ? 'email' : editField === 'password' ? 'password' : 'off'}
                            textContentType={editField === 'email' ? 'emailAddress' : editField === 'password' ? 'newPassword' : 'none'}
                            returnKeyType={editField === 'description' ? 'default' : 'done'}
                            value={editValue}
                            onChangeText={setEditValue}
                            onSubmitEditing={editField === 'description' ? undefined : handleSaveProfileOptions}
                        />

                        <View className="flex-row justify-end gap-x-3">
                            <TouchableOpacity onPress={() => setEditModalVisible(false)} className="px-6 py-3 rounded-xl border" style={{ borderColor: colors.border }}>
                                <Text className="font-inter font-bold" style={{ color: colors.text }}>{t("settings.cancel")}</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={handleSaveProfileOptions} disabled={isSaving} className="px-6 py-3 rounded-xl" style={{ backgroundColor: colors.accent }}>
                                {isSaving ? <ActivityIndicator color="white" /> : <Text className="font-inter font-bold text-white">{t("settings.save")}</Text>}
                            </TouchableOpacity>
                        </View>
                    </View>
                    </View>
                </KeyboardAvoidingView>
            </Modal>
        </View>
    );
}
