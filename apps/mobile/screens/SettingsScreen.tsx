import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Switch,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../contexts/ThemeContext';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Ionicons } from '@expo/vector-icons';

export function SettingsScreen() {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const [notifications, setNotifications] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleSaveSettings = async () => {
    setSaving(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      Alert.alert(
        t('Settings.saveSuccess', 'Success'),
        t('Settings.settingsSaved', 'Settings saved successfully')
      );
    } catch (error) {
      Alert.alert(
        t('Settings.saveError', 'Error'),
        t('Settings.settingsSaveError', 'Failed to save settings')
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: theme.foreground }]}>
            {t('Settings.title', 'Settings')}
          </Text>
          <Text style={[styles.subtitle, { color: theme.mutedForeground }]}>
            {t('Settings.description', 'Manage your preferences')}
          </Text>
        </View>

        {/* Notifications */}
        <Card style={styles.card}>
          <CardHeader>
            <View style={styles.cardTitleRow}>
              <View style={[styles.cardIconContainer, { backgroundColor: `${theme.primary}20` }]}>
                <Ionicons name="notifications-outline" size={18} color={theme.primary} />
              </View>
              <CardTitle style={styles.cardTitleText}>
                {t('Settings.notifications.title', 'Notifications')}
              </CardTitle>
            </View>
            <CardDescription>
              {t('Settings.notifications.description', 'Manage notification preferences')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <View style={styles.settingRow}>
              <View style={styles.settingTextContainer}>
                <Text style={[styles.settingLabel, { color: theme.foreground }]}>
                  {t('Settings.notifications.push', 'Push Notifications')}
                </Text>
                <Text style={[styles.settingDescription, { color: theme.mutedForeground }]}>
                  {t('Settings.notifications.pushDescription', 'Receive push notifications')}
                </Text>
              </View>
              <Switch
                value={notifications}
                onValueChange={setNotifications}
                trackColor={{ false: theme.muted, true: theme.primary }}
                thumbColor={notifications ? theme.primaryForeground : theme.mutedForeground}
              />
            </View>

            <View style={[styles.settingRow, styles.settingRowLast]}>
              <View style={styles.settingTextContainer}>
                <Text style={[styles.settingLabel, { color: theme.foreground }]}>
                  {t('Settings.notifications.email', 'Email Notifications')}
                </Text>
                <Text style={[styles.settingDescription, { color: theme.mutedForeground }]}>
                  {t('Settings.notifications.emailDescription', 'Receive email notifications')}
                </Text>
              </View>
              <Switch
                value={emailNotifications}
                onValueChange={setEmailNotifications}
                trackColor={{ false: theme.muted, true: theme.primary }}
                thumbColor={emailNotifications ? theme.primaryForeground : theme.mutedForeground}
              />
            </View>
          </CardContent>
        </Card>

        {/* Language */}
        <Card style={styles.card}>
          <CardHeader>
            <View style={styles.cardTitleRow}>
              <View style={[styles.cardIconContainer, { backgroundColor: `${theme.secondary}30` }]}>
                <Ionicons name="globe-outline" size={18} color={theme.secondary !== '#F3F4F6' ? theme.secondary : theme.primary} />
              </View>
              <CardTitle style={styles.cardTitleText}>
                {t('Settings.language.title', 'Language')}
              </CardTitle>
            </View>
            <CardDescription>
              {t('Settings.language.description', 'Choose your preferred language')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <TouchableOpacity
              style={[styles.languageOption, { borderColor: theme.border }]}
              activeOpacity={0.7}
            >
              <Text style={[styles.languageText, { color: theme.foreground }]}>
                English
              </Text>
              <Ionicons name="checkmark" size={20} color={theme.primary} />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.languageOption, styles.languageOptionLast, { borderColor: theme.border }]}
              activeOpacity={0.7}
            >
              <Text style={[styles.languageText, { color: theme.foreground }]}>
                Português
              </Text>
            </TouchableOpacity>
          </CardContent>
        </Card>

        {/* Appearance */}
        <Card style={styles.card}>
          <CardHeader>
            <View style={styles.cardTitleRow}>
              <View style={[styles.cardIconContainer, { backgroundColor: `${theme.primary}20` }]}>
                <Ionicons name="moon-outline" size={18} color={theme.primary} />
              </View>
              <CardTitle style={styles.cardTitleText}>
                {t('Settings.appearance.title', 'Appearance')}
              </CardTitle>
            </View>
            <CardDescription>
              {t('Settings.appearance.description', 'Customize the app appearance')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <View style={styles.settingRow}>
              <View style={styles.settingTextContainer}>
                <Text style={[styles.settingLabel, { color: theme.foreground }]}>
                  {t('Settings.appearance.darkMode', 'Dark Mode')}
                </Text>
                <Text style={[styles.settingDescription, { color: theme.mutedForeground }]}>
                  {t('Settings.appearance.darkModeDescription', 'Switch to dark theme')}
                </Text>
              </View>
              <Switch
                value={darkMode}
                onValueChange={setDarkMode}
                disabled
                trackColor={{ false: theme.muted, true: theme.primary }}
                thumbColor={darkMode ? theme.primaryForeground : theme.mutedForeground}
              />
            </View>
            <Text style={[styles.comingSoonText, { color: theme.mutedForeground }]}>
              {t('Settings.appearance.comingSoon', 'Coming soon')}
            </Text>
          </CardContent>
        </Card>

        {/* Performance */}
        <Card style={styles.card}>
          <CardHeader>
            <View style={styles.cardTitleRow}>
              <View style={[styles.cardIconContainer, { backgroundColor: `${theme.secondary}30` }]}>
                <Ionicons name="flash-outline" size={18} color={theme.secondary !== '#F3F4F6' ? theme.secondary : theme.primary} />
              </View>
              <CardTitle style={styles.cardTitleText}>
                {t('Settings.performance.title', 'Performance')}
              </CardTitle>
            </View>
            <CardDescription>
              {t('Settings.performance.description', 'Optimize app performance')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Text style={[styles.settingLabel, { color: theme.foreground, marginBottom: 8 }]}>
              {t('Settings.performance.cacheLabel', 'Clear Cache')}
            </Text>
            <Text style={[styles.settingDescription, { color: theme.mutedForeground, marginBottom: 12 }]}>
              {t('Settings.performance.cacheDescription', 'Clear cached data')}
            </Text>
            <Button variant="outline" size="sm">
              {t('Settings.performance.clearCache', 'Clear Cache')}
            </Button>
          </CardContent>
        </Card>

        <View style={styles.saveButtonContainer}>
          <Button
            onPress={handleSaveSettings}
            loading={saving}
            disabled={saving}
            style={{ width: '100%' }}
          >
            {saving ? t('Settings.saving', 'Saving...') : t('Settings.saveChanges', 'Save Changes')}
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
  cardTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  cardIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTitleText: {
    fontSize: 18,
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
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 14,
  },
  languageOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  languageOptionLast: {
    borderBottomWidth: 0,
  },
  languageText: {
    fontSize: 16,
  },
  comingSoonText: {
    fontSize: 12,
    marginTop: 8,
  },
  saveButtonContainer: {
    marginTop: 8,
    marginBottom: 32,
  },
});
