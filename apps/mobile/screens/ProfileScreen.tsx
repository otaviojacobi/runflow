import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { supabase } from '../lib/supabase';
import { useTheme } from '../contexts/ThemeContext';
import { useOrganization } from '../contexts/OrganizationContext';
import { defaultTheme } from '../lib/theme';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';

export function ProfileScreen({ navigation }: any) {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const { user: orgUser } = useOrganization();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const primaryColor = theme.primary;

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        const { data: { user } } = await supabase.auth.getUser();
        setUser(user);
      } else {
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
      <View style={[styles.container, { backgroundColor: `${theme.primary}08` }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.primary} />
        </View>
      </View>
    );
  }

  return (
    <ScrollView style={[styles.container, { backgroundColor: `${theme.primary}08` }]}>
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.title, { color: theme.foreground }]}>
            {t('auth.profile.title')}
          </Text>
          <Text style={[styles.subtitle, { color: theme.mutedForeground }]}>
            {t('auth.profile.description', 'Manage your account')}
          </Text>
        </View>

        {/* Account Info Card */}
        <Card style={{ ...styles.card, borderLeftWidth: 3, borderLeftColor: primaryColor }}>
          <CardHeader>
            <CardTitle style={styles.cardTitleText}>
              {t('auth.profile.accountInfo', 'Account Information')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {/* Avatar Row */}
            <View style={styles.avatarRow}>
              <View style={[styles.avatarContainer, { backgroundColor: primaryColor }]}>
                <Text style={[styles.avatarText, { color: theme.primaryForeground }]}>
                  {user?.email?.charAt(0).toUpperCase() || 'U'}
                </Text>
              </View>
              <View style={styles.avatarInfo}>
                <Text style={[styles.avatarName, { color: theme.foreground }]}>
                  {orgUser?.name || user?.email || t('auth.profile.notAvailable')}
                </Text>
              </View>
            </View>

            <View style={[styles.separator, { borderBottomColor: 'rgba(0,0,0,0.05)' }]} />

            {/* Email */}
            <View style={styles.settingRow}>
              <View style={styles.settingTextContainer}>
                <Text style={[styles.settingLabel, { color: theme.mutedForeground }]}>
                  {t('auth.profile.emailLabel')}
                </Text>
              </View>
              <Text style={[styles.settingValue, { color: theme.foreground }]}>
                {user?.email || t('auth.profile.notAvailable')}
              </Text>
            </View>

            {/* User ID */}
            <View style={[styles.settingRow, styles.settingRowLast]}>
              <View style={styles.settingTextContainer}>
                <Text style={[styles.settingLabel, { color: theme.mutedForeground }]}>
                  {t('auth.profile.userIdLabel')}
                </Text>
              </View>
              <Text style={[styles.settingValue, { color: theme.foreground }]} numberOfLines={1}>
                {user?.id || t('auth.profile.notAvailable')}
              </Text>
            </View>
          </CardContent>
        </Card>

        {/* Logout Button */}
        <View style={styles.logoutContainer}>
          <Button variant="destructive" onPress={handleLogout} style={{ width: '100%' }}>
            {t('auth.profile.logoutButton')}
          </Button>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
  },
  card: {
    marginBottom: 16,
  },
  cardTitleText: {
    fontSize: 18,
  },
  avatarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  avatarContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  avatarInfo: {
    flex: 1,
  },
  avatarName: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 2,
  },
  separator: {
    borderBottomWidth: 1,
    marginBottom: 4,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  settingRowLast: {
    borderBottomWidth: 0,
  },
  settingTextContainer: {
    flex: 1,
    marginRight: 16,
  },
  settingLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  settingValue: {
    fontSize: 14,
    maxWidth: '60%',
    textAlign: 'right',
  },
  logoutContainer: {
    marginTop: 8,
    marginBottom: 32,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
