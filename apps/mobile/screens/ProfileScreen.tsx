import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { supabase } from '../lib/supabase';
import { useTheme } from '../contexts/ThemeContext';

export function ProfileScreen({ navigation }: any) {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      // First check if we have a session
      const { data: { session } } = await supabase.auth.getSession();
      console.log('Session:', session ? 'exists' : 'none');

      if (session) {
        const { data: { user } } = await supabase.auth.getUser();
        console.log('User loaded:', user?.email, user?.id);
        setUser(user);
      } else {
        console.log('No session found, redirecting to login');
        navigation.replace('Login');
      }
    } catch (error) {
      console.error('Error loading user:', error);
      navigation.replace('Login');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      navigation.replace('Login');
    } catch (error: any) {
      Alert.alert('Error', t('auth.errors.errorLogout'));
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.primary} />
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Colored header banner */}
      <View style={[styles.headerBanner, { backgroundColor: theme.primary }]}>
        <Text style={[styles.logo, { color: theme.primaryForeground }]}>RunFlow</Text>
      </View>

      <View style={styles.content}>
        <View style={[styles.card, { backgroundColor: theme.card }]}>
          <View style={[styles.avatarContainer, { backgroundColor: theme.primary, marginTop: -56 }]}>
            <Text style={[styles.avatarText, { color: theme.primaryForeground }]}>
              {user?.email?.charAt(0).toUpperCase() || 'U'}
            </Text>
          </View>

          <Text style={[styles.title, { color: theme.foreground }]}>{t('auth.profile.title')}</Text>

          <View style={[styles.infoContainer, { backgroundColor: `${theme.secondary}30`, borderRadius: 8, padding: 12 }]}>
            <Text style={[styles.label, { color: theme.mutedForeground }]}>{t('auth.profile.emailLabel')}</Text>
            <Text style={[styles.value, { color: theme.foreground }]}>{user?.email || t('auth.profile.notAvailable')}</Text>
          </View>

          <View style={[styles.infoContainer, { backgroundColor: `${theme.secondary}30`, borderRadius: 8, padding: 12 }]}>
            <Text style={[styles.label, { color: theme.mutedForeground }]}>{t('auth.profile.userIdLabel')}</Text>
            <Text style={[styles.value, { color: theme.foreground }]} numberOfLines={1}>
              {user?.id || t('auth.profile.notAvailable')}
            </Text>
          </View>

          <TouchableOpacity
            style={[styles.logoutButton, { backgroundColor: theme.destructive }]}
            onPress={handleLogout}
          >
            <Text style={[styles.logoutButtonText, { color: theme.destructiveForeground }]}>{t('auth.profile.logoutButton')}</Text>
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
  headerBanner: {
    paddingTop: 60,
    paddingHorizontal: 24,
    paddingBottom: 48,
  },
  logo: {
    fontSize: 24,
    fontWeight: 'bold',
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
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  avatarText: {
    fontSize: 32,
    fontWeight: 'bold',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 32,
  },
  infoContainer: {
    width: '100%',
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 6,
  },
  value: {
    fontSize: 16,
  },
  logoutButton: {
    width: '100%',
    height: 48,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 12,
  },
  logoutButtonText: {
    fontSize: 16,
    fontWeight: '500',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
