import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
// If expo-linear-gradient is not installed, the app will still work but gradients won't display
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '@/src/contexts/AuthContext';
import { BrandColors, BrandSpacing, BrandBorderRadius, BrandShadows } from '@/constants/brand';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const insets = useSafeAreaInsets();
  const { login } = useAuth();

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter both email and password');
      return;
    }

    setLoading(true);
    const result = await login(email, password);

    if (!result.success) {
      Alert.alert('Login Failed', result.error || 'Invalid credentials');
    }
    setLoading(false);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <LinearGradient
        colors={['#2D5016', '#4A7C2A', '#6B9E3E']}
        style={[styles.gradient, { paddingTop: insets.top }]}
      >
        <View style={styles.content}>
          {/* Logo/Brand Section */}
          <View style={styles.brandSection}>
            <View style={styles.logoContainer}>
              <Ionicons name="leaf" size={64} color="#C9A961" />
            </View>
            <Text style={styles.brandName}>The Roots Digital</Text>
            <Text style={styles.brandTagline}>Attendance Management System</Text>
          </View>

          {/* Login Form */}
          <View style={styles.formContainer}>
            <Text style={styles.formTitle}>Welcome Back</Text>
            <Text style={styles.formSubtitle}>Sign in to continue</Text>

            <View style={styles.inputWrapper}>
              <View style={styles.inputContainer}>
                <Ionicons name="mail-outline" size={20} color={BrandColors.textSecondary} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Email address"
                  placeholderTextColor={BrandColors.textSecondary}
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>
            </View>

            <View style={styles.inputWrapper}>
              <View style={styles.inputContainer}>
                <Ionicons name="lock-closed-outline" size={20} color={BrandColors.textSecondary} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Password"
                  placeholderTextColor={BrandColors.textSecondary}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                  style={styles.eyeIcon}
                >
                  <Ionicons
                    name={showPassword ? 'eye-outline' : 'eye-off-outline'}
                    size={20}
                    color={BrandColors.textSecondary}
                  />
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity
              style={[styles.loginButton, loading && styles.loginButtonDisabled]}
              onPress={handleLogin}
              disabled={loading}
              activeOpacity={0.8}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <Text style={styles.loginButtonText}>Sign In</Text>
                  <Ionicons name="arrow-forward" size={20} color="#fff" />
                </>
              )}
            </TouchableOpacity>
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>
              Need help? Contact your administrator
            </Text>
          </View>
        </View>
      </LinearGradient>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    padding: BrandSpacing.lg,
  },
  brandSection: {
    alignItems: 'center',
    marginBottom: BrandSpacing['2xl'],
  },
  logoContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(201, 169, 97, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: BrandSpacing.md,
    ...BrandShadows.lg,
  },
  brandName: {
    fontSize: 28,
    fontWeight: '700',
    color: '#fff',
    marginBottom: BrandSpacing.xs,
    letterSpacing: 0.5,
  },
  brandTagline: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '500',
  },
  formContainer: {
    backgroundColor: BrandColors.surface,
    borderRadius: BrandBorderRadius.xl,
    padding: BrandSpacing.lg,
    ...BrandShadows.lg,
  },
  formTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: BrandColors.textPrimary,
    marginBottom: BrandSpacing.xs,
  },
  formSubtitle: {
    fontSize: 14,
    color: BrandColors.textSecondary,
    marginBottom: BrandSpacing.lg,
  },
  inputWrapper: {
    marginBottom: BrandSpacing.md,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: BrandColors.background,
    borderRadius: BrandBorderRadius.md,
    borderWidth: 1,
    borderColor: BrandColors.border,
    paddingHorizontal: BrandSpacing.md,
    height: 56,
  },
  inputIcon: {
    marginRight: BrandSpacing.sm,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: BrandColors.textPrimary,
    paddingVertical: 0,
  },
  eyeIcon: {
    padding: BrandSpacing.xs,
  },
  loginButton: {
    backgroundColor: BrandColors.primary,
    borderRadius: BrandBorderRadius.md,
    padding: BrandSpacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: BrandSpacing.sm,
    marginTop: BrandSpacing.md,
    ...BrandShadows.md,
  },
  loginButtonDisabled: {
    opacity: 0.6,
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  footer: {
    marginTop: BrandSpacing.xl,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
  },
});
