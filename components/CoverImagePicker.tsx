import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import React from "react";
import { Platform } from "react-native";
import { ActivityIndicator, Text, TouchableOpacity, View } from "react-native";

type ThemeColors = {
    text: string;
    subtext: string;
    border: string;
    background: string;
    accent: string;
    card: string;
};

type CoverImagePickerProps = {
    colors: ThemeColors;
    disabled?: boolean;
    selectedFile: ImagePicker.ImagePickerAsset | null;
    currentImageUri?: string;
    isUploading?: boolean;
    title?: string;
    emptyTitle?: string;
    helperText?: string;
    aspectRatio?: number;
    onChange: (file: ImagePicker.ImagePickerAsset | null) => void;
    onError: (message: string) => void;
};

export default function CoverImagePicker({
    colors,
    disabled = false,
    selectedFile,
    currentImageUri,
    isUploading = false,
    title = "Anh",
    emptyTitle = "Chon anh tu thiet bi",
    helperText = "Anh se duoc upload len Cloudinary truoc khi gui du lieu.",
    aspectRatio = 2 / 3,
    onChange,
    onError,
}: CoverImagePickerProps) {
    const previewUri = selectedFile?.uri || currentImageUri;

    const pickImage = async () => {
        if (disabled || isUploading) {
            return;
        }

        try {
            const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (!permission.granted) {
                onError("Can cap quyen thu vien anh de chon anh.");
                return;
            }

            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [1, 1],
                base64: Platform.OS !== "web",
                quality: 0.9,
            });

            if (!result.canceled) {
                onChange(result.assets[0]);
            }
        } catch (error: any) {
            onError(error?.message || "Khong the mo thu vien anh tren thiet bi nay.");
        }
    };

    return (
        <View className="mb-5">
            <Text className="text-base font-semibold mb-3" style={{ color: colors.text }}>
                {title}
            </Text>

            <TouchableOpacity
                onPress={pickImage}
                disabled={disabled || isUploading}
                className="rounded-2xl border px-4 py-5"
                style={{
                    backgroundColor: colors.background,
                    borderColor: colors.border,
                    borderStyle: "dashed",
                    opacity: disabled || isUploading ? 0.7 : 1,
                }}
            >
                {previewUri ? (
                    <View>
                        <Image
                            source={{ uri: previewUri }}
                            style={{ width: "100%", aspectRatio, borderRadius: 18, backgroundColor: colors.card }}
                            contentFit="cover"
                        />

                        <Text className="text-sm font-semibold mt-3" style={{ color: colors.text }}>
                            {selectedFile?.fileName || "Anh hien tai"}
                        </Text>

                        <Text className="text-sm mt-1" style={{ color: colors.subtext }}>
                            Nhan de chon anh khac
                        </Text>
                    </View>
                ) : (
                    <View className="items-center py-4">
                        {isUploading ? <ActivityIndicator color={colors.accent} /> : null}

                        <Text className="text-base font-semibold mt-2" style={{ color: colors.text }}>
                            {emptyTitle}
                        </Text>

                        <Text className="text-sm text-center mt-2" style={{ color: colors.subtext }}>
                            {helperText}
                        </Text>
                    </View>
                )}
            </TouchableOpacity>
        </View>
    );
}
