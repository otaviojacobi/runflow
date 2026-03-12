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
import { useTranslation } from 'react-i18next';
import { supabase } from '../lib/supabase';
import { useTheme } from '../contexts/ThemeContext';

export function ForgotPasswordScreen({ navigation }: any) {
  const { t } = useTranslation();
  const { theme } = useTheme();
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
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <View style={styles.successContainer}>
          <View style={[styles.successCard, { backgroundColor: theme.card }]}>
            <View style={[styles.successIcon, { backgroundColor: theme.secondary }]}>
              <Text style={[styles.successIconText, { color: theme.primary }]}>✓</Text>
            </View>
            <Text style={[styles.successTitle, { color: theme.foreground }]}>{t('auth.forgotPassword.successTitle')}</Text>
            <Text style={[styles.successMessage, { color: theme.mutedForeground }]}>
              {t('auth.forgotPassword.successMessage')}{'\n'}
              <Text style={[styles.successEmail, { color: theme.foreground }]}>{email}</Text>
            </Text>
            <Text style={[styles.successHint, { color: theme.mutedForeground }]}>
              {t('auth.forgotPassword.successHint')}
            </Text>
            <TouchableOpacity
              style={[styles.button, { backgroundColor: theme.primary }]}
              onPress={() => navigation.navigate('Login')}
            >
              <Text style={[styles.buttonText, { color: theme.primaryForeground }]}>{t('auth.forgotPassword.backToLogin')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <View style={[styles.gradient, { backgroundColor: theme.background }]}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={[styles.header, { backgroundColor: theme.card, borderBottomColor: theme.border }]}>
            <Text style={[styles.logo, { color: theme.primary }]}>RunFlow</Text>
          </View>

          <View style={styles.formContainer}>
            <View style={[styles.form, { backgroundColor: theme.card }]}>
              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: theme.foreground }]}>{t('auth.forgotPassword.emailLabel')}</Text>
                <TextInput
                  style={[styles.input, { borderColor: theme.input, backgroundColor: theme.card, color: theme.foreground }]}
                  placeholder={t('auth.forgotPassword.emailPlaceholder')}
                  placeholderTextColor={theme.mutedForeground}
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>

              <TouchableOpacity
                style={[styles.button, { backgroundColor: theme.primary }, loading && styles.buttonDisabled]}
                onPress={handleResetPassword}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color={theme.primaryForeground} />
                ) : (
                  <Text style={[styles.buttonText, { color: theme.primaryForeground }]}>{t('auth.forgotPassword.submitButton')}</Text>
                )}
              </TouchableOpacity>

              <View style={styles.footer}>
                <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                  <Text style={[styles.footerLink, { color: theme.primary }]}>{t('auth.forgotPassword.backToLogin')}</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </ScrollView>
      </View>
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
    borderBottomWidth: 1,
  },
  logo: {
    fontSize: 24,
    fontWeight: 'bold',
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
    marginBottom: 6,
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 16,
  },
  button: {
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
  },
  successContainer: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  successCard: {
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
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  successIconText: {
    fontSize: 32,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  successMessage: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 16,
  },
  successEmail: {
    fontWeight: 'bold',
  },
  successHint: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 24,
  },
});
