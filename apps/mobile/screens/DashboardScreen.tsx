import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../contexts/ThemeContext';
import { defaultTheme } from '../lib/theme';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../lib/supabase';
import Constants from 'expo-constants';

const API_URL = Constants.expoConfig?.extra?.apiUrl || process.env.EXPO_PUBLIC_API_URL || 'https://www.runflow.club';

interface UserProfile {
  id: string;
  email: string;
  name?: string | null;
}

interface Organization {
  id: string;
  name: string;
  role?: string;
}

export function DashboardScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const { theme } = useTheme();

  const [user, setUser] = useState<UserProfile | null>(null);
  const [currentOrganization, setCurrentOrganization] = useState<Organization | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigation.navigate('Login' as never);
        return;
      }

      const response = await fetch(`${API_URL}/api/users/me`, {
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
        setCurrentOrganization(data.currentOrganization);
      }
    } catch (error) {
      console.error('Failed to fetch user data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Different quick actions based on user role
  const getQuickActions = () => {
    const role = currentOrganization?.role;

    // For trainers and owners
    if (role === 'OWNER' || role === 'TRAINER') {
      return [
        {
          icon: 'people-outline',
          title: t('Dashboard.quickActions.teamManagement', 'Team Management'),
          description: t('Dashboard.quickActions.manageTeam', 'Manage your athletes'),
          screen: 'Athletes',
        },
        {
          icon: 'document-text-outline',
          title: t('Dashboard.quickActions.createTraining', 'Create Training'),
          description: t('Dashboard.quickActions.designSheets', 'Design training sheets'),
          screen: 'Training',
        },
        {
          icon: 'mail-outline',
          title: t('Dashboard.invitations', 'Invitations'),
          description: t('Dashboard.quickActions.manageInvites', 'Manage invites'),
          screen: 'Invites',
        },
        {
          icon: 'stats-chart-outline',
          title: t('Dashboard.quickActions.teamAnalytics', 'Team Analytics'),
          description: t('Dashboard.quickActions.trackProgress', 'Track progress'),
          screen: 'Analytics',
        },
      ];
    }

    // For athletes/members
    return [
      {
        icon: 'barbell-outline',
        title: t('Dashboard.quickActions.currentWorkout', 'Current Workout'),
        description: t('Dashboard.quickActions.startWorkout', 'Start training'),
        screen: 'Workout',
      },
      {
        icon: 'calendar-outline',
        title: t('Dashboard.quickActions.mySchedule', 'My Training Schedule'),
        description: t('Dashboard.quickActions.viewSchedule', 'View your workouts'),
        screen: 'Schedule',
      },
      {
        icon: 'trending-up-outline',
        title: t('Dashboard.quickActions.myProgress', 'My Progress'),
        description: t('Dashboard.quickActions.viewProgress', 'View your progress'),
        screen: 'Progress',
      },
      {
        icon: 'person-outline',
        title: t('Dashboard.quickActions.myProfile', 'My Profile'),
        description: t('Dashboard.quickActions.updateProfile', 'Update your profile'),
        screen: 'Profile',
      },
    ];
  };

  const quickActions = getQuickActions();

  if (loading) {
    return (
      <View style={[styles.centerContainer, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={theme.primary} />
        <Text style={[styles.loadingText, { color: theme.mutedForeground }]}>
          {t('Dashboard.loading', 'Loading...')}
        </Text>
      </View>
    );
  }

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.content}>
        {/* Quick Actions */}
        <View style={styles.quickActionsGrid}>
          {quickActions.map((action, index) => {
            const hasCustomSecondary = theme.secondary !== defaultTheme.secondary;
            const isSecondary = index % 2 === 1 && hasCustomSecondary;
            const accentColor = isSecondary ? theme.secondary : theme.primary;
            return (
            <TouchableOpacity
              key={index}
              onPress={() => navigation.navigate(action.screen as never)}
              activeOpacity={0.7}
            >
              <Card style={{ ...styles.quickActionCard, borderLeftWidth: 3, borderLeftColor: accentColor }}>
                <View style={[styles.iconContainer, { backgroundColor: `${accentColor}20` }]}>
                  <Ionicons name={action.icon as any} size={24} color={accentColor} />
                </View>
                <CardHeader>
                  <CardTitle style={styles.quickActionTitle}>{action.title}</CardTitle>
                  <CardDescription style={styles.quickActionDescription}>
                    {action.description}
                  </CardDescription>
                </CardHeader>
              </Card>
            </TouchableOpacity>
            );
          })}
        </View>

        {/* Overview Cards */}
        <View style={styles.overviewSection}>
          <Card style={{ ...styles.overviewCard, borderTopWidth: 3, borderTopColor: theme.primary }}>
            <CardHeader>
              <CardTitle>{t('Dashboard.overview.organizationStats', 'Organization Stats')}</CardTitle>
              <CardDescription>
                {t('Dashboard.overview.teamOverview', 'Team overview')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <View style={styles.statsRow}>
                <Text style={[styles.statsLabel, { color: theme.mutedForeground }]}>
                  {t('Dashboard.overview.totalMembers', 'Total Members')}
                </Text>
                <Text style={[styles.statsValue, { color: theme.primary }]}>0</Text>
              </View>
              <View style={styles.statsRow}>
                <Text style={[styles.statsLabel, { color: theme.mutedForeground }]}>
                  {t('Dashboard.overview.activeAthletes', 'Active Athletes')}
                </Text>
                <Text style={[styles.statsValue, { color: theme.primary }]}>0</Text>
              </View>
              <View style={styles.statsRow}>
                <Text style={[styles.statsLabel, { color: theme.mutedForeground }]}>
                  {t('Dashboard.overview.pendingInvites', 'Pending Invites')}
                </Text>
                <Text style={[styles.statsValue, { color: theme.secondary !== defaultTheme.secondary ? theme.secondary : theme.primary }]}>0</Text>
              </View>
            </CardContent>
          </Card>

          <Card style={styles.overviewCard}>
            <CardHeader>
              <CardTitle>{t('Dashboard.overview.trainingPrograms', 'Training Programs')}</CardTitle>
              <CardDescription>
                {t('Dashboard.overview.activeSheets', 'Active sheets')}
              </CardDescription>
            </CardHeader>
            <CardContent style={styles.emptyState}>
              <Ionicons name="document-text-outline" size={48} color={theme.mutedForeground} />
              <Text style={[styles.emptyStateText, { color: theme.mutedForeground }]}>
                {t('Dashboard.overview.noProgramsYet', 'No programs yet')}
              </Text>
              <Button
                size="sm"
                style={{ marginTop: 12 }}
                onPress={() => navigation.navigate('Training' as never)}
              >
                {t('Dashboard.overview.createFirstProgram', 'Create first program')}
              </Button>
            </CardContent>
          </Card>
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
    paddingTop: 24,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
  },
  quickActionsGrid: {
    gap: 12,
    marginBottom: 24,
  },
  quickActionCard: {
    marginBottom: 12,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  quickActionTitle: {
    fontSize: 16,
  },
  quickActionDescription: {
    fontSize: 12,
  },
  overviewSection: {
    gap: 16,
  },
  overviewCard: {
    marginBottom: 16,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  statsLabel: {
    fontSize: 14,
  },
  statsValue: {
    fontSize: 16,
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  emptyStateText: {
    fontSize: 14,
    marginTop: 12,
  },
});
