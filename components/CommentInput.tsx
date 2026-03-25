import React, { memo } from 'react';
import { ActivityIndicator, Text, TextInput, TouchableOpacity, View } from 'react-native';

type CommentInputProps = {
    value: string;
    onChangeText: (value: string) => void;
    onSubmit: () => void;
    submitting: boolean;
    disabled?: boolean;
    colors: {
        text: string;
        subtext: string;
        card: string;
        border: string;
        accent: string;
        inputBackground: string;
    };
};

function CommentInputComponent({
    value,
    onChangeText,
    onSubmit,
    submitting,
    disabled = false,
    colors,
}: CommentInputProps) {
    return (
        <View
            className="rounded-3xl border p-4 mb-5"
            style={{ backgroundColor: colors.card, borderColor: colors.border }}
        >
            <TextInput
                value={value}
                onChangeText={onChangeText}
                placeholder="Share your thoughts about this chapter..."
                placeholderTextColor={colors.subtext}
                editable={!submitting && !disabled}
                multiline
                textAlignVertical="top"
                className="min-h-[110px] rounded-2xl px-4 py-4 text-[15px]"
                style={{
                    backgroundColor: colors.inputBackground,
                    color: colors.text,
                    borderWidth: 1,
                    borderColor: colors.border,
                }}
            />

            <View className="mt-4 flex-row justify-end">
                <TouchableOpacity
                    onPress={onSubmit}
                    disabled={submitting || disabled}
                    className="rounded-2xl px-5 py-3 min-w-[132px] items-center"
                    style={{
                        backgroundColor: submitting || disabled ? `${colors.accent}80` : colors.accent,
                    }}
                >
                    {submitting ? (
                        <ActivityIndicator size="small" color="#111111" />
                    ) : (
                        <Text className="text-[15px] font-bold" style={{ color: '#111111' }}>
                            Post Comment
                        </Text>
                    )}
                </TouchableOpacity>
            </View>
        </View>
    );
}

export const CommentInput = memo(CommentInputComponent);
