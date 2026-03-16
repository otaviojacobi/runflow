import React from 'react';
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
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../contexts/ThemeContext';
import { useOrganization } from '../contexts/OrganizationContext';
import { defaultTheme } from '../lib/theme';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Ionicons } from '@expo/vector-icons';

export function DashboardScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const { theme } = useTheme();
  const { currentOrganization, loading, user } = useOrganization();

  const primaryColor = theme.primary;
  const hasCustomSecondary = theme.secondary !== defaultTheme.secondary;
  const secondaryColor = hasCustomSecondary ? theme.secondary : '#6C757D';
  const greeting = user?.name
    ? t('Dashboard.helloName', 'Hello, {{name}}', { name: user.name })
    : t('Dashboard.hello', 'Hello');

  const role = currentOrganization?.role;
  const isTrainerOrOwner = role === 'OWNER' || role === 'TRAINER';

  const getQuickActions = () => {
    if (isTrainerOrOwner) {
      return [
        {
          icon: 'people-outline' as const,
          title: t('Dashboard.quickActions.teamManagement', 'Team Management'),
          description: t('Dashboard.quickActions.manageTeam', 'Manage your athletes'),
          screen: 'Athletes',
        },
        {
          icon: 'document-text-outline' as const,
          title: t('Dashboard.quickActions.createTraining', 'Create Training'),
          description: t('Dashboard.quickActions.designSheets', 'Design training sheets'),
          screen: 'Training',
        },
        {
          icon: 'mail-outline' as const,
          title: t('Dashboard.invitations', 'Invitations'),
          description: t('Dashboard.quickActions.manageInvites', 'Manage invites'),
          screen: 'Invites',
        },
        {
          icon: 'stats-chart-outline' as const,
          title: t('Dashboard.quickActions.teamAnalytics', 'Team Analytics'),
          description: t('Dashboard.quickActions.trackProgress', 'Track progress'),
          screen: 'Analytics',
        },
      ];
    }

    return [
      {
        icon: 'barbell-outline' as const,
        title: t('Dashboard.quickActions.currentWorkout', 'Current Workout'),
        description: t('Dashboard.quickActions.startWorkout', 'Start training'),
        screen: 'Workout',
      },
      {
        icon: 'calendar-outline' as const,
        title: t('Dashboard.quickActions.mySchedule', 'My Training Schedule'),
        description: t('Dashboard.quickActions.viewSchedule', 'View your workouts'),
        screen: 'Schedule',
      },
      {
        icon: 'trending-up-outline' as const,
        title: t('Dashboard.quickActions.myProgress', 'My Progress'),
        description: t('Dashboard.quickActions.viewProgress', 'View your progress'),
        screen: 'Progress',
      },
      {
        icon: 'person-outline' as const,
        title: t('Dashboard.quickActions.myProfile', 'My Profile'),
        description: t('Dashboard.quickActions.updateProfile', 'Update your profile'),
        screen: 'Profile',
      },
    ];
  };

  const quickActions = getQuickActions();

  if (loading) {
    return (
      <View style={[styles.centerContainer, { backgroundColor: `${theme.primary}08` }]}>
        <ActivityIndicator size="large" color={theme.primary} />
        <Text style={[styles.loadingText, { color: theme.mutedForeground }]}>
          {t('Dashboard.loading', 'Loading...')}
        </Text>
      </View>
    );
  }

  return (
    <ScrollView style={[styles.container, { backgroundColor: `${theme.primary}08` }]}>
      <View style={styles.content}>
        {/* Welcome Banner */}
        <LinearGradient
          colors={[primaryColor, secondaryColor]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.welcomeBanner}
        >
          <View style={styles.welcomeContent}>
            <Text style={styles.welcomeTitle}>
              {greeting}!
            </Text>
          </View>
          <View style={styles.decorCircle1} />
          <View style={styles.decorCircle2} />
        </LinearGradient>

        {/* Quick Actions */}
        <View style={styles.quickActionsGrid}>
          {quickActions.map((action, index) => {
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
                    <Ionicons name={action.icon} size={24} color={accentColor} />
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
          <Card style={{ ...styles.overviewCard, borderTopWidth: 3, borderTopColor: primaryColor }}>
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
                <Text style={[styles.statsValue, { color: primaryColor }]}>0</Text>
              </View>
              <View style={styles.statsRow}>
                <Text style={[styles.statsLabel, { color: theme.mutedForeground }]}>
                  {t('Dashboard.overview.activeAthletes', 'Active Athletes')}
                </Text>
                <Text style={[styles.statsValue, { color: primaryColor }]}>0</Text>
              </View>
              <View style={styles.statsRow}>
                <Text style={[styles.statsLabel, { color: theme.mutedForeground }]}>
                  {t('Dashboard.overview.pendingInvites', 'Pending Invites')}
                </Text>
                <Text style={[styles.statsValue, { color: hasCustomSecondary ? theme.secondary : primaryColor }]}>0</Text>
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
    paddingTop: 16,
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

  // Welcome Banner
  welcomeBanner: {
    borderRadius: 16,
    padding: 20,
    overflow: 'hidden',
    position: 'relative',
    marginBottom: 20,
  },
  welcomeContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  welcomeTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  decorCircle1: {
    position: 'absolute',
    right: -12,
    bottom: -12,
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  decorCircle2: {
    position: 'absolute',
    right: -4,
    top: -16,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },

  // Quick Actions (original layout)
  quickActionsGrid: {
    gap: 12,
    marginBottom: 24,
  },
  quickActionCard: {
    marginBottom: 0,
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

  // Overview Cards (original layout)
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
