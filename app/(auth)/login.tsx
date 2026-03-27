import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react-native';
import { AuthService } from '../../services/auth.service';
import { useAuth } from '@/context/AuthContext';
import AppHeader from '@/components/AppHeader';
import { useTheme } from '@/context/ThemeContext';
import { useToast } from '@/context/ToastContext';

export default function LoginScreen() {
    const router = useRouter();
    const { signIn } = useAuth();
    const { colors } = useTheme();
    const { showToast } = useToast();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [formReady, setFormReady] = useState(false);

    const handleLogin = async () => {
        if (!email || !password) {
            showToast("Please fill in all fields", "error");
            return;
        }

        setLoading(true);
        try {
            const data = await AuthService.login(email, password);
            await signIn(data.token);
            showToast("Login successful", "success");
        } catch (error: any) {
            showToast(error.message || "Invalid credentials", "error");
        } finally {
            setLoading(false);
        }
    };

    React.useEffect(() => {
        const t = setTimeout(() => setFormReady(true), 500);
        return () => clearTimeout(t);
    }, []);

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            <AppHeader />
            <View style={styles.content}>
                {formReady ? (
                    <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
                        <View style={styles.inputContainer}>
                            <Text style={[styles.label, { color: colors.text }]}>Email</Text>
                            <View style={[styles.inputWrapper, { backgroundColor: colors.inputBackground, borderColor: colors.border }]}>
                                <Mail size={20} color={colors.iconMuted} style={styles.inputIcon} />
                                <TextInput
                                    style={[styles.input, { color: colors.text }]}
                                    placeholder="Enter your email"
                                    placeholderTextColor={colors.iconMuted}
                                    keyboardType="email-address"
                                    autoCapitalize="none"
                                    value={email}
                                    onChangeText={setEmail}
                                />
                            </View>
                        </View>

                        <View style={styles.inputContainer}>
                            <View style={styles.passwordHeader}>
                                <Text style={[styles.label, { color: colors.text }]}>Password</Text>
                                <Pressable>
                                    <Text style={[styles.forgotText, { color: colors.accent }]}>Forgot password?</Text>
                                </Pressable>
                            </View>
                            <View style={[styles.inputWrapper, { backgroundColor: colors.inputBackground, borderColor: colors.border }]}>
                                <Lock size={20} color={colors.iconMuted} style={styles.inputIcon} />
                                <TextInput
                                    style={[styles.input, { color: colors.text }]}
                                    placeholder="Enter your password"
                                    placeholderTextColor={colors.iconMuted}
                                    secureTextEntry={!showPassword}
                                    value={password}
                                    onChangeText={setPassword}
                                />
                                <Pressable onPress={() => setShowPassword(!showPassword)} style={styles.eyeIcon}>
                                    {showPassword ? (
                                        <Eye size={20} color={colors.iconMuted} />
                                    ) : (
                                        <EyeOff size={20} color={colors.iconMuted} />
                                    )}
                                </Pressable>
                            </View>
                        </View>

                        <Pressable
                            style={[styles.button, { backgroundColor: colors.accent }, loading && styles.buttonDisabled]}
                            onPress={handleLogin}
                            disabled={loading}
                        >
                            <Text style={[styles.buttonText, { color: '#111111' }]}>{loading ? 'Signing in...' : 'Sign In'}</Text>
                        </Pressable>

                        <View style={styles.footer}>
                            <Text style={[styles.footerText, { color: colors.subtext }]}>Dont have an account? </Text>
                            <Pressable onPress={() => router.push('/(auth)/register')}>
                                <Text style={[styles.footerLink, { color: colors.accent }]}>Sign up</Text>
                            </Pressable>
                        </View>
                    </View>
                ) : (
                    <View style={[styles.card, { padding: 24, backgroundColor: colors.card, borderColor: colors.border }]}>
                        <View style={{ height: 20, backgroundColor: colors.border, borderRadius: 4, marginBottom: 20 }} />
                        <View style={{ height: 20, backgroundColor: colors.border, borderRadius: 4, marginBottom: 20 }} />
                        <View style={{ height: 50, backgroundColor: colors.border, borderRadius: 8 }} />
                    </View>
                )}
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    content: {
        flex: 1,
        paddingHorizontal: 24,
        justifyContent: 'center',
        paddingBottom: 40,
    },
    card: {
        borderRadius: 16,
        padding: 24,
        borderWidth: 1,
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
        fontSize: 14,
        fontWeight: '500',
        marginBottom: 8,
    },
    forgotText: {
        fontSize: 14,
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderRadius: 8,
        height: 50,
        paddingHorizontal: 12,
    },
    inputIcon: {
        marginRight: 12,
    },
    input: {
        flex: 1,
        fontSize: 15,
    },
    eyeIcon: {
        padding: 8,
    },
    button: {
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
        fontSize: 16,
        fontWeight: '600',
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 24,
    },
    footerText: {
        fontSize: 14,
    },
    footerLink: {
        fontSize: 14,
        fontWeight: '500',
    }
});
