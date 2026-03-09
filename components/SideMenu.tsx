import React, { useEffect, useState, useRef } from 'react';
import { View, Text, TouchableOpacity, Modal, Animated, Dimensions, TouchableWithoutFeedback, StyleSheet } from 'react-native';
import { BookOpen, Sun, X, Home, Search as SearchIcon, Library, User } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { AuthService } from '@/services/auth.service';
import { useAuth } from '@/context/AuthContext';

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
    const [token, setToken] = useState<string | null>(null);
    const [isVisible, setIsVisible] = useState(isOpen);

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
                useNativeDriver: true,
            }).start();
        } else {
            Animated.timing(slideAnim, {
                toValue: -MENU_HEIGHT,
                duration: 250,
                useNativeDriver: true,
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
                style={[{ transform: [{ translateY: slideAnim }], width: '100%' }, styles.panel]}
            >
                {/* Header Section */}
                <View className="flex-row justify-between items-center mb-8">
                    <View className="flex-row items-center gap-2">
                        <BookOpen color="#E08A2A" size={24} />
                        <Text className="text-white font-serifClassic text-lg font-bold pt-1">Storytime</Text>
                    </View>
                    <View className="flex-row items-center gap-3">
                        <TouchableOpacity>
                            <Sun color="#A0A0A0" size={20} />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={onClose} className="p-1 rounded-lg border border-[#E08A2A]">
                            <X color="#A0A0A0" size={20} />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Menu Items */}
                <View className="gap-2 mb-8">
                    <TouchableOpacity onPress={() => handleNavigation('/(tabs)/home')} className="flex-row items-center gap-4 bg-[#2A2A2A] p-3 rounded-xl">
                        <Home color="#FFFFFF" size={20} />
                        <Text className="text-white text-base font-serifClassic font-medium pt-1">Home</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => handleNavigation('/(tabs)/search')} className="flex-row items-center gap-4 p-3 rounded-xl">
                        <SearchIcon color="#A0A0A0" size={20} />
                        <Text className="text-white text-base font-serifClassic font-medium pt-1">Search</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => handleNavigation('/(tabs)/library')} className="flex-row items-center gap-4 p-3 rounded-xl">
                        <Library color="#A0A0A0" size={20} />
                        <Text className="text-white text-base font-serifClassic font-medium pt-1">Library</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => handleNavigation('/(tabs)/profile')} className="flex-row items-center gap-4 p-3 rounded-xl">
                        <User color="#A0A0A0" size={20} />
                        <Text className="text-white text-base font-serifClassic font-medium pt-1">Profile</Text>
                    </TouchableOpacity>
                </View>

                {/* Sign In / Sign Out Button */}
                <TouchableOpacity
                    onPress={handleAuthAction}
                    className="bg-[#E08A2A] py-3.5 rounded-xl items-center shadow-md"
                >
                    <Text className="text-[#121212] font-bold font-serifClassic text-base">{token ? 'Sign Out' : 'Sign In'}</Text>
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
        backgroundColor: '#1E1E1E',
        borderBottomLeftRadius: 24,
        borderBottomRightRadius: 24,
        paddingTop: 56, // Padding cho tai thỏ/status bar
        paddingHorizontal: 16,
        paddingBottom: 24,
        shadowColor: '#000',
        shadowOffset: { width: 4, height: 0 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
        elevation: 10,
        zIndex: 10,
    }
});
