import { View, Text } from "react-native";
import { useTheme } from "@/context/ThemeContext";
import AppHeader from "@/components/AppHeader";

export default function SearchScreen() {
    const { colors } = useTheme();
    return (
        <View className="flex-1" style={{ backgroundColor: colors.background }}>
            <AppHeader />
            <View className="flex-1 justify-center items-center">
                <Text className="font-inter text-xl" style={{ color: colors.text }}>Search Screen</Text>
            </View>
        </View>
    );
}
