import React, { useEffect, useRef } from 'react';
import { Animated, Text, View, StyleSheet, Platform } from 'react-native';
import { useTheme } from '@/context/ThemeContext';
import { CheckCircle2, XCircle, Info } from 'lucide-react-native';

export type ToastType = 'success' | 'error' | 'info';

interface ToastProps {
    message: string;
    type?: ToastType;
    visible: boolean;
    onHide: () => void;
}

export const Toast: React.FC<ToastProps> = ({ message, type = 'info', visible, onHide }) => {
    const { colors } = useTheme();
    const opacity = useRef(new Animated.Value(0)).current;
    const translateY = useRef(new Animated.Value(12)).current;
    const useNativeDriver = Platform.OS !== 'web';

    useEffect(() => {
        if (visible) {
            Animated.parallel([
                Animated.timing(opacity, {
                    toValue: 1,
                    duration: 180,
                    useNativeDriver,
                }),
                Animated.spring(translateY, {
                    toValue: 0,
                    speed: 18,
                    bounciness: 0,
                    useNativeDriver,
                }),
            ]).start();

            const timer = setTimeout(() => {
                hideToast();
            }, type === 'error' ? 3000 : type === 'info' ? 2200 : 1600);

            return () => clearTimeout(timer);
        } else {
            hideToast();
        }
    }, [visible, type]);

    const hideToast = () => {
        Animated.parallel([
            Animated.timing(opacity, {
                toValue: 0,
                duration: 160,
                useNativeDriver,
            }),
            Animated.timing(translateY, {
                toValue: 12,
                duration: 160,
                useNativeDriver,
            }),
        ]).start(() => {
            if (visible) onHide();
        });
    };

    if (!visible) return null;

    let icon = <Info color={colors.text} size={20} />;
    let iconBgColor = 'rgba(255, 255, 255, 0.06)';
    let borderAccent = 'rgba(255, 255, 255, 0.08)';

    switch (type) {
        case 'success':
            icon = <CheckCircle2 color="#10B981" size={20} />;
            iconBgColor = 'rgba(16, 185, 129, 0.12)';
            borderAccent = 'rgba(16, 185, 129, 0.18)';
            break;
        case 'error':
            icon = <XCircle color="#EF4444" size={20} />;
            iconBgColor = 'rgba(239, 68, 68, 0.14)';
            borderAccent = 'rgba(239, 68, 68, 0.26)';
            break;
        case 'info':
            iconBgColor = 'rgba(224, 138, 42, 0.12)';
            borderAccent = 'rgba(224, 138, 42, 0.18)';
            break;
    }

    return (
        <Animated.View
            style={[
                styles.container,
                {
                    opacity,
                    transform: [{ translateY }],
                    backgroundColor: colors.overlay,
                    borderColor: type === 'error' ? borderAccent : colors.border,
                },
            ]}
        >
            <View style={[styles.iconContainer, { backgroundColor: iconBgColor }]}>
                {icon}
            </View>
            <Text style={[styles.message, { color: type === 'error' ? '#F5F5F5' : colors.text }]}>{message}</Text>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        bottom: 104,
        left: 20,
        right: 20,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 11,
        borderRadius: 16,
        borderWidth: 1,
        ...(Platform.OS === 'web'
            ? { boxShadow: '0px 4px 12px rgba(0,0,0,0.15)' }
            : {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 6 },
                shadowOpacity: 0.18,
                shadowRadius: 14,
                elevation: 6,
            }),
        zIndex: 9999,
    },
    iconContainer: {
        width: 36,
        height: 36,
        borderRadius: 18,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    message: {
        flex: 1,
        fontSize: 14,
        fontFamily: 'Inter_500Medium',
        lineHeight: 20,
    },
});
