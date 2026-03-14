import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, Image, FlatList, ActivityIndicator, Dimensions } from "react-native";
import { useAuth } from "@/context/AuthContext";
import { AuthService } from "@/services/auth.service";
import { AppService } from "@/services/app.service";
import { router } from "expo-router";
import { Sun, Moon, Menu, LogOut, Edit2 } from "lucide-react-native";
import { useTheme } from "@/context/ThemeContext";
import StoryCard from "@/components/StoryCard";
import SideMenu from "@/components/SideMenu";
import AppHeader from "@/components/AppHeader";
import SignInPromptScreen from "@/components/SignInPromptScreen";
import Settings from "@/components/Settings";

const { width } = Dimensions.get('window');
const cardWidth = (width - 48 - 16) / 2; // (Screen width - horizontal padding - gap) / 2

export default function ProfileScreen() {
    const { signOut, user, isLoading: authLoading } = useAuth();
    const { toggleTheme, isDarkMode, colors } = useTheme();
    const [profileData, setProfileData] = useState<any>(null);
    const [likedStories, setLikedStories] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('favorites');
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    useEffect(() => {
        if (user && !authLoading) {
            fetchProfileAndStories();
        }
    }, [user, authLoading]);

    const fetchProfileAndStories = async () => {
        try {
            setLoading(true);
            const [profileRes, likedRes] = await Promise.all([
                AuthService.getProfile(),
                AppService.getLikedStories()
            ]);

            if (profileRes && profileRes.user) {
                setProfileData(profileRes.user);
            }

            if (likedRes && likedRes.result && likedRes.result.length > 0) {
                setLikedStories(likedRes.result[0].stories || []);
            }
        } catch (error) {
            console.error("Error fetching profile data:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSignOut = async () => {
        await signOut();
    };

    const renderHeader = () => {
        if (loading || !profileData) return (
            <View className="py-10">
                <ActivityIndicator size="large" color={colors.accent} />
            </View>
        );

        return (
            <View>
                {/* User Info Section */}
                <View className="px-6 py-6 items-center">
                    <View className="relative mb-4">
                        <View className="w-24 h-24 rounded-full overflow-hidden border-2" style={{ borderColor: colors.accent }}>
                            <Image
                                className="w-full h-full"
                            />
                        </View>
                    </View>

                    <View className="flex-row items-center justify-center gap-2 mb-2">
                        <Text className="text-2xl font-inter font-bold" style={{ color: colors.text }}>
                            {profileData.username || 'Người dùng'}
                        </Text>
                        <TouchableOpacity>
                            <Edit2 color={colors.iconMuted} size={16} />
                        </TouchableOpacity>
                    </View>

                    <Text className="text-sm font-inter text-center px-4 mb-6" style={{ color: colors.subtext }}>
                        {profileData.description || "Hãy viết gì đó về bản thân bạn..."}
                    </Text>

                    {/* Stats Row */}
                    <View className="flex-row justify-center items-center w-full max-w-[250px] mb-8">
                        <View className="items-center flex-1">
                            <Text className="text-xl font-inter font-bold" style={{ color: colors.accent }}>{likedStories.length}</Text>
                            <Text className="text-xs font-inter mt-1" style={{ color: colors.subtext }}>Favorites</Text>
                        </View>
                        <View className="w-px h-8" style={{ backgroundColor: colors.border }} />
                        <View className="items-center flex-1">
                            <Text className="text-xl font-inter font-bold" style={{ color: colors.text }}>
                                {profileData.reading_history?.length || 0}
                            </Text>
                            <Text className="text-xs font-inter mt-1" style={{ color: colors.subtext }}>Stories Read</Text>
                        </View>
                    </View>

                    {/* Sign Out Button */}
                    <TouchableOpacity
                        onPress={handleSignOut}
                        className="flex-row items-center justify-center px-6 py-3 rounded-full border mb-8"
                        style={{ borderColor: colors.border, backgroundColor: 'transparent' }}
                    >
                        <LogOut color={colors.icon} size={18} className="mr-2" />
                        <Text className="font-inter font-bold" style={{ color: colors.text }}>Sign Out</Text>
                    </TouchableOpacity>
                </View>

                {/* Tabs */}
                <View className="flex-row border-b px-6 pt-2" style={{ borderBottomColor: colors.border }}>
                    {['Favorites', 'Settings'].map((tab) => {
                        const tabKey = tab.toLowerCase();
                        const isActive = activeTab === tabKey;
                        return (
                            <TouchableOpacity
                                key={tabKey}
                                onPress={() => setActiveTab(tabKey)}
                                className={`mr-6 pb-4 ${isActive ? 'border-b-2' : ''}`}
                                style={{ borderBottomColor: isActive ? colors.accent : 'transparent' }}
                            >
                                <Text
                                    className={`font-inter font-bold ${isActive ? '' : 'opacity-60'}`}
                                    style={{ color: isActive ? colors.accent : colors.text }}
                                >
                                    {tab}
                                </Text>
                            </TouchableOpacity>
                        );
                    })}
                </View>
            </View>
        );
    };

    const renderFlatListContent = () => {
        if (loading && !profileData) {
            return null; // Handled in header
        }

        if (activeTab === 'favorites') {
            if (likedStories.length === 0) {
                return (
                    <View className="py-16 items-center flex-1">
                        <Text className="font-inter text-center mb-4" style={{ color: colors.subtext }}>
                            Bạn chưa yêu thích truyện nào
                        </Text>
                        <TouchableOpacity
                            className="px-6 py-2 rounded-full"
                            style={{ backgroundColor: colors.accent }}
                            onPress={() => router.push('/(tabs)/home' as any)}
                        >
                            <Text className="text-white font-inter font-bold">Khám Phá Ngay</Text>
                        </TouchableOpacity>
                    </View>
                );
            }

            // Adjust card wrapper for 2-column layout (FlatList handles spacing automatically if columnWrapperStyle is provided)
            return null;
        }

        if (activeTab === 'settings') {
            return (
                <Settings 
                    profileData={profileData} 
                    setProfileData={setProfileData} 
                    handleSignOut={handleSignOut} 
                />
            );
        }

        return (
            <View className="py-16 items-center flex-1">
                <Text className="font-inter text-center" style={{ color: colors.subtext }}>
                    Tính năng đang được phát triển
                </Text>
            </View>
        );
    };

    if (authLoading) {
        return (
            <View className="flex-1 justify-center items-center" style={{ backgroundColor: colors.background }}>
                <ActivityIndicator size="large" color={colors.accent} />
            </View>
        );
    }

    if (!user) {
        return <SignInPromptScreen />;
    }

    return (
        <View className="flex-1" style={{ backgroundColor: colors.background }}>
            <AppHeader onMenuPress={() => setIsMenuOpen(true)} />

            <FlatList
                data={activeTab === 'favorites' ? likedStories : []}
                keyExtractor={(item, index) => item._id || index.toString()}
                numColumns={2}
                showsVerticalScrollIndicator={false}
                ListHeaderComponent={renderHeader()}
                ListEmptyComponent={renderFlatListContent()} // Content when list is empty OR non-favorites tab is active
                columnWrapperStyle={activeTab === 'favorites' && likedStories.length > 0 ? { justifyContent: 'space-between', paddingHorizontal: 24, paddingTop: 20 } : undefined}
                contentContainerStyle={{ paddingBottom: 40 }}
                renderItem={({ item }) => {
                    if (activeTab !== 'favorites') return null;
                    return (
                        <View style={{ width: cardWidth, marginBottom: 16 }}>
                            <StoryCard
                                story={item}
                                onPress={() => router.push({
                                    pathname: `/story/${item._id}` as any,
                                    params: { storyData: JSON.stringify(item) }
                                })}
                            />
                        </View>
                    );
                }}
            />

            <SideMenu isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />
        </View>
    );
}
