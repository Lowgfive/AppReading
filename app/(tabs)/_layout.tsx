import { Redirect, Tabs } from "expo-router";
import { Home, Search, BookOpen, User } from "lucide-react-native";
import { Ionicons } from "@expo/vector-icons";
import { useLanguage } from "@/context/LanguageContext";
import { useTheme } from "@/context/ThemeContext";
import { useAuth } from "@/context/AuthContext";

export default function TabsLayout() {
    const { colors } = useTheme();
    const { t } = useLanguage();
    const { user, isLoading } = useAuth();

    if (!isLoading && user?.role === "admin") {
        return <Redirect href="/admin" />;
    }

    return (
        <Tabs
            screenOptions={{
                headerShown: false,
                tabBarStyle: {
                    backgroundColor: colors.background,
                    borderTopColor: colors.border,
                    height: 60,
                    paddingBottom: 8,
                    paddingTop: 8,
                },
                tabBarActiveTintColor: colors.accent,
                tabBarInactiveTintColor: colors.iconMuted,
                tabBarLabelStyle: {
                    fontFamily: 'serif',
                    fontSize: 10,
                    marginTop: 4,
                }
            }}
        >
            <Tabs.Screen
                name="home"
                options={{
                    title: t("tabs.home"),
                    tabBarIcon: ({ color, size }) => (
                        <Home color={color} size={24} />
                    )
                }}
            />
            <Tabs.Screen
                name="search"
                options={{
                    title: t("tabs.search"),
                    tabBarIcon: ({ color, size }) => (
                        <Search color={color} size={24} />
                    )
                }}
            />
            <Tabs.Screen
                name="library"
                options={{
                    title: t("tabs.library"),
                    tabBarIcon: ({ color, size }) => (
                        <BookOpen color={color} size={24} />
                    )
                }}
            />
            <Tabs.Screen
                name="message"
                options={{
                    title: t("tabs.chat"),
                    tabBarIcon: ({ color }) => (
                        <Ionicons name="chatbubble-outline" color={color} size={24} />
                    )
                }}
            />
            <Tabs.Screen
                name="profile"
                options={{
                    title: t("tabs.profile"),
                    tabBarIcon: ({ color, size }) => (
                        <User color={color} size={24} />
                    )
                }}
            />
        </Tabs>
    )
}
