import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  RefreshControl,
  Modal,
  Pressable,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useFocusEffect } from '@react-navigation/native';
import { useTheme } from '../contexts/ThemeContext';
import { useOrganization } from '../contexts/OrganizationContext';
import { api } from '../lib/api';
import { Card, CardContent } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
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

export function ScheduleScreen() {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const { currentOrganization, user } = useOrganization();

  const [trainings, setTrainings] = useState<Training[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedTraining, setSelectedTraining] = useState<Training | null>(null);

  // Week navigation
  const getWeekStart = (d: Date) => {
    const date = new Date(d.getFullYear(), d.getMonth(), d.getDate());
    const day = date.getDay();
    date.setDate(date.getDate() - day + (day === 0 ? -6 : 1)); // Monday
    return date;
  };
  const [weekStart, setWeekStart] = useState(() => getWeekStart(new Date()));
  const weekEnd = new Date(weekStart.getFullYear(), weekStart.getMonth(), weekStart.getDate() + 6, 23, 59, 59, 999);
  const isCurrentWeek = getWeekStart(new Date()).getTime() === weekStart.getTime();

  const goToPreviousWeek = () => {
    setWeekStart((prev) => {
      const d = new Date(prev);
      d.setDate(d.getDate() - 7);
      return d;
    });
  };
  const goToNextWeek = () => {
    setWeekStart((prev) => {
      const d = new Date(prev);
      d.setDate(d.getDate() + 7);
      return d;
    });
  };
  const goToCurrentWeek = () => setWeekStart(getWeekStart(new Date()));

  const fetchTrainings = async () => {
    if (!currentOrganization || !user) {
      setLoading(false);
      setRefreshing(false);
      return;
    }
    try {
      const data = await api.getTrainings({
        organizationId: currentOrganization.id,
        memberId: user.id,
      });
      setTrainings(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to fetch trainings:', error);
      Alert.alert(t('Schedule.failedToLoad', 'Failed to load trainings'));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      fetchTrainings();
    }, [currentOrganization?.id, user?.id])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchTrainings();
  };

  const handleStatusChange = (training: Training) => {
    setSelectedTraining(training);
  };

  const updateStatus = async (trainingId: string, status: string) => {
    setSelectedTraining(null);
    try {
      await api.updateTrainingStatus(trainingId, status);
      fetchTrainings();
    } catch (error) {
      console.error('Failed to update status:', error);
      Alert.alert(t('Organizations.error', 'Error'), t('Schedule.failedToUpdateStatus', 'Failed to update training status'));
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return '#22C55E';
      case 'MISSED':
        return '#EF4444';
      default:
        return theme.primary;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return t('Schedule.statusCompleted', 'Completed');
      case 'MISSED':
        return t('Schedule.statusMissed', 'Missed');
      default:
        return t('Schedule.statusTodo', 'To Do');
    }
  };

  const getTypeLabel = (type: string) => {
    return type === 'RUNNING'
      ? t('Schedule.running', 'Running')
      : t('Schedule.strength', 'Strength');
  };

  const dayKeys = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'] as const;
  const dayDefaults = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  // Parse "YYYY-MM-DDT00:00:00.000Z" as local date to avoid timezone shift
  const parseLocalDate = (iso: string) => {
    const parts = iso.split('T')[0]?.split('-').map(Number);
    if (!parts || parts.length < 3) return new Date(iso);
    return new Date(parts[0]!, parts[1]! - 1, parts[2]!);
  };

  const formatDate = (dateString: string) => {
    const date = parseLocalDate(dateString);
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    let dayLabel: string;
    if (date.getTime() === today.getTime()) {
      dayLabel = t('Dashboard.today', 'Today');
    } else if (date.getTime() === tomorrow.getTime()) {
      dayLabel = t('Dashboard.tomorrow', 'Tomorrow');
    } else {
      const dayIdx = date.getDay();
      dayLabel = t(`Dashboard.days.${dayKeys[dayIdx]}`, dayDefaults[dayIdx] ?? '');
    }

    const dateLabel = date.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
    });

    return `${dayLabel} · ${dateLabel}`;
  };

  // Filter trainings for the selected week, then group by date
  const weekTrainings = trainings.filter((training) => {
    const d = parseLocalDate(training.scheduledDate);
    return d >= weekStart && d <= weekEnd;
  });

  const groupedTrainings = weekTrainings.reduce<Record<string, Training[]>>((groups, training) => {
    const date = parseLocalDate(training.scheduledDate).toDateString();
    if (!groups[date]) groups[date] = [];
    groups[date].push(training);
    return groups;
  }, {});

  const sortedDates = Object.keys(groupedTrainings).sort(
    (a, b) => new Date(a).getTime() - new Date(b).getTime()
  );

  const formatWeekRange = () => {
    const startLabel = weekStart.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
    const end = new Date(weekEnd);
    const endLabel = end.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
    return `${startLabel} – ${endLabel}`;
  };

  if (loading && !refreshing) {
    return (
      <View style={[styles.centerContainer, { backgroundColor: `${theme.primary}08` }]}>
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  const weekNavigator = (
    <View style={[styles.weekNav, { backgroundColor: theme.card, borderColor: theme.border }]}>
      <TouchableOpacity onPress={goToPreviousWeek} hitSlop={8} style={styles.weekNavArrow}>
        <Ionicons name="chevron-back" size={22} color={theme.foreground} />
      </TouchableOpacity>
      <TouchableOpacity onPress={isCurrentWeek ? undefined : goToCurrentWeek} disabled={isCurrentWeek}>
        <Text style={[styles.weekNavLabel, { color: theme.foreground }]}>
          {formatWeekRange()}
        </Text>
        {!isCurrentWeek && (
          <Text style={[styles.weekNavToday, { color: theme.primary }]}>
            {t('Schedule.backToThisWeek', 'Back to this week')}
          </Text>
        )}
      </TouchableOpacity>
      <TouchableOpacity onPress={goToNextWeek} hitSlop={8} style={styles.weekNavArrow}>
        <Ionicons name="chevron-forward" size={22} color={theme.foreground} />
      </TouchableOpacity>
    </View>
  );

  if (weekTrainings.length === 0) {
    return (
      <View style={[styles.container, { backgroundColor: `${theme.primary}08` }]}>
        <FlatList
          data={[]}
          renderItem={() => null}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={theme.primary}
              colors={[theme.primary]}
            />
          }
          ListHeaderComponent={
            <View style={styles.content}>
              <View style={styles.header}>
                <Text style={[styles.title, { color: theme.foreground }]}>
                  {t('Schedule.title', 'Training Schedule')}
                </Text>
                <Text style={[styles.subtitle, { color: theme.mutedForeground }]}>
                  {t('Schedule.description', 'View your weekly training schedule')}
                </Text>
              </View>
              {weekNavigator}
              <Card style={{ borderTopWidth: 3, borderTopColor: theme.primary, marginTop: 16 }}>
                <CardContent style={styles.emptyState}>
                  <View style={{ width: 72, height: 72, borderRadius: 36, backgroundColor: `${theme.primary}15`, alignItems: 'center', justifyContent: 'center', marginBottom: 8 }}>
                    <Ionicons name="calendar-outline" size={36} color={theme.primary} />
                  </View>
                  <Text style={[styles.emptyStateTitle, { color: theme.foreground }]}>
                    {t('Schedule.noTrainingsThisWeek', 'No trainings this week')}
                  </Text>
                  <Text style={[styles.emptyStateDescription, { color: theme.mutedForeground }]}>
                    {t('Schedule.noTrainingsThisWeekDescription', 'Try checking another week or pull to refresh')}
                  </Text>
                </CardContent>
              </Card>
            </View>
          }
        />
      </View>
    );
  }

  const sections = sortedDates.map((date) => ({
    date,
    data: groupedTrainings[date],
  }));

  return (
    <View style={[styles.container, { backgroundColor: `${theme.primary}08` }]}>
      <FlatList
        data={sections}
        keyExtractor={(item) => item.date}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={theme.primary}
            colors={[theme.primary]}
          />
        }
        ListHeaderComponent={
          <View style={styles.listHeader}>
            <Text style={[styles.title, { color: theme.foreground }]}>
              {t('Schedule.title', 'Training Schedule')}
            </Text>
            <Text style={[styles.subtitle, { color: theme.mutedForeground }]}>
              {t('Schedule.description', 'View your weekly training schedule')}
            </Text>
            <View style={{ marginTop: 16 }}>
              {weekNavigator}
            </View>
          </View>
        }
        contentContainerStyle={styles.listContent}
        renderItem={({ item: section }) => (
          <View style={styles.section}>
            <Text style={[styles.sectionHeader, { color: theme.mutedForeground }]}>
              {formatDate(section.date)}
            </Text>
            {(section.data ?? []).map((training) => (
              <TouchableOpacity
                key={training.id}
                onPress={() => handleStatusChange(training)}
                activeOpacity={0.7}
              >
                <Card style={{ marginBottom: 12, borderLeftWidth: 4, borderLeftColor: getStatusColor(training.status) }}>
                  <CardContent style={styles.trainingCard}>
                    {/* Type + Status row */}
                    <View style={styles.trainingTopRow}>
                      <View style={[styles.typeBadge, { backgroundColor: `${theme.primary}12` }]}>
                        <Ionicons
                          name={training.type === 'RUNNING' ? 'walk-outline' : 'barbell-outline'}
                          size={15}
                          color={theme.primary}
                        />
                        <Text style={[styles.typeText, { color: theme.primary }]}>
                          {getTypeLabel(training.type)}
                        </Text>
                      </View>
                      <Badge
                        variant={training.status === 'COMPLETED' ? 'default' : training.status === 'MISSED' ? 'destructive' : 'secondary'}
                      >
                        {getStatusLabel(training.status)}
                      </Badge>
                    </View>

                    {/* Title */}
                    <Text style={[styles.trainingTitle, { color: theme.foreground }]}>
                      {training.title}
                    </Text>

                    {/* Subtitle */}
                    {training.subtitle && (
                      <Text style={[styles.trainingSubtitle, { color: theme.mutedForeground }]}>
                        {training.subtitle}
                      </Text>
                    )}

                    {/* Description - the main content, shown prominently */}
                    {training.description ? (
                      <View style={[styles.descriptionBox, { backgroundColor: '#FFFFFF', borderColor: `${theme.primary}20` }]}>
                        <Markdown style={markdownStyles(theme)}>
                          {training.description}
                        </Markdown>
                      </View>
                    ) : null}
                  </CardContent>
                </Card>
              </TouchableOpacity>
            ))}
          </View>
        )}
      />

      {/* Status change bottom sheet */}
      <Modal
        visible={!!selectedTraining}
        transparent
        animationType="slide"
        onRequestClose={() => setSelectedTraining(null)}
      >
        <Pressable
          style={styles.modalBackdrop}
          onPress={() => setSelectedTraining(null)}
        >
          <Pressable style={[styles.modalSheet, { backgroundColor: theme.card }]}>
            <View style={[styles.modalHandle, { backgroundColor: theme.mutedForeground }]} />
            <Text style={[styles.modalTitle, { color: theme.foreground }]} numberOfLines={1}>
              {selectedTraining?.title}
            </Text>

            {selectedTraining?.status !== 'COMPLETED' && (
              <TouchableOpacity
                style={[styles.modalOption, { backgroundColor: '#22C55E15' }]}
                onPress={() => selectedTraining && updateStatus(selectedTraining.id, 'COMPLETED')}
              >
                <Ionicons name="checkmark-circle" size={22} color="#22C55E" />
                <Text style={[styles.modalOptionText, { color: '#22C55E' }]}>
                  {t('Schedule.markAsDone', 'Mark as Done')}
                </Text>
              </TouchableOpacity>
            )}

            {selectedTraining?.status !== 'MISSED' && (
              <TouchableOpacity
                style={[styles.modalOption, { backgroundColor: '#EF444415' }]}
                onPress={() => selectedTraining && updateStatus(selectedTraining.id, 'MISSED')}
              >
                <Ionicons name="close-circle" size={22} color="#EF4444" />
                <Text style={[styles.modalOptionText, { color: '#EF4444' }]}>
                  {t('Schedule.markAsMissed', 'Mark as Missed')}
                </Text>
              </TouchableOpacity>
            )}

            {selectedTraining?.status !== 'TODO' && (
              <TouchableOpacity
                style={[styles.modalOption, { backgroundColor: `${theme.primary}12` }]}
                onPress={() => selectedTraining && updateStatus(selectedTraining.id, 'TODO')}
              >
                <Ionicons name="time" size={22} color={theme.primary} />
                <Text style={[styles.modalOptionText, { color: theme.primary }]}>
                  {t('Schedule.markAsTodo', 'Mark as To Do')}
                </Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={styles.modalCancel}
              onPress={() => setSelectedTraining(null)}
            >
              <Text style={[styles.modalCancelText, { color: theme.mutedForeground }]}>
                {t('Athletes.cancel', 'Cancel')}
              </Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

const markdownStyles = (theme: any) => ({
  body: { color: theme.foreground, fontSize: 15, lineHeight: 23 },
  heading1: { fontSize: 20, fontWeight: 'bold' as const, marginBottom: 8, color: theme.foreground },
  heading2: { fontSize: 18, fontWeight: 'bold' as const, marginBottom: 6, color: theme.foreground },
  heading3: { fontSize: 16, fontWeight: '600' as const, marginBottom: 4, color: theme.foreground },
  paragraph: { marginBottom: 8, marginTop: 0 },
  strong: { fontWeight: 'bold' as const },
  em: { fontStyle: 'italic' as const },
  bullet_list: { marginBottom: 8 },
  ordered_list: { marginBottom: 8 },
  list_item: { marginBottom: 4 },
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    padding: 16,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  listHeader: {
    marginBottom: 16,
    paddingTop: 8,
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
  // Week navigator
  weekNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 4,
    borderRadius: 12,
    borderWidth: 1,
  },
  weekNavArrow: {
    padding: 8,
  },
  weekNavLabel: {
    fontSize: 15,
    fontWeight: '600',
    textAlign: 'center',
  },
  weekNavToday: {
    fontSize: 12,
    fontWeight: '500',
    textAlign: 'center',
    marginTop: 2,
  },

  section: {
    marginBottom: 20,
  },
  sectionHeader: {
    fontSize: 14,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 10,
    marginLeft: 4,
  },

  // Training card
  trainingCard: {
    paddingVertical: 4,
  },
  trainingTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  typeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  typeText: {
    fontSize: 13,
    fontWeight: '600',
  },
  trainingTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  trainingSubtitle: {
    fontSize: 15,
    marginBottom: 4,
  },
  descriptionBox: {
    marginTop: 10,
    padding: 14,
    borderRadius: 10,
    borderWidth: 1,
  },
  descriptionText: {
    fontSize: 15,
    lineHeight: 23,
  },

  // Empty state
  emptyState: {
    alignItems: 'center',
    paddingVertical: 48,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateDescription: {
    fontSize: 14,
    textAlign: 'center',
  },

  // Bottom sheet modal
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 20,
    paddingBottom: 36,
    paddingTop: 12,
  },
  modalHandle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 16,
    opacity: 0.3,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  modalOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  modalOptionText: {
    fontSize: 16,
    fontWeight: '600',
  },
  modalCancel: {
    alignItems: 'center',
    paddingVertical: 14,
    marginTop: 4,
  },
  modalCancelText: {
    fontSize: 16,
  },
});
