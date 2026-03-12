import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../contexts/ThemeContext';
import { defaultTheme } from '../lib/theme';
import { Button } from '../components/ui/Button';
import { Card, CardHeader, CardTitle, CardDescription } from '../components/ui/Card';
import { Ionicons } from '@expo/vector-icons';

export function HomeScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const { theme } = useTheme();

  const features = [
    {
      icon: 'calendar-outline',
      title: t('Features.planBuilder.title', 'Training Plan Builder'),
      description: t('Features.planBuilder.description', 'Create customized training plans'),
    },
    {
      icon: 'send-outline',
      title: t('Features.scheduleDelivery.title', 'Schedule Delivery'),
      description: t('Features.scheduleDelivery.description', 'Deliver plans on schedule'),
    },
    {
      icon: 'trending-up-outline',
      title: t('Features.progressTracking.title', 'Progress Tracking'),
      description: t('Features.progressTracking.description', 'Track athlete progress'),
    },
    {
      icon: 'barbell-outline',
      title: t('Features.runningStrength.title', 'Running & Strength'),
      description: t('Features.runningStrength.description', 'Combine running and strength'),
    },
    {
      icon: 'people-outline',
      title: t('Features.athleteManagement.title', 'Athlete Management'),
      description: t('Features.athleteManagement.description', 'Manage your athletes'),
    },
    {
      icon: 'document-text-outline',
      title: t('Features.templateLibrary.title', 'Template Library'),
      description: t('Features.templateLibrary.description', 'Pre-built templates'),
    },
  ];

  return (
    <ScrollView style={{ flex: 1, backgroundColor: theme.background }}>
      {/* Hero Section */}
      <LinearGradient
        colors={[theme.primary, theme.secondary !== defaultTheme.secondary ? theme.secondary : theme.primary + 'CC']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.heroSection}
      >
        <View style={styles.heroContent}>
          <Text style={styles.heroTitle}>RunFlow</Text>
          <Text style={styles.heroSubtitle}>
            {t('Hero.title', 'Empower Your')} {t('Hero.titleHighlight', 'Running Journey')}
          </Text>
          <Text style={styles.heroDescription}>
            {t('Hero.description', 'Complete platform for trainers and athletes')}
          </Text>
          <View style={styles.heroButtons}>
            <Button
              onPress={() => navigation.navigate('Register' as never)}
              size="lg"
              style={{ marginBottom: 12 }}
            >
              {t('Navigation.getStarted', 'Get Started')}
            </Button>
            <Button
              onPress={() => navigation.navigate('Login' as never)}
              variant="outline"
              size="lg"
              style={{ backgroundColor: 'rgba(255,255,255,0.2)', borderColor: 'white' }}
              textStyle={{ color: 'white' }}
            >
              {t('Navigation.signIn', 'Sign In')}
            </Button>
          </View>
        </View>
      </LinearGradient>

      {/* Features Section */}
      <View style={[styles.section, { backgroundColor: theme.background }]}>
        <Text style={[styles.sectionTitle, { color: theme.foreground }]}>
          {t('Features.title', 'Everything You Need')}
        </Text>
        <Text style={[styles.sectionSubtitle, { color: theme.mutedForeground }]}>
          {t('Features.subtitle', 'Powerful tools for training success')}
        </Text>

        <View style={styles.featuresGrid}>
          {features.map((feature, index) => {
            const isSecondary = index % 2 === 1 && theme.secondary !== defaultTheme.secondary;
            const accentColor = isSecondary ? theme.secondary : theme.primary;
            return (
            <Card key={index} style={styles.featureCard}>
              <View
                style={[
                  styles.featureIconContainer,
                  { backgroundColor: `${accentColor}20` },
                ]}
              >
                <Ionicons
                  name={feature.icon as any}
                  size={24}
                  color={accentColor}
                />
              </View>
              <CardHeader>
                <CardTitle style={styles.featureTitle}>{feature.title}</CardTitle>
                <CardDescription>{feature.description}</CardDescription>
              </CardHeader>
            </Card>
            );
          })}
        </View>
      </View>

      {/* Footer */}
      <View style={[styles.footer, { borderTopColor: theme.border }]}>
        <Text style={[styles.footerText, { color: theme.mutedForeground }]}>
          {t('Footer.copyright', '© 2025 RunFlow. All rights reserved.')}
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  heroSection: {
    paddingVertical: 64,
    paddingHorizontal: 24,
  },
  heroContent: {
    alignItems: 'center',
  },
  heroTitle: {
    fontSize: 48,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 16,
  },
  heroSubtitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    marginBottom: 16,
  },
  heroDescription: {
    fontSize: 18,
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
    marginBottom: 32,
    paddingHorizontal: 20,
  },
  heroButtons: {
    width: '100%',
    maxWidth: 400,
  },
  section: {
    paddingVertical: 48,
    paddingHorizontal: 24,
  },
  sectionTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 32,
  },
  featuresGrid: {
    gap: 16,
  },
  featureCard: {
    marginBottom: 16,
  },
  featureIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  featureTitle: {
    fontSize: 18,
  },
  footer: {
    paddingVertical: 24,
    paddingHorizontal: 24,
    borderTopWidth: 1,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
  },
});
