import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet, SafeAreaView, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { User, Mail, Lock, Eye, EyeOff } from 'lucide-react-native';
import { AuthService } from '../../services/auth.service';
import AppHeader from '@/components/AppHeader';
import { useTheme } from '@/context/ThemeContext';
import { useToast } from '@/context/ToastContext';

export default function RegisterScreen() {
    const router = useRouter();
    const { colors } = useTheme();
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
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            <AppHeader />
            <KeyboardAvoidingView
                style={styles.container}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 12 : 0}
            >
                <ScrollView
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                >
                    <View style={styles.content}>
                        {formReady ? (
                            <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
                            <View style={styles.inputContainer}>
                                <Text style={[styles.label, { color: colors.text }]}>Username</Text>
                                <View style={[styles.inputWrapper, { backgroundColor: colors.inputBackground, borderColor: colors.border }]}>
                                    <User size={20} color={colors.iconMuted} style={styles.inputIcon} />
                                    <TextInput
                                        style={[styles.input, { color: colors.text }]}
                                        placeholder="Choose a username"
                                        placeholderTextColor={colors.iconMuted}
                                        autoCapitalize="none"
                                        autoCorrect={false}
                                        autoComplete="username"
                                        textContentType="username"
                                        returnKeyType="next"
                                        value={username}
                                        onChangeText={setUsername}
                                    />
                                </View>
                            </View>

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
                                        autoCorrect={false}
                                        autoComplete="email"
                                        textContentType="emailAddress"
                                        returnKeyType="next"
                                        value={email}
                                        onChangeText={setEmail}
                                    />
                                </View>
                            </View>

                            <View style={styles.inputContainer}>
                                <Text style={[styles.label, { color: colors.text }]}>Password</Text>
                                <View style={[styles.inputWrapper, { backgroundColor: colors.inputBackground, borderColor: colors.border }]}>
                                    <Lock size={20} color={colors.iconMuted} style={styles.inputIcon} />
                                    <TextInput
                                        style={[styles.input, { color: colors.text }]}
                                        placeholder="Create a password"
                                        placeholderTextColor={colors.iconMuted}
                                        secureTextEntry={!showPassword}
                                        autoCapitalize="none"
                                        autoCorrect={false}
                                        autoComplete="new-password"
                                        textContentType="newPassword"
                                        returnKeyType="next"
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

                            <View style={styles.inputContainer}>
                                <Text style={[styles.label, { color: colors.text }]}>Confirm Password</Text>
                                <View style={[styles.inputWrapper, { backgroundColor: colors.inputBackground, borderColor: colors.border }]}>
                                    <Lock size={20} color={colors.iconMuted} style={styles.inputIcon} />
                                    <TextInput
                                        style={[styles.input, { color: colors.text }]}
                                        placeholder="Confirm your password"
                                        placeholderTextColor={colors.iconMuted}
                                        secureTextEntry={!showPassword}
                                        autoCapitalize="none"
                                        autoCorrect={false}
                                        autoComplete="new-password"
                                        textContentType="newPassword"
                                        returnKeyType="done"
                                        value={confirmPassword}
                                        onChangeText={setConfirmPassword}
                                        onSubmitEditing={handleRegister}
                                    />
                                </View>
                            </View>

                            <Pressable
                                style={[styles.button, { backgroundColor: colors.accent }, loading && styles.buttonDisabled]}
                                onPress={handleRegister}
                                disabled={loading}
                            >
                                <Text style={[styles.buttonText, { color: '#111111' }]}>{loading ? 'Creating...' : 'Create Account'}</Text>
                            </Pressable>

                            <View style={styles.footer}>
                                <Text style={[styles.footerText, { color: colors.subtext }]}>Already have an account? </Text>
                                <Pressable onPress={() => router.push('/(auth)/login')}>
                                    <Text style={[styles.footerLink, { color: colors.accent }]}>Sign in</Text>
                                </Pressable>
                            </View>
                        </View>
                    ) : (
                        <View style={[styles.card, { padding: 24, backgroundColor: colors.card, borderColor: colors.border }]}>
                            <View style={{ height: 20, backgroundColor: colors.border, borderRadius: 4, marginBottom: 20 }} />
                            <View style={{ height: 20, backgroundColor: colors.border, borderRadius: 4, marginBottom: 20 }} />
                            <View style={{ height: 20, backgroundColor: colors.border, borderRadius: 4, marginBottom: 20 }} />
                                <View style={{ height: 50, backgroundColor: colors.border, borderRadius: 8 }} />
                            </View>
                        )}
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
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
    card: {
        borderRadius: 16,
        padding: 24,
        borderWidth: 1,
    },
    inputContainer: {
        marginBottom: 20,
    },
    label: {
        fontSize: 14,
        fontWeight: '500',
        marginBottom: 8,
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
