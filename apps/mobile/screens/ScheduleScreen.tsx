import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../contexts/ThemeContext';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/Card';
import { Ionicons } from '@expo/vector-icons';

export function ScheduleScreen() {
  const { t } = useTranslation();
  const { theme } = useTheme();

  return (
    <ScrollView style={[styles.container, { backgroundColor: `${theme.primary}08` }]}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: theme.foreground }]}>
            {t('Schedule.title', 'Training Schedule')}
          </Text>
          <Text style={[styles.subtitle, { color: theme.mutedForeground }]}>
            {t('Schedule.description', 'View your weekly training schedule')}
          </Text>
        </View>

        <Card style={{ borderTopWidth: 3, borderTopColor: theme.primary }}>
          <CardContent style={styles.emptyState}>
            <View style={{ width: 72, height: 72, borderRadius: 36, backgroundColor: `${theme.primary}15`, alignItems: 'center', justifyContent: 'center', marginBottom: 8 }}>
              <Ionicons name="calendar-outline" size={36} color={theme.primary} />
            </View>
            <Text style={[styles.emptyStateTitle, { color: theme.foreground }]}>
              {t('Schedule.noSchedule', 'No training schedule yet')}
            </Text>
            <Text style={[styles.emptyStateDescription, { color: theme.mutedForeground }]}>
              {t('Schedule.noScheduleDescription', 'Your trainer will assign workouts to you soon')}
            </Text>
          </CardContent>
        </Card>
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
});
