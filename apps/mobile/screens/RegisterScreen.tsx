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
import { signInWithGoogle } from '../lib/googleAuth';

export function RegisterScreen({ navigation }: any) {
  const { t } = useTranslation();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!email || !password) {
      Alert.alert('Error', t('auth.register.errorRequired'));
      return;
    }

    setLoading(true);
    try {
      await api.register(name, email, password);
      navigation.navigate('VerifyEmail', { email });
    } catch (error: any) {
      Alert.alert(t('auth.errors.registerFailed'), error.message || t('auth.errors.errorGeneric'));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
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
                <Text style={styles.label}>{t('auth.register.nameLabel')}</Text>
                <TextInput
                  style={styles.input}
                  placeholder={t('auth.register.namePlaceholder')}
                  value={name}
                  onChangeText={setName}
                  autoCapitalize="words"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>{t('auth.register.emailLabel')}</Text>
                <TextInput
                  style={styles.input}
                  placeholder={t('auth.register.emailPlaceholder')}
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>{t('auth.register.passwordLabel')}</Text>
                <PasswordInput
                  style={styles.input}
                  placeholder={t('auth.register.passwordPlaceholder')}
                  value={password}
                  onChangeText={setPassword}
                  autoCapitalize="none"
                />
                <Text style={styles.helperText}>
                  {t('auth.register.passwordHelper')}
                </Text>
              </View>

              <TouchableOpacity
                style={[styles.button, loading && styles.buttonDisabled]}
                onPress={handleRegister}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text style={styles.buttonText}>{t('auth.register.submitButton')}</Text>
                )}
              </TouchableOpacity>

              <View style={styles.divider}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>{t('auth.register.orContinueWith')}</Text>
                <View style={styles.dividerLine} />
              </View>

              <TouchableOpacity
                style={styles.googleButton}
                onPress={handleGoogleSignUp}
              >
                <GoogleIcon size={20} />
                <Text style={styles.googleButtonText}>{t('auth.register.googleButton')}</Text>
              </TouchableOpacity>

              <View style={styles.footer}>
                <Text style={styles.footerText}>{t('auth.register.haveAccount')} </Text>
                <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                  <Text style={styles.footerLink}>{t('auth.register.signInLink')}</Text>
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
  helperText: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
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
