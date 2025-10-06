import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTranslation } from 'react-i18next';
import { api } from '../lib/api';

export function VerifyEmailScreen({ route, navigation }: any) {
  const { t } = useTranslation();
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
    <LinearGradient
      colors={['#E0F2FE', '#DBEAFE', '#DDD6FE']}
      style={styles.container}
    >
      <View style={styles.content}>
        <View style={styles.card}>
          <View style={styles.iconContainer}>
            <Text style={styles.iconText}>✉️</Text>
          </View>

          <Text style={styles.title}>{t('auth.verifyEmail.title')}</Text>

          <Text style={styles.message}>
            {t('auth.verifyEmail.message')}{'\n'}
            <Text style={styles.email}>{email}</Text>
          </Text>

          <Text style={styles.hint}>
            {t('auth.verifyEmail.hint')}
          </Text>

          <TouchableOpacity
            style={[styles.resendButton, loading && styles.buttonDisabled]}
            onPress={handleResendEmail}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#2563EB" />
            ) : (
              <Text style={styles.resendButtonText}>{t('auth.verifyEmail.resendButton')}</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.loginButton}
            onPress={() => navigation.navigate('Login')}
          >
            <Text style={styles.loginButtonText}>{t('auth.verifyEmail.backToLogin')}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </LinearGradient>
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
    backgroundColor: 'white',
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
    backgroundColor: '#DBEAFE',
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
    color: '#111827',
    marginBottom: 16,
  },
  message: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 12,
  },
  email: {
    fontWeight: 'bold',
    color: '#111827',
  },
  hint: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
    marginBottom: 32,
  },
  resendButton: {
    width: '100%',
    height: 48,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#2563EB',
    backgroundColor: 'white',
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
    color: '#2563EB',
  },
  loginButton: {
    width: '100%',
    height: 48,
    borderRadius: 8,
    backgroundColor: '#2563EB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loginButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: 'white',
  },
});
