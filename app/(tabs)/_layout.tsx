import { Tabs } from "expo-router";
import { Home, Search, BookOpen, User } from "lucide-react-native";

export default function TabsLayout() {
    return (
        <Tabs
            screenOptions={{
                headerShown: false,
                tabBarStyle: {
                    backgroundColor: '#121212',
                    borderTopColor: '#2A2A2A',
                    height: 60,
                    paddingBottom: 8,
                    paddingTop: 8,
                },
                tabBarActiveTintColor: '#E08A2A',
                tabBarInactiveTintColor: '#A0A0A0',
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