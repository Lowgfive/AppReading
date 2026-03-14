import React, { useEffect, useRef } from 'react';
import { Animated, Text, View, StyleSheet } from 'react-native';
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
    const translateY = useRef(new Animated.Value(-20)).current;

    useEffect(() => {
        if (visible) {
            Animated.parallel([
                Animated.timing(opacity, {
                    toValue: 1,
                    duration: 300,
                    useNativeDriver: true,
                }),
                Animated.spring(translateY, {
                    toValue: 0,
                    useNativeDriver: true,
                }),
            ]).start();

            const timer = setTimeout(() => {
                hideToast();
            }, 3000);

            return () => clearTimeout(timer);
        } else {
            hideToast();
        }
    }, [visible]);

    const hideToast = () => {
        Animated.parallel([
            Animated.timing(opacity, {
                toValue: 0,
                duration: 300,
                useNativeDriver: true,
            }),
            Animated.timing(translateY, {
                toValue: -20,
                duration: 300,
                useNativeDriver: true,
            }),
        ]).start(() => {
            if (visible) onHide();
        });
    };

    if (!visible) return null;

    let icon = <Info color={colors.text} size={20} />;
    let bgColor = colors.card;

    switch (type) {
        case 'success':
            icon = <CheckCircle2 color="#10B981" size={20} />;
            bgColor = 'rgba(16, 185, 129, 0.1)';
            break;
        case 'error':
            icon = <XCircle color="#EF4444" size={20} />;
            bgColor = 'rgba(239, 68, 68, 0.1)';
            break;
    }

    return (
        <Animated.View
            style={[
                styles.container,
                {
                    opacity,
                    transform: [{ translateY }],
                    backgroundColor: colors.card,
                    borderColor: colors.border,
                },
            ]}
        >
            <View style={[styles.iconContainer, { backgroundColor: bgColor }]}>
                {icon}
            </View>
            <Text style={[styles.message, { color: colors.text }]}>{message}</Text>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        top: 50,
        left: 20,
        right: 20,
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        borderRadius: 12,
        borderWidth: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
        elevation: 5,
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
    },
});
