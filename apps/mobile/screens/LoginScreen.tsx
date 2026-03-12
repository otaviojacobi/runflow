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
import { PasswordInput } from '../components/PasswordInput';
import { GoogleIcon } from '../components/GoogleIcon';
import { api } from '../lib/api';
import { supabase } from '../lib/supabase';
import { signInWithGoogle } from '../lib/googleAuth';
import { useTheme } from '../contexts/ThemeContext';

export function LoginScreen({ navigation }: any) {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Erro', t('auth.register.errorRequired'));
      return;
    }

    setLoading(true);
    try {
      const response = await api.login(email, password);
      console.log('Login response:', response);

      // The API returns session tokens, but we need to set them in Supabase
      if (response.session) {
        const { error } = await supabase.auth.setSession({
          access_token: response.session.access_token,
          refresh_token: response.session.refresh_token,
        });

        if (error) {
          console.error('Error setting session:', error);
          Alert.alert('Erro', 'Falha ao configurar sessão');
          return;
        }

        console.log('Session set successfully');
        navigation.replace('Profile');
      } else {
        Alert.alert('Erro', 'Resposta de login inválida');
      }
    } catch (error: any) {
      console.error('Login error:', error);
      Alert.alert(t('auth.errors.loginFailed'), error.message || t('auth.errors.errorGeneric'));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    const result = await signInWithGoogle();

    if (!result.success) {
      Alert.alert('Erro', result.error || t('auth.errors.errorGoogle'));
    } else {
      // Success! Navigation will happen automatically via auth state change
      navigation.replace('Profile');
    }
  };

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
                <Text style={[styles.label, { color: theme.foreground }]}>{t('auth.login.emailLabel')}</Text>
                <TextInput
                  style={[styles.input, { borderColor: theme.input, backgroundColor: theme.card, color: theme.foreground }]}
                  placeholder={t('auth.login.emailPlaceholder')}
                  placeholderTextColor={theme.mutedForeground}
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>

              <View style={styles.inputGroup}>
                <View style={styles.labelRow}>
                  <Text style={[styles.label, { color: theme.foreground }]}>{t('auth.login.passwordLabel')}</Text>
                  <TouchableOpacity onPress={() => navigation.navigate('ForgotPassword')}>
                    <Text style={[styles.forgotPassword, { color: theme.primary }]}>{t('auth.login.forgotPassword')}</Text>
                  </TouchableOpacity>
                </View>
                <PasswordInput
                  style={[styles.input, { borderColor: theme.input, backgroundColor: theme.card, color: theme.foreground }]}
                  placeholder={t('auth.login.passwordPlaceholder')}
                  placeholderTextColor={theme.mutedForeground}
                  value={password}
                  onChangeText={setPassword}
                  autoCapitalize="none"
                />
              </View>

              <TouchableOpacity
                style={[styles.button, { backgroundColor: theme.primary }, loading && styles.buttonDisabled]}
                onPress={handleLogin}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color={theme.primaryForeground} />
                ) : (
                  <Text style={[styles.buttonText, { color: theme.primaryForeground }]}>{t('auth.login.submitButton')}</Text>
                )}
              </TouchableOpacity>

              <View style={styles.divider}>
                <View style={[styles.dividerLine, { backgroundColor: theme.border }]} />
                <Text style={[styles.dividerText, { color: theme.mutedForeground }]}>{t('auth.login.orContinueWith')}</Text>
                <View style={[styles.dividerLine, { backgroundColor: theme.border }]} />
              </View>

              <TouchableOpacity
                style={[styles.googleButton, { borderColor: theme.border, backgroundColor: theme.card }]}
                onPress={handleGoogleSignIn}
              >
                <GoogleIcon size={20} />
                <Text style={[styles.googleButtonText, { color: theme.foreground }]}>{t('auth.login.googleButton')}</Text>
              </TouchableOpacity>

              <View style={styles.footer}>
                <Text style={[styles.footerText, { color: theme.mutedForeground }]}>{t('auth.login.noAccount')} </Text>
                <TouchableOpacity onPress={() => navigation.navigate('Register')}>
                  <Text style={[styles.footerLink, { color: theme.primary }]}>{t('auth.login.signUpLink')}</Text>
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
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  forgotPassword: {
    fontSize: 14,
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
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    marginHorizontal: 12,
    fontSize: 14,
  },
  googleButton: {
    height: 48,
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  googleButtonText: {
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 12,
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
  },
});
