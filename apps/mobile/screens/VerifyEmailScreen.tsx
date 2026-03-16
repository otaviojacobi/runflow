import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { api } from '../lib/api';
import { useTheme } from '../contexts/ThemeContext';

export function VerifyEmailScreen({ route, navigation }: any) {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const { email } = route.params;
  const [loading, setLoading] = useState(false);

  const handleResendEmail = async () => {
    setLoading(true);
    try {
      await api.resendConfirmation(email);
      Alert.alert('Success', t('auth.verifyEmail.successResend'));
    } catch (error: any) {
      Alert.alert('Error', error.message || t('auth.verifyEmail.errorResend'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.content}>
        <View style={[styles.card, { backgroundColor: theme.card }]}>
          <View style={[styles.iconContainer, { backgroundColor: theme.secondary }]}>
            <Text style={styles.iconText}>✉️</Text>
          </View>

          <Text style={[styles.title, { color: theme.foreground }]}>{t('auth.verifyEmail.title')}</Text>

          <Text style={[styles.message, { color: theme.mutedForeground }]}>
            {t('auth.verifyEmail.message')}{'\n'}
            <Text style={[styles.email, { color: theme.foreground }]}>{email}</Text>
          </Text>

          <Text style={[styles.hint, { color: theme.mutedForeground }]}>
            {t('auth.verifyEmail.hint')}
          </Text>

          <TouchableOpacity
            style={[styles.resendButton, { borderColor: theme.primary }, loading && styles.buttonDisabled]}
            onPress={handleResendEmail}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={theme.primary} />
            ) : (
              <Text style={[styles.resendButtonText, { color: theme.primary }]}>{t('auth.verifyEmail.resendButton')}</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.loginButton, { backgroundColor: theme.primary }]}
            onPress={() => navigation.navigate('Login')}
          >
            <Text style={[styles.loginButtonText, { color: theme.primaryForeground }]}>{t('auth.verifyEmail.backToLogin')}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  card: {
    padding: 32,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  iconText: {
    fontSize: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  message: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 12,
  },
  email: {
    fontWeight: 'bold',
  },
  hint: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 32,
  },
  resendButton: {
    width: '100%',
    height: 48,
    borderRadius: 8,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  resendButtonText: {
    fontSize: 16,
    fontWeight: '500',
  },
  loginButton: {
    width: '100%',
    height: 48,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loginButtonText: {
    fontSize: 16,
    fontWeight: '500',
  },
});
