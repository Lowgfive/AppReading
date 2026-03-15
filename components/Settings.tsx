import React, { useState } from "react";
import { View, Text, TouchableOpacity, Modal, TextInput, ActivityIndicator } from "react-native";
import { LogOut } from "lucide-react-native";
import { AuthService } from "@/services/auth.service";
import { useTheme } from "@/context/ThemeContext";
import { useToast } from "@/context/ToastContext";

interface SettingsProps {
    profileData: any;
    setProfileData: (data: any) => void;
    handleSignOut: () => void;
}

export default function Settings({ profileData, setProfileData, handleSignOut }: SettingsProps) {
    const { colors } = useTheme();
    const { showToast } = useToast();

    // Edit Modal States
    const [editModalVisible, setEditModalVisible] = useState(false);
    const [editField, setEditField] = useState<'username' | 'email' | 'password' | null>(null);
    const [editValue, setEditValue] = useState('');
    const [oldPassword, setOldPassword] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    const openEditModal = (field: 'username' | 'email' | 'password') => {
        setEditField(field);
        if (field === 'username') setEditValue(profileData?.username || '');
        else if (field === 'email') setEditValue(profileData?.email || '');
        else {
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
                    showToast("Vui lòng nhập đầy đủ mật khẩu cũ và mới", "error");
                    return;
                }
                const res = await AuthService.updatePassword(oldPassword, editValue);
                if (res.success) {
                    showToast("Cập nhật mật khẩu thành công", "success");
                    setEditModalVisible(false);
                } else {
                    showToast(res.message || "Đổi mật khẩu thất bại", "error");
                }
            } else {
                const dataToUpdate: any = {};
                dataToUpdate[editField] = editValue;
                const res = await AuthService.updateProfile(dataToUpdate);
                if (res.success) {
                    setProfileData({ ...profileData, [editField]: editValue });
                    showToast("Cập nhật thông tin thành công", "success");
                    setEditModalVisible(false);
                } else {
                    showToast(res.message || "Cập nhật thông tin thất bại", "error");
                }
            }
        } catch (error: any) {
            showToast(error?.response?.data?.message || "Có lỗi xảy ra", "error");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <View className="px-6 py-6 flex-1" style={{ backgroundColor: colors.background }}>
            <View className="rounded-xl p-5 mb-8" style={{ backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border }}>
                <Text className="text-xl font-bold font-inter mb-4" style={{ color: colors.text }}>Account</Text>
                
                <TouchableOpacity className="flex-row justify-between items-center py-4 border-b" style={{ borderBottomColor: colors.border }} onPress={() => openEditModal('email')}>
                    <Text className="font-inter" style={{ color: colors.subtext }}>Email</Text>
                    <Text className="font-inter text-right flex-1 ml-4" numberOfLines={1} style={{ color: colors.text }}>{profileData?.email || 'baolong2000k@gmail.com'}</Text>
                </TouchableOpacity>
                
                <TouchableOpacity className="flex-row justify-between items-center py-4 border-b" style={{ borderBottomColor: colors.border }} onPress={() => openEditModal('username')}>
                    <Text className="font-inter" style={{ color: colors.subtext }}>Username</Text>
                    <Text className="font-inter text-right flex-1 ml-4" numberOfLines={1} style={{ color: colors.text }}>{profileData?.username || 'long'}</Text>
                </TouchableOpacity>

                <TouchableOpacity className="flex-row justify-between items-center py-4 border-b" style={{ borderBottomColor: colors.border }} onPress={() => openEditModal('password')}>
                    <Text className="font-inter" style={{ color: colors.subtext }}>Password</Text>
                    <Text className="font-inter" style={{ color: colors.text }}>********</Text>
                </TouchableOpacity>
                
                <View className="flex-row justify-between items-center pt-4">
                    <Text className="font-inter" style={{ color: colors.subtext }}>Balance</Text>
                    <View className="flex-row items-center">
                        <Text className="font-inter font-bold" style={{ color: colors.accent }}>💎 {profileData?.balance || 75} stones</Text>
                    </View>
                </View>
            </View>

            <TouchableOpacity 
                onPress={handleSignOut}
                className="flex-row items-center justify-center p-4 rounded-xl"
                style={{ backgroundColor: '#d9534f' }}
            >
                <LogOut color="white" size={20} className="mr-2" />
                <Text className="font-inter font-bold text-white text-base">Sign Out</Text>
            </TouchableOpacity>

        {/* Edit Modal */}
            <Modal visible={editModalVisible} transparent animationType="fade">
                <View className="flex-1 justify-center items-center" style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}>
                    <View className="w-11/12 p-6 rounded-2xl" style={{ backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border }}>
                        <Text className="text-xl font-bold font-inter mb-4" style={{ color: colors.text }}>
                            Chỉnh sửa {editField === 'password' ? 'Mật khẩu' : editField === 'email' ? 'Email' : 'Username'}
                        </Text>

                        {editField === 'password' && (
                            <TextInput 
                                className="w-full px-4 py-3 rounded-xl mb-4 font-inter" 
                                style={{ backgroundColor: colors.background, borderWidth: 1, borderColor: colors.border, color: colors.text }}
                                placeholder="Mật khẩu cũ" 
                                placeholderTextColor={colors.iconMuted} 
                                secureTextEntry
                                value={oldPassword} 
                                onChangeText={setOldPassword} 
                            />
                        )}

                        <TextInput 
                            className="w-full px-4 py-3 rounded-xl mb-6 font-inter" 
                            style={{ backgroundColor: colors.background, borderWidth: 1, borderColor: colors.border, color: colors.text }}
                            placeholder={editField === 'password' ? 'Mật khẩu mới' : `Nhập ${editField} mới`} 
                            placeholderTextColor={colors.iconMuted} 
                            secureTextEntry={editField === 'password'}
                            value={editValue} 
                            onChangeText={setEditValue} 
                        />

                        <View className="flex-row justify-end gap-x-3">
                            <TouchableOpacity onPress={() => setEditModalVisible(false)} className="px-6 py-3 rounded-xl border" style={{ borderColor: colors.border }}>
                                <Text className="font-inter font-bold" style={{ color: colors.text }}>Hủy</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={handleSaveProfileOptions} disabled={isSaving} className="px-6 py-3 rounded-xl" style={{ backgroundColor: colors.accent }}>
                                {isSaving ? <ActivityIndicator color="white" /> : <Text className="font-inter font-bold text-white">Lưu</Text>}
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
}
