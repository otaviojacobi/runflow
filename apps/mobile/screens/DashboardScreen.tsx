import React, { useState, useCallback } from 'react';
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
import { useFocusEffect } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../contexts/ThemeContext';
import { useOrganization } from '../contexts/OrganizationContext';
import { defaultTheme } from '../lib/theme';
import { api } from '../lib/api';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Ionicons } from '@expo/vector-icons';
import Markdown from 'react-native-markdown-display';

interface Training {
  id: string;
  title: string;
  subtitle?: string;
  description?: string;
  type: 'RUNNING' | 'STRENGTH';
  status: 'TODO' | 'COMPLETED' | 'MISSED';
  scheduledDate: string;
}

export function DashboardScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const { theme } = useTheme();
  const { currentOrganization, loading, user } = useOrganization();

  const [nextTraining, setNextTraining] = useState<Training | null>(null);
  const [loadingTraining, setLoadingTraining] = useState(false);

  const primaryColor = theme.primary;
  const hasCustomSecondary = theme.secondary !== defaultTheme.secondary;
  const secondaryColor = hasCustomSecondary ? theme.secondary : '#6C757D';
  const capitalizedName = user?.name
    ?.split(' ')
    .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
  const greeting = capitalizedName
    ? t('Dashboard.helloName', 'Hello, {{name}}', { name: capitalizedName })
    : t('Dashboard.hello', 'Hello');

  const role = currentOrganization?.role;
  const isTrainerOrOwner = role === 'OWNER' || role === 'TRAINER';
  const isAthlete = !isTrainerOrOwner;

  useFocusEffect(
    useCallback(() => {
      if (!isAthlete || !currentOrganization || !user) return;
      setLoadingTraining(true);
      api.getTrainings({
        organizationId: currentOrganization.id,
        memberId: user.id,
      })
        .then((data) => {
          const all = Array.isArray(data) ? data as Training[] : [];
          const now = new Date();
          const weekStart = new Date(now);
          weekStart.setDate(now.getDate() - now.getDay() + (now.getDay() === 0 ? -6 : 1));
          weekStart.setHours(0, 0, 0, 0);
          const weekEnd = new Date(weekStart);
          weekEnd.setDate(weekStart.getDate() + 6);
          weekEnd.setHours(23, 59, 59, 999);

          // Parse scheduledDate as local date to avoid timezone shift
          // (API returns "YYYY-MM-DDT00:00:00.000Z" for DATE columns)
          const parseLocal = (iso: string) => {
            const parts = iso.split('T')[0]?.split('-').map(Number);
            if (!parts || parts.length < 3) return new Date(iso);
            return new Date(parts[0]!, parts[1]! - 1, parts[2]!);
          };

          const thisWeekTodo = all
            .filter((tr) => {
              if (tr.status !== 'TODO') return false;
              const d = parseLocal(tr.scheduledDate);
              return d >= weekStart && d <= weekEnd;
            })
            .sort((a, b) => parseLocal(a.scheduledDate).getTime() - parseLocal(b.scheduledDate).getTime());

          setNextTraining(thisWeekTodo[0] || null);
        })
        .catch(() => setNextTraining(null))
        .finally(() => setLoadingTraining(false));
    }, [currentOrganization?.id, user?.id, isAthlete])
  );

  const dayKeys = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'] as const;
  const dayDefaults = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  const parseLocalDate = (iso: string) => {
    const parts = iso.split('T')[0]?.split('-').map(Number);
    if (!parts || parts.length < 3) return new Date(iso);
    return new Date(parts[0]!, parts[1]! - 1, parts[2]!);
  };

  const formatTrainingDate = (dateString: string) => {
    const date = parseLocalDate(dateString);
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    const trainingDay = new Date(date.getFullYear(), date.getMonth(), date.getDate());

    if (trainingDay.getTime() === today.getTime()) {
      return t('Dashboard.today', 'Today');
    }
    if (trainingDay.getTime() === tomorrow.getTime()) {
      return t('Dashboard.tomorrow', 'Tomorrow');
    }
    const dayIdx = date.getDay();
    return t(`Dashboard.days.${dayKeys[dayIdx]}`, dayDefaults[dayIdx] ?? '');
  };

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
          screen: 'CreateTraining',
        },
        {
          icon: 'mail-outline' as const,
          title: t('Dashboard.invitations', 'Invitations'),
          description: t('Dashboard.quickActions.manageInvites', 'Manage invites'),
          screen: 'Invites',
        },
        {
          icon: 'flag-outline' as const,
          title: t('Dashboard.quickActions.manageClub', 'Manage Club'),
          description: t('Dashboard.quickActions.manageClubDescription', 'Manage your organization'),
          screen: 'Organizations',
        },
      ];
    }

    return [
      {
        icon: 'calendar-outline' as const,
        title: t('Dashboard.quickActions.mySchedule', 'My Training Schedule'),
        description: t('Dashboard.quickActions.viewSchedule', 'View your workouts'),
        screen: 'Schedule',
      },
      {
        icon: 'flag-outline' as const,
        title: t('Dashboard.quickActions.myClub', 'My Club'),
        description: t('Dashboard.quickActions.myClubDescription', 'View your organization'),
        screen: 'Organizations',
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
        {/* Welcome Banner + Next Training (single block) */}
        <TouchableOpacity
          onPress={isAthlete && nextTraining ? () => navigation.navigate('Schedule' as never) : undefined}
          activeOpacity={isAthlete && nextTraining ? 0.8 : 1}
          disabled={!isAthlete || !nextTraining}
        >
          <LinearGradient
            colors={[primaryColor, secondaryColor]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.welcomeBanner}
          >
            <Text style={styles.welcomeTitle}>
              {greeting}!
            </Text>

            {isAthlete && !loadingTraining && !nextTraining && (
              <>
                <View style={styles.bannerDivider} />
                <Text style={styles.bannerAllDone}>
                  {t('Dashboard.allDoneThisWeek', 'You\'re all caught up this week!')}
                </Text>
              </>
            )}

            {isAthlete && nextTraining && (
              <>
                <View style={styles.bannerDivider} />

                {/* Up next label */}
                <Text style={styles.bannerUpNextLabel}>
                  {t('Dashboard.upNext', 'Up next')} · {formatTrainingDate(nextTraining.scheduledDate)}
                </Text>

                {/* Title row with type icon */}
                <View style={styles.bannerTrainingRow}>
                  <Ionicons
                    name={nextTraining.type === 'RUNNING' ? 'walk' : 'barbell'}
                    size={20}
                    color="#FFFFFF"
                  />
                  <Text style={styles.bannerTrainingTitle} numberOfLines={1}>
                    {nextTraining.title}
                  </Text>
                </View>

                {nextTraining.subtitle && (
                  <Text style={styles.bannerSubtitle}>
                    {nextTraining.subtitle}
                  </Text>
                )}

                {/* Training body inside the banner */}
                {nextTraining.description ? (
                  <View style={styles.bannerDescriptionBox}>
                    <Markdown style={bannerMarkdownStyles}>
                      {nextTraining.description}
                    </Markdown>
                  </View>
                ) : null}
              </>
            )}

            <View style={styles.decorCircle1} />
            <View style={styles.decorCircle2} />
          </LinearGradient>
        </TouchableOpacity>

        {/* Quick Actions */}
        <View style={styles.quickActionsGrid}>
          {quickActions.map((action, index) => {
            const iconBgColor = hasCustomSecondary ? theme.secondary : theme.primary;
            return (
              <TouchableOpacity
                key={index}
                onPress={() => navigation.navigate(action.screen as never)}
                activeOpacity={0.7}
              >
                <Card style={{ ...styles.quickActionCard, borderLeftWidth: 3, borderLeftColor: theme.primary }}>
                  <View style={[styles.iconContainer, { backgroundColor: `${iconBgColor}20` }]}>
                    <Ionicons name={action.icon} size={24} color={theme.primary} />
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

        {/* Overview Cards - Only for trainers/owners */}
        {isTrainerOrOwner && (
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
                  onPress={() => navigation.navigate('CreateTraining' as never)}
                >
                  {t('Dashboard.overview.createFirstProgram', 'Create first program')}
                </Button>
              </CardContent>
            </Card>
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const bannerMarkdownStyles = {
  body: { color: '#1a1a1a', fontSize: 15, lineHeight: 22 },
  heading1: { fontSize: 20, fontWeight: 'bold' as const, marginBottom: 8, color: '#1a1a1a' },
  heading2: { fontSize: 18, fontWeight: 'bold' as const, marginBottom: 6, color: '#1a1a1a' },
  heading3: { fontSize: 16, fontWeight: '600' as const, marginBottom: 4, color: '#1a1a1a' },
  paragraph: { marginBottom: 8, marginTop: 0 },
  strong: { fontWeight: 'bold' as const },
  em: { fontStyle: 'italic' as const },
  bullet_list: { marginBottom: 8 },
  ordered_list: { marginBottom: 8 },
  list_item: { marginBottom: 4 },
};

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
  welcomeTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  bannerDivider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.2)',
    marginVertical: 14,
  },
  bannerUpNextLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.7)',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  bannerTrainingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  bannerTrainingTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    flex: 1,
  },
  bannerSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.75)',
    marginTop: 2,
  },
  bannerDescriptionBox: {
    marginTop: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 14,
  },
  bannerDescription: {
    fontSize: 15,
    lineHeight: 22,
    color: '#1a1a1a',
  },
  bannerAllDone: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
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

  // Quick Actions
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

  // Overview Cards
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
