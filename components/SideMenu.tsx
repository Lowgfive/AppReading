import React, { useEffect, useState, useRef } from 'react';
import { View, Text, TouchableOpacity, Modal, Animated, Dimensions, TouchableWithoutFeedback, StyleSheet, Platform } from 'react-native';
import { BookOpen, Sun, Moon, X, Home, Search as SearchIcon, Library, User } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { AuthService } from '@/services/auth.service';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';

const { height } = Dimensions.get('window');
const MENU_HEIGHT = height * 0.5; // Chiếm 50% chiều dài màn hình

interface SideMenuProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function SideMenu({ isOpen, onClose }: SideMenuProps) {
    const slideAnim = useRef(new Animated.Value(-MENU_HEIGHT)).current;
    const router = useRouter();
    const { signOut } = useAuth();
    const { colors, toggleTheme, isDarkMode } = useTheme();
    const [token, setToken] = useState<string | null>(null);
    const [isVisible, setIsVisible] = useState(isOpen);
    const useNativeDriver = Platform.OS !== 'web';

    useEffect(() => {
        const checkToken = async () => {
            const storedToken = await AuthService.getToken();
            setToken(storedToken);
        };

        if (isOpen) {
            setIsVisible(true);
            checkToken();
            Animated.timing(slideAnim, {
                toValue: 0,
                duration: 250,
                useNativeDriver,
            }).start();
        } else {
            Animated.timing(slideAnim, {
                toValue: -MENU_HEIGHT,
                duration: 250,
                useNativeDriver,
            }).start(() => {
                setIsVisible(false);
            });
        }
    }, [isOpen]);

    const handleAuthAction = async () => {
        if (token) {
            await AuthService.logout();
            setToken(null);
            if (signOut) signOut();
            onClose();
        } else {
            onClose();
            router.push('/(auth)/register');
        }
    };

    const handleNavigation = (route: string) => {
        onClose();
        router.push(route as any);
    };

    const fadeAnim = slideAnim.interpolate({
        inputRange: [-MENU_HEIGHT, 0],
        outputRange: [0, 1]
    });

    if (!isVisible) return null;

    return (
        <Modal transparent visible={isVisible} animationType="none" onRequestClose={onClose}>
            {/* Backdrop overlay */}
            <Animated.View style={[{ opacity: fadeAnim }, styles.overlay]}>
                <TouchableWithoutFeedback onPress={onClose}>
                    <View style={styles.overlayClickArea} />
                </TouchableWithoutFeedback>
            </Animated.View>

            {/* Slide-out panel */}
            <Animated.View
                style={[{ transform: [{ translateY: slideAnim }], width: '100%' }, styles.panel, { backgroundColor: colors.card }]}
            >
                {/* Header Section */}
                <View className="flex-row justify-between items-center mb-8">
                    <View className="flex-row items-center gap-2">
                        <BookOpen color={colors.accent} size={24} />
                        <Text className="font-serifClassic text-lg font-bold pt-1" style={{ color: colors.text }}>Storytime</Text>
                    </View>
                    <View className="flex-row items-center gap-3">
                        <TouchableOpacity onPress={toggleTheme}>
                            {isDarkMode ? (
                                <Sun color={colors.icon} size={20} />
                            ) : (
                                <Moon color={colors.icon} size={20} />
                            )}
                        </TouchableOpacity>
                        <TouchableOpacity onPress={onClose} className="p-1 rounded-lg" style={{ borderColor: colors.accent, borderWidth: 1 }}>
                            <X color={colors.icon} size={20} />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Menu Items */}
                <View className="gap-2 mb-8">
                    <TouchableOpacity onPress={() => handleNavigation('/(tabs)/home')} className="flex-row items-center gap-4 p-3 rounded-xl" style={{ backgroundColor: colors.card }}>
                        <Home color={colors.icon} size={20} />
                        <Text className="text-base font-serifClassic font-medium pt-1" style={{ color: colors.text }}>Home</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => handleNavigation('/(tabs)/search')} className="flex-row items-center gap-4 p-3 rounded-xl" style={{ backgroundColor: colors.card }}>
                        <SearchIcon color={colors.iconMuted} size={20} />
                        <Text className="text-base font-serifClassic font-medium pt-1" style={{ color: colors.text }}>Search</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => handleNavigation('/(tabs)/library')} className="flex-row items-center gap-4 p-3 rounded-xl" style={{ backgroundColor: colors.card }}>
                        <Library color={colors.iconMuted} size={20} />
                        <Text className="text-base font-serifClassic font-medium pt-1" style={{ color: colors.text }}>Library</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => handleNavigation('/(tabs)/profile')} className="flex-row items-center gap-4 p-3 rounded-xl" style={{ backgroundColor: colors.card }}>
                        <User color={colors.iconMuted} size={20} />
                        <Text className="text-base font-serifClassic font-medium pt-1" style={{ color: colors.text }}>Profile</Text>
                    </TouchableOpacity>
                </View>

                {/* Sign In / Sign Out Button */}
                <TouchableOpacity
                    onPress={handleAuthAction}
                    className="py-3.5 rounded-xl items-center shadow-md"
                    style={{ backgroundColor: colors.accent }}
                >
                    <Text className="font-bold font-serifClassic text-base" style={{ color: colors.background }}>{token ? 'Sign Out' : 'Sign In'}</Text>
                </TouchableOpacity>

            </Animated.View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.6)',
        zIndex: 0,
    },
    overlayClickArea: {
        flex: 1,
    },
    panel: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        borderBottomLeftRadius: 24,
        borderBottomRightRadius: 24,
        paddingTop: 56, // Padding cho tai thỏ/status bar
        paddingHorizontal: 16,
        paddingBottom: 24,
        ...(Platform.OS === 'web'
            ? { boxShadow: '0px 6px 18px rgba(0,0,0,0.30)' }
            : {
                shadowColor: '#000',
                shadowOffset: { width: 4, height: 0 },
                shadowOpacity: 0.3,
                shadowRadius: 10,
                elevation: 10,
            }),
        zIndex: 10,
    }
});
