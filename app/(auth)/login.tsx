import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react-native';
import { AuthService } from '../../services/auth.service';
import { useAuth } from '@/context/AuthContext';
import AppHeader from '@/components/AppHeader';
import { useToast } from '@/context/ToastContext';

export default function LoginScreen() {
    const router = useRouter();
    const { signIn } = useAuth();
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
            // success animation could be here
        } catch (error: any) {
            showToast(error.message || "Invalid credentials", "error");
        } finally {
            setLoading(false);
        }
    };

    // simulate form load
    React.useEffect(() => {
        const t = setTimeout(() => setFormReady(true), 500);
        return () => clearTimeout(t);
    }, []);

    return (
        <SafeAreaView style={styles.container}>
            <AppHeader />
            <View style={styles.content}>
                {formReady ? (
                    // Form Card
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
                ) : (
                    // skeleton
                    <View style={[styles.card, { padding: 24 }]}>                        
                        <View style={{ height: 20, backgroundColor: '#333', borderRadius: 4, marginBottom: 20 }} />
                        <View style={{ height: 20, backgroundColor: '#333', borderRadius: 4, marginBottom: 20 }} />
                        <View style={{ height: 50, backgroundColor: '#333', borderRadius: 8 }} />
                    </View>
                )}
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