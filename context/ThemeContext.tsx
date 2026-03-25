import React, { createContext, useContext, useState, PropsWithChildren } from "react";

type ThemeType = "light" | "dark";

export const themeColors = {
    light: {
        background: "#FFFFFF",
        text: "#111111",
        subtext: "#666666",
        card: "#F5F5F5",
        cardImage: "#E5E5E5",
        border: "#E0E0E0",
        accent: "#E08A2A",
        accentLight: "#F19C38",
        icon: "#555555",
        iconMuted: "#A0A0A0",
        inputBackground: "#F0F0F0",
        overlay: "rgba(255,255,255,0.9)"
    },
    dark: {
        background: "#121212",
        text: "#FFFFFF",
        subtext: "#A0A0A0",
        card: "#202020",
        cardImage: "#2A2A2A",
        border: "#333333",
        accent: "#E08A2A",
        accentLight: "#F19C38",
        icon: "#A0A0A0",
        iconMuted: "#808080",
        inputBackground: "#202020",
        overlay: "rgba(18,18,18,0.9)"
    }
};

type ThemeContextType = {
    theme: ThemeType;
    toggleTheme: () => void;
    setTheme: (theme: ThemeType) => void;
    isDarkMode: boolean;
    colors: typeof themeColors.light;
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: PropsWithChildren) {
    const [theme, setTheme] = useState<ThemeType>("dark");

    const toggleTheme = () => {
        setTheme((prevTheme) => (prevTheme === "light" ? "dark" : "light"));
    };

    const isDarkMode = theme === "dark";
    const colors = isDarkMode ? themeColors.dark : themeColors.light;

    return (
        <ThemeContext.Provider value={{ theme, toggleTheme, setTheme, isDarkMode, colors }}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    const context = useContext(ThemeContext);
    if (context === undefined) {
        throw new Error("useTheme must be used within a ThemeProvider");
    }
    return context;
}
