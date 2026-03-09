import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet, SafeAreaView, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Mail, Lock, Eye, EyeOff, BookOpen } from 'lucide-react-native';
import { AuthService } from '../../services/auth.service';

export default function LoginScreen() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleLogin = async () => {
        if (!email || !password) {
            Alert.alert("Error", "Please fill in all fields");
            return;
        }

        setLoading(true);
        try {
            await AuthService.login(email, password);
            router.replace('/(tabs)/home');
        } catch (error: any) {
            Alert.alert("Login Failed", error.message || "Invalid credentials");
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.content}>
                {/* Header Section */}
                <View style={styles.headerContainer}>
                    <View style={styles.logoContainer}>
                        <BookOpen size={32} color="#EFA02A" />
                        <Text style={styles.logoText}>Storytime</Text>
                    </View>
                    <Text style={styles.title}>Welcome Back</Text>
                    <Text style={styles.subtitle}>Sign in to continue your reading journey</Text>
                </View>

                {/* Form Card */}
                <View style={styles.card}>
                    <View style={styles.inputContainer}>
                        <Text style={styles.label}>Email</Text>
                        <View style={styles.inputWrapper}>
                            <Mail size={20} color="#9CA3AF" style={styles.inputIcon} />
                            <TextInput
                                style={styles.input}
                                placeholder="Enter your email"
                                placeholderTextColor="#6B7280"
                                keyboardType="email-address"
                                autoCapitalize="none"
                                value={email}
                                onChangeText={setEmail}
                            />
                        </View>
                    </View>

                    <View style={styles.inputContainer}>
                        <View style={styles.passwordHeader}>
                            <Text style={styles.label}>Password</Text>
                            <Pressable>
                                <Text style={styles.forgotText}>Forgot password?</Text>
                            </Pressable>
                        </View>
                        <View style={styles.inputWrapper}>
                            <Lock size={20} color="#9CA3AF" style={styles.inputIcon} />
                            <TextInput
                                style={styles.input}
                                placeholder="Enter your password"
                                placeholderTextColor="#6B7280"
                                secureTextEntry={!showPassword}
                                value={password}
                                onChangeText={setPassword}
                            />
                            <Pressable onPress={() => setShowPassword(!showPassword)} style={styles.eyeIcon}>
                                {showPassword ? (
                                    <Eye size={20} color="#9CA3AF" />
                                ) : (
                                    <EyeOff size={20} color="#9CA3AF" />
                                )}
                            </Pressable>
                        </View>
                    </View>

                    <Pressable
                        style={[styles.button, loading && styles.buttonDisabled]}
                        onPress={handleLogin}
                        disabled={loading}
                    >
                        <Text style={styles.buttonText}>{loading ? 'Signing in...' : 'Sign In'}</Text>
                    </Pressable>

                    <View style={styles.footer}>
                        <Text style={styles.footerText}>Dont have an account? </Text>
                        <Pressable onPress={() => router.push('/(auth)/register')}>
                            <Text style={styles.footerLink}>Sign up</Text>
                        </Pressable>
                    </View>
                </View>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#121212',
    },
    content: {
        flex: 1,
        paddingHorizontal: 24,
        justifyContent: 'center',
        paddingBottom: 40,
    },
    headerContainer: {
        alignItems: 'center',
        marginBottom: 40,
    },
    logoContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 24,
    },
    logoText: {
        color: '#FFFFFF',
        fontSize: 28,
        fontWeight: '700',
        marginLeft: 8,
        fontFamily: 'serif',
    },
    title: {
        color: '#FFFFFF',
        fontSize: 26,
        fontWeight: '600',
        marginBottom: 8,
        fontFamily: 'serif',
    },
    subtitle: {
        color: '#9CA3AF',
        fontSize: 14,
    },
    card: {
        backgroundColor: '#1A1A1A',
        borderRadius: 16,
        padding: 24,
        borderWidth: 1,
        borderColor: '#333333',
    },
    inputContainer: {
        marginBottom: 20,
    },
    passwordHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    label: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: '500',
        marginBottom: 8,
    },
    forgotText: {
        color: '#EFA02A',
        fontSize: 14,
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#121212',
        borderWidth: 1,
        borderColor: '#333333',
        borderRadius: 8,
        height: 50,
        paddingHorizontal: 12,
    },
    inputIcon: {
        marginRight: 12,
    },
    input: {
        flex: 1,
        color: '#FFFFFF',
        fontSize: 15,
    },
    eyeIcon: {
        padding: 8,
    },
    button: {
        backgroundColor: '#EFA02A',
        borderRadius: 8,
        height: 50,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 10,
    },
    buttonDisabled: {
        opacity: 0.7,
    },
    buttonText: {
        color: '#121212',
        fontSize: 16,
        fontWeight: '600',
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 24,
    },
    footerText: {
        color: '#9CA3AF',
        fontSize: 14,
    },
    footerLink: {
        color: '#EFA02A',
        fontSize: 14,
        fontWeight: '500',
    }
});