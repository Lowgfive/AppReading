import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet, SafeAreaView, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { User, Mail, Lock, Eye, EyeOff } from 'lucide-react-native';
import { AuthService } from '../../services/auth.service';
import AppHeader from '@/components/AppHeader';
import { useToast } from '@/context/ToastContext';

export default function RegisterScreen() {
    const router = useRouter();
    const { showToast } = useToast();
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [formReady, setFormReady] = useState(false);

    const handleRegister = async () => {
        if (!username || !email || !password || !confirmPassword) {
            showToast("Please fill in all fields", "error");
            return;
        }

        if (password !== confirmPassword) {
            showToast("Passwords do not match", "error");
            return;
        }

        setLoading(true);
        try {
            await AuthService.register(username, email, password);
            showToast("Account created successfully", "success");
            router.push('/(auth)/login');
        } catch (error: any) {
            showToast(error.message || "An error occurred", "error");
        } finally {
            setLoading(false);
        }
    };

    React.useEffect(() => {
        const t = setTimeout(() => setFormReady(true), 500);
        return () => clearTimeout(t);
    }, []);

    return (
        <SafeAreaView style={styles.container}>
            <AppHeader />
            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                <View style={styles.content}>
                    {formReady ? (
                        <View style={styles.card}>
                            <View style={styles.inputContainer}>
                                <Text style={styles.label}>Username</Text>
                                <View style={styles.inputWrapper}>
                                    <User size={20} color="#9CA3AF" style={styles.inputIcon} />
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Choose a username"
                                        placeholderTextColor="#6B7280"
                                        autoCapitalize="none"
                                        value={username}
                                        onChangeText={setUsername}
                                    />
                                </View>
                            </View>

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
                                <Text style={styles.label}>Password</Text>
                                <View style={styles.inputWrapper}>
                                    <Lock size={20} color="#9CA3AF" style={styles.inputIcon} />
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Create a password"
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

                            <View style={styles.inputContainer}>
                                <Text style={styles.label}>Confirm Password</Text>
                                <View style={styles.inputWrapper}>
                                    <Lock size={20} color="#9CA3AF" style={styles.inputIcon} />
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Confirm your password"
                                        placeholderTextColor="#6B7280"
                                        secureTextEntry={!showPassword}
                                        value={confirmPassword}
                                        onChangeText={setConfirmPassword}
                                    />
                                </View>
                            </View>

                            <Pressable
                                style={[styles.button, loading && styles.buttonDisabled]}
                                onPress={handleRegister}
                                disabled={loading}
                            >
                                <Text style={styles.buttonText}>{loading ? 'Creating...' : 'Create Account'}</Text>
                            </Pressable>

                            <View style={styles.footer}>
                                <Text style={styles.footerText}>Already have an account? </Text>
                                <Pressable onPress={() => router.push('/(auth)/login')}>
                                    <Text style={styles.footerLink}>Sign in</Text>
                                </Pressable>
                            </View>
                        </View>
                    ) : (
                        <View style={[styles.card, { padding: 24 }]}>                        
                            <View style={{ height: 20, backgroundColor: '#333', borderRadius: 4, marginBottom: 20 }} />
                            <View style={{ height: 20, backgroundColor: '#333', borderRadius: 4, marginBottom: 20 }} />
                            <View style={{ height: 20, backgroundColor: '#333', borderRadius: 4, marginBottom: 20 }} />
                            <View style={{ height: 50, backgroundColor: '#333', borderRadius: 8 }} />
                        </View>
                    )}
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#121212',
    },
    scrollContent: {
        flexGrow: 1,
    },
    content: {
        flex: 1,
        paddingHorizontal: 24,
        justifyContent: 'center',
        paddingVertical: 40,
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
    label: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: '500',
        marginBottom: 8,
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