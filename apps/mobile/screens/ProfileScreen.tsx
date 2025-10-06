import React, { useEffect, useState } from 'react';
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
import { supabase } from '../lib/supabase';

export function ProfileScreen({ navigation }: any) {
  const { t } = useTranslation();
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
      <LinearGradient
        colors={['#E0F2FE', '#DBEAFE', '#DDD6FE']}
        style={styles.container}
      >
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2563EB" />
        </View>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient
      colors={['#E0F2FE', '#DBEAFE', '#DDD6FE']}
      style={styles.container}
    >
      <View style={styles.header}>
        <Text style={styles.logo}>RunFlow</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.card}>
          <View style={styles.avatarContainer}>
            <Text style={styles.avatarText}>
              {user?.email?.charAt(0).toUpperCase() || 'U'}
            </Text>
          </View>

          <Text style={styles.title}>{t('auth.profile.title')}</Text>

          <View style={styles.infoContainer}>
            <Text style={styles.label}>{t('auth.profile.emailLabel')}</Text>
            <Text style={styles.value}>{user?.email || t('auth.profile.notAvailable')}</Text>
          </View>

          <View style={styles.infoContainer}>
            <Text style={styles.label}>{t('auth.profile.userIdLabel')}</Text>
            <Text style={styles.value} numberOfLines={1}>
              {user?.id || t('auth.profile.notAvailable')}
            </Text>
          </View>

          <TouchableOpacity
            style={styles.logoutButton}
            onPress={handleLogout}
          >
            <Text style={styles.logoutButtonText}>{t('auth.profile.logoutButton')}</Text>
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
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#2563EB',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  avatarText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 32,
  },
  infoContainer: {
    width: '100%',
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
    marginBottom: 6,
  },
  value: {
    fontSize: 16,
    color: '#111827',
  },
  logoutButton: {
    width: '100%',
    height: 48,
    borderRadius: 8,
    backgroundColor: '#DC2626',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 12,
  },
  logoutButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: 'white',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
