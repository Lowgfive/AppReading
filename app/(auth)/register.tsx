import { Button, StyleSheet, Text, TextInput, View } from "react-native";
import { router } from 'expo-router'
import { BookOpen } from "lucide-react-native";
import { useState } from "react";

import  {AuthService}  from "@/services/auth.service";

export const API_URL = process.env.EXPO_PUBLIC_API_URL;
export default function LoginScreen() {
    const [email, setEmail] = useState<string>("")
    const [password, setPassword] = useState<string>("")
    const [username, setUsername] = useState<string>("")

    const [loading, setLoading] = useState(false);

    const registerUser = async () => {
        if (!username || !email || !password) {
            alert("Please fill in all fields");
            return;
        }

        setLoading(true);
        try {
            await AuthService.register(username, email, password);
            alert("Registration successful! Please login.")
            router.push('/(auth)/login');
        } catch (error: any) {
            console.log(error)
            alert(error.response?.data?.message || "Registration failed");
        } finally {
            setLoading(false);
        }
    }

    return (
        <View style={styles.container}>
            <View style={styles.logoWrap}>
                <BookOpen size={40} />
                <Text style={styles.logoText}>Storytime</Text>
            </View>

            <View style={styles.header}>
                <Text style={styles.title}>Welcome</Text>
                <Text style={styles.subtitle}>
                    Sign up to continue your reading journey
                </Text>
            </View>

            <View style={styles.form}>
                <View style={styles.field}>
                    <Text style={styles.label}>Username</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Enter your name"
                        onChangeText={(text) => setUsername(text)}
                    />
                </View>
                <View style={styles.field}>
                    <Text style={styles.label}>Email</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Enter your email"
                        onChangeText={(text) => setEmail(text)}
                    />
                </View>

                <View style={styles.field}>
                    <View style={styles.rowBetween}>
                        <Text style={styles.label}>Password</Text>
                    </View>
                    <TextInput
                        style={styles.input}
                        secureTextEntry
                        placeholder="Enter your password"
                        onChangeText={(text) => setPassword(text)}
                    />
                </View>
                <View>
                    <Text onPress={() => { router.push('/(auth)/login') }}>Have a account!</Text>
                </View>
                <Button title={loading ? "Registering..." : "Register"} onPress={registerUser} disabled={loading} />
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#fff",
        padding: 24,
        justifyContent: "center",
    },
    logoWrap: {
        alignItems: "center",
        marginBottom: 32,
    },
    logoText: {
        fontSize: 22,
        fontWeight: "700",
        marginTop: 8,
    },
    header: {
        marginBottom: 24,
    },
    title: {
        fontSize: 26,
        fontWeight: "700",
        marginBottom: 4,
    },
    subtitle: {
        fontSize: 14,
        color: "#666",
    },
    form: {
        gap: 20,
    },
    field: {
        gap: 6,
    },
    label: {
        fontSize: 14,
        fontWeight: "600",
    },
    input: {
        borderWidth: 1,
        borderColor: "#ddd",
        borderRadius: 10,
        paddingHorizontal: 14,
        paddingVertical: 12,
        fontSize: 16,
    },
    rowBetween: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    forgot: {
        fontSize: 13,
        color: "#4F46E5",
    },
});