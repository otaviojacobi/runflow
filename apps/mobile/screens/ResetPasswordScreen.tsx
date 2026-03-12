import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../contexts/ThemeContext';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { PasswordInput } from '../components/PasswordInput';
import { supabase } from '../lib/supabase';
import { Ionicons } from '@expo/vector-icons';

export function ResetPasswordScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const { theme } = useTheme();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async () => {
    if (password !== confirmPassword) {
      Alert.alert(
        t('Auth.resetPassword.error', 'Error'),
        t('Auth.resetPassword.errorPasswordMismatch', 'Passwords do not match')
      );
      return;
    }

    if (password.length < 8) {
      Alert.alert(
        t('Auth.resetPassword.error', 'Error'),
        t('Auth.resetPassword.errorPasswordLength', 'Password must be at least 8 characters')
      );
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({
        password: password,
      });

      if (error) {
        Alert.alert(
          t('Auth.resetPassword.error', 'Error'),
          error.message
        );
      } else {
        setSuccess(true);
        Alert.alert(
          t('Auth.resetPassword.successTitle', 'Success'),
          t('Auth.resetPassword.successMessage', 'Password reset successfully'),
          [
            {
              text: 'OK',
              onPress: () => navigation.navigate('Login' as never),
            },
          ]
        );
      }
    } catch (err) {
      Alert.alert(
        t('Auth.resetPassword.error', 'Error'),
        t('Auth.resetPassword.errorGeneric', 'Failed to reset password')
      );
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <View style={[styles.successContainer, { backgroundColor: theme.background }]}>
        <View style={[styles.successIcon, { backgroundColor: theme.primary }]}>
          <Ionicons name="checkmark" size={32} color={theme.primaryForeground} />
        </View>
        <Text style={[styles.successTitle, { color: theme.foreground }]}>
          {t('Auth.resetPassword.successTitle', 'Password Reset!')}
        </Text>
        <Text style={[styles.successMessage, { color: theme.mutedForeground }]}>
          {t('Auth.resetPassword.successMessage', 'Your password has been reset successfully.')}
        </Text>
        <Text style={[styles.successRedirect, { color: theme.mutedForeground }]}>
          {t('Auth.resetPassword.redirectingMessage', 'Redirecting to login...')}
        </Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        style={[styles.container, { backgroundColor: theme.background }]}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <LinearGradient
          colors={['#06B6D4', '#3B82F6', '#8B5CF6']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.header}
        >
          <Text style={styles.logo}>RunFlow</Text>
        </LinearGradient>

        <View style={styles.formContainer}>
          <View style={styles.formHeader}>
            <Text style={[styles.title, { color: theme.foreground }]}>
              {t('Auth.resetPassword.title', 'Reset Password')}
            </Text>
            <Text style={[styles.subtitle, { color: theme.mutedForeground }]}>
              {t('Auth.resetPassword.subtitle', 'Enter your new password')}
            </Text>
          </View>

          <View style={styles.form}>
            <PasswordInput
              label={t('Auth.resetPassword.newPasswordLabel', 'New Password')}
              placeholder={t('Auth.resetPassword.newPasswordPlaceholder', 'Enter new password')}
              value={password}
              onChangeText={setPassword}
              autoComplete="password-new"
            />

            <PasswordInput
              label={t('Auth.resetPassword.confirmPasswordLabel', 'Confirm Password')}
              placeholder={t('Auth.resetPassword.confirmPasswordPlaceholder', 'Confirm new password')}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              autoComplete="password-new"
              containerStyle={{ marginTop: 16 }}
            />

            <Text style={[styles.hint, { color: theme.mutedForeground }]}>
              {t('Auth.resetPassword.passwordHint', 'Password must be at least 8 characters')}
            </Text>

            <Button
              onPress={handleSubmit}
              loading={loading}
              disabled={loading}
              style={{ marginTop: 24 }}
            >
              {loading
                ? t('Auth.resetPassword.resettingButton', 'Resetting...')
                : t('Auth.resetPassword.submitButton', 'Reset Password')}
            </Button>

            <Button
              onPress={() => navigation.navigate('Login' as never)}
              variant="ghost"
              style={{ marginTop: 16 }}
            >
              {t('Auth.resetPassword.backToLogin', 'Back to Login')}
            </Button>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  header: {
    paddingVertical: 48,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  logo: {
    fontSize: 36,
    fontWeight: 'bold',
    color: 'white',
  },
  formContainer: {
    flex: 1,
    paddingHorizontal: 24,
    paddingVertical: 32,
  },
  formHeader: {
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
  },
  form: {
    gap: 0,
  },
  hint: {
    fontSize: 12,
    marginTop: 8,
  },
  successContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  successIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  successMessage: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
  },
  successRedirect: {
    fontSize: 14,
  },
});
