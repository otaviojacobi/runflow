import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTranslation } from 'react-i18next';
import { supabase } from '../lib/supabase';

export function ForgotPasswordScreen({ navigation }: any) {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleResetPassword = async () => {
    if (!email) {
      Alert.alert('Error', t('auth.forgotPassword.errorRequired'));
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email);

      if (error) {
        Alert.alert('Error', error.message);
      } else {
        setSuccess(true);
      }
    } catch (error: any) {
      Alert.alert('Error', t('auth.errors.errorGeneric'));
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <LinearGradient
        colors={['#E0F2FE', '#DBEAFE', '#DDD6FE']}
        style={styles.container}
      >
        <View style={styles.successContainer}>
          <View style={styles.successCard}>
            <View style={styles.successIcon}>
              <Text style={styles.successIconText}>✓</Text>
            </View>
            <Text style={styles.successTitle}>{t('auth.forgotPassword.successTitle')}</Text>
            <Text style={styles.successMessage}>
              {t('auth.forgotPassword.successMessage')}{'\n'}
              <Text style={styles.successEmail}>{email}</Text>
            </Text>
            <Text style={styles.successHint}>
              {t('auth.forgotPassword.successHint')}
            </Text>
            <TouchableOpacity
              style={styles.button}
              onPress={() => navigation.navigate('Login')}
            >
              <Text style={styles.buttonText}>{t('auth.forgotPassword.backToLogin')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <LinearGradient
        colors={['#E0F2FE', '#DBEAFE', '#DDD6FE']}
        style={styles.gradient}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.header}>
            <Text style={styles.logo}>RunFlow</Text>
          </View>

          <View style={styles.formContainer}>
            <View style={styles.form}>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>{t('auth.forgotPassword.emailLabel')}</Text>
                <TextInput
                  style={styles.input}
                  placeholder={t('auth.forgotPassword.emailPlaceholder')}
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>

              <TouchableOpacity
                style={[styles.button, loading && styles.buttonDisabled]}
                onPress={handleResetPassword}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text style={styles.buttonText}>{t('auth.forgotPassword.submitButton')}</Text>
                )}
              </TouchableOpacity>

              <View style={styles.footer}>
                <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                  <Text style={styles.footerLink}>{t('auth.forgotPassword.backToLogin')}</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </ScrollView>
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
  scrollContent: {
    flexGrow: 1,
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 24,
    paddingBottom: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.1)',
  },
  logo: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#0284C7',
  },
  formContainer: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 48,
  },
  form: {
    backgroundColor: 'white',
    padding: 32,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 6,
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 16,
    backgroundColor: 'white',
  },
  button: {
    backgroundColor: '#2563EB',
    height: 48,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
  },
  footer: {
    alignItems: 'center',
    marginTop: 24,
  },
  footerLink: {
    fontSize: 14,
    fontWeight: '500',
    color: '#2563EB',
  },
  successContainer: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  successCard: {
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
  successIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#D1FAE5',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  successIconText: {
    fontSize: 32,
    color: '#059669',
  },
  successTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 8,
  },
  successMessage: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 16,
  },
  successEmail: {
    fontWeight: 'bold',
    color: '#111827',
  },
  successHint: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
    marginBottom: 24,
  },
});
