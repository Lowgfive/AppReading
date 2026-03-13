import { Tabs } from "expo-router";
import { Home, Search, BookOpen, User } from "lucide-react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/context/ThemeContext";

export default function TabsLayout() {
    const { colors } = useTheme();

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
                    title: "Home",
                    tabBarIcon: ({ color, size }) => (
                        <Home color={color} size={24} />
                    )
                }}
            />
            <Tabs.Screen
                name="search"
                options={{
                    title: "Search",
                    tabBarIcon: ({ color, size }) => (
                        <Search color={color} size={24} />
                    )
                }}
            />
            <Tabs.Screen
                name="library"
                options={{
                    title: "Library",
                    tabBarIcon: ({ color, size }) => (
                        <BookOpen color={color} size={24} />
                    )
                }}
            />
            <Tabs.Screen
                name="message"
                options={{
                    title: "Chat",
                    tabBarIcon: ({ color }) => (
                        <Ionicons name="chatbubble-outline" color={color} size={24} />
                    )
                }}
            />
            <Tabs.Screen
                name="profile"
                options={{
                    title: "Profile",
                    tabBarIcon: ({ color, size }) => (
                        <User color={color} size={24} />
                    )
                }}
            />
            
        </Tabs>
    )
}