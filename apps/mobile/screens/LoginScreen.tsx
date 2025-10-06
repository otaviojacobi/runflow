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
import { PasswordInput } from '../components/PasswordInput';
import { GoogleIcon } from '../components/GoogleIcon';
import { api } from '../lib/api';
import { supabase } from '../lib/supabase';
import { signInWithGoogle } from '../lib/googleAuth';

export function LoginScreen({ navigation }: any) {
  const { t } = useTranslation();
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
                <Text style={styles.label}>{t('auth.login.emailLabel')}</Text>
                <TextInput
                  style={styles.input}
                  placeholder={t('auth.login.emailPlaceholder')}
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>

              <View style={styles.inputGroup}>
                <View style={styles.labelRow}>
                  <Text style={styles.label}>{t('auth.login.passwordLabel')}</Text>
                  <TouchableOpacity onPress={() => navigation.navigate('ForgotPassword')}>
                    <Text style={styles.forgotPassword}>{t('auth.login.forgotPassword')}</Text>
                  </TouchableOpacity>
                </View>
                <PasswordInput
                  style={styles.input}
                  placeholder={t('auth.login.passwordPlaceholder')}
                  value={password}
                  onChangeText={setPassword}
                  autoCapitalize="none"
                />
              </View>

              <TouchableOpacity
                style={[styles.button, loading && styles.buttonDisabled]}
                onPress={handleLogin}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text style={styles.buttonText}>{t('auth.login.submitButton')}</Text>
                )}
              </TouchableOpacity>

              <View style={styles.divider}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>{t('auth.login.orContinueWith')}</Text>
                <View style={styles.dividerLine} />
              </View>

              <TouchableOpacity
                style={styles.googleButton}
                onPress={handleGoogleSignIn}
              >
                <GoogleIcon size={20} />
                <Text style={styles.googleButtonText}>{t('auth.login.googleButton')}</Text>
              </TouchableOpacity>

              <View style={styles.footer}>
                <Text style={styles.footerText}>{t('auth.login.noAccount')} </Text>
                <TouchableOpacity onPress={() => navigation.navigate('Register')}>
                  <Text style={styles.footerLink}>{t('auth.login.signUpLink')}</Text>
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
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  forgotPassword: {
    fontSize: 14,
    color: '#2563EB',
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
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#D1D5DB',
  },
  dividerText: {
    marginHorizontal: 12,
    fontSize: 14,
    color: '#6B7280',
  },
  googleButton: {
    height: 48,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    backgroundColor: 'white',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  googleButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#374151',
    marginLeft: 12,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 24,
  },
  footerText: {
    fontSize: 14,
    color: '#6B7280',
  },
  footerLink: {
    fontSize: 14,
    fontWeight: '500',
    color: '#2563EB',
  },
});
