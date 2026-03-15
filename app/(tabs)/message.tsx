import React, { useState } from "react";
import { View } from "react-native";
import { useAuth } from "@/context/AuthContext";
import SignInPromptScreen from "@/components/SignInPromptScreen";
import { useTheme } from "@/context/ThemeContext";
import AppHeader from "@/components/AppHeader";
import SideMenu from "@/components/SideMenu";
import Message from "@/components/Message";

export default function MessageScreen() {
  const { user } = useAuth();
  const { colors } = useTheme();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  if (!user) {
    return <SignInPromptScreen />;
  }

  return (
    <View className="flex-1" style={{ backgroundColor: colors.background }}>
      <AppHeader onMenuPress={() => setIsMenuOpen(true)} />
      <Message roomId="community" />
      <SideMenu isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />
    </View>
  );
}
