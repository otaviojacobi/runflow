import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../contexts/ThemeContext';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Badge } from '../components/ui/Badge';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../lib/supabase';
import Constants from 'expo-constants';

const API_URL = Constants.expoConfig?.extra?.apiUrl || process.env.EXPO_PUBLIC_API_URL || 'https://www.runflow.club';

interface Athlete {
  id: string;
  userId: string;
  name: string;
  email: string;
  status: 'active' | 'inactive';
  joinedAt: Date;
  lastActivity: Date;
  sessionsCompleted: number;
}

interface AthleteItemProps {
  athlete: Athlete;
  onPress: (athlete: Athlete) => void;
  theme: any;
}

function AthleteItem({ athlete, onPress, theme }: AthleteItemProps) {
  const { t } = useTranslation();

  return (
    <TouchableOpacity
      onPress={() => onPress(athlete)}
      activeOpacity={0.7}
      style={[styles.athleteItem, { backgroundColor: theme.card, borderColor: theme.border }]}
    >
      <View style={styles.athleteHeader}>
        <View style={[styles.athleteAvatar, { backgroundColor: `${theme.primary}20` }]}>
          <Text style={[styles.athleteAvatarText, { color: theme.primary }]}>
            {athlete.name.charAt(0).toUpperCase()}
          </Text>
        </View>
        <View style={styles.athleteInfo}>
          <Text style={[styles.athleteName, { color: theme.foreground }]}>{athlete.name}</Text>
          <Text style={[styles.athleteEmail, { color: theme.mutedForeground }]}>{athlete.email}</Text>
        </View>
        <Badge variant={athlete.status === 'active' ? 'default' : 'secondary'}>
          {t(`Athletes.status.${athlete.status}`, athlete.status)}
        </Badge>
      </View>

      <View style={[styles.athleteStats, { borderTopColor: theme.border }]}>
        <View style={styles.statItem}>
          <Ionicons name="calendar-outline" size={16} color={theme.mutedForeground} />
          <Text style={[styles.statLabel, { color: theme.mutedForeground }]}>
            {t('Athletes.table.lastActivity', 'Last Activity')}
          </Text>
          <Text style={[styles.statValue, { color: theme.foreground }]}>
            {athlete.lastActivity.toLocaleDateString()}
          </Text>
        </View>
        <View style={styles.statItem}>
          <Ionicons name="fitness-outline" size={16} color={theme.mutedForeground} />
          <Text style={[styles.statLabel, { color: theme.mutedForeground }]}>
            {t('Athletes.table.sessions', 'Sessions')}
          </Text>
          <Text style={[styles.statValue, { color: theme.foreground }]}>
            {athlete.sessionsCompleted}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

export function AthletesScreen() {
  const navigation = useNavigation();
  const { t } = useTranslation();
  const { theme } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [athletes, setAthletes] = useState<Athlete[]>([]);
  const [loadingAthletes, setLoadingAthletes] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [currentOrganization, setCurrentOrganization] = useState<any>(null);

  // Load current organization
  useEffect(() => {
    loadCurrentOrganization();
  }, []);

  const loadCurrentOrganization = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigation.navigate('Login' as never);
        return;
      }

      // For now, we'll use a mock organization until the OrganizationContext is implemented
      // TODO: Replace with actual organization context
      setCurrentOrganization({ id: 'mock-org-id', name: 'My Team' });
    } catch (error) {
      console.error('Failed to load organization:', error);
    }
  };

  // Fetch athletes when organization is available
  useEffect(() => {
    if (currentOrganization) {
      fetchAthletes();
    }
  }, [currentOrganization?.id]);

  const fetchAthletes = async () => {
    if (!currentOrganization) return;

    setLoadingAthletes(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigation.navigate('Login' as never);
        return;
      }

      const response = await fetch(
        `${API_URL}/api/organizations/${currentOrganization.id}/members`,
        {
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        // Filter only athletes and transform data
        const athletesData = (data.members || [])
          .filter((member: any) => member.role === 'ATHLETE')
          .map((member: any) => ({
            id: member.id,
            userId: member.userId,
            name: member.user?.name || member.user?.email?.split('@')[0] || 'Unknown',
            email: member.user?.email,
            status: 'active', // Mock - will be replaced later
            joinedAt: new Date(member.joinedAt),
            lastActivity: new Date(), // Mock - will be replaced later
            sessionsCompleted: Math.floor(Math.random() * 50), // Mock - will be replaced later
          }));
        setAthletes(athletesData);
      } else {
        Alert.alert(
          t('Athletes.error', 'Error'),
          t('Athletes.failedToLoadAthletes', 'Failed to load athletes')
        );
      }
    } catch (error) {
      console.error('Failed to fetch athletes:', error);
      Alert.alert(
        t('Athletes.error', 'Error'),
        t('Athletes.failedToLoadAthletes', 'Failed to load athletes')
      );
    } finally {
      setLoadingAthletes(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchAthletes();
  };

  const handleAthletePress = (athlete: Athlete) => {
    Alert.alert(
      athlete.name,
      t('Athletes.selectAction', 'Select an action'),
      [
        {
          text: t('Athletes.actions.viewProfile', 'View Profile'),
          onPress: () => {
            // TODO: Navigate to athlete profile
            Alert.alert(t('Athletes.comingSoon', 'Coming Soon'), t('Athletes.featureComingSoon', 'This feature is coming soon'));
          },
        },
        {
          text: t('Athletes.actions.viewProgress', 'View Progress'),
          onPress: () => {
            // TODO: Navigate to athlete progress
            Alert.alert(t('Athletes.comingSoon', 'Coming Soon'), t('Athletes.featureComingSoon', 'This feature is coming soon'));
          },
        },
        {
          text: t('Athletes.actions.sendMessage', 'Send Message'),
          onPress: () => {
            // TODO: Open message composer
            Alert.alert(t('Athletes.comingSoon', 'Coming Soon'), t('Athletes.featureComingSoon', 'This feature is coming soon'));
          },
        },
        {
          text: t('Athletes.actions.remove', 'Remove'),
          onPress: () => confirmRemoveAthlete(athlete),
          style: 'destructive',
        },
        {
          text: t('Athletes.cancel', 'Cancel'),
          style: 'cancel',
        },
      ]
    );
  };

  const confirmRemoveAthlete = (athlete: Athlete) => {
    Alert.alert(
      t('Athletes.confirmRemoveAthlete', 'Remove Athlete'),
      t('Athletes.confirmRemoveAthleteDescription', {
        name: athlete.name,
        defaultValue: `Are you sure you want to remove ${athlete.name} from your team?`,
      }),
      [
        {
          text: t('Athletes.cancel', 'Cancel'),
          style: 'cancel',
        },
        {
          text: t('Athletes.actions.remove', 'Remove'),
          onPress: () => removeAthlete(athlete),
          style: 'destructive',
        },
      ]
    );
  };

  const removeAthlete = async (athlete: Athlete) => {
    if (!currentOrganization) return;

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigation.navigate('Login' as never);
        return;
      }

      const response = await fetch(
        `${API_URL}/api/organizations/${currentOrganization.id}/members/${athlete.userId}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.ok) {
        Alert.alert(
          t('Athletes.success', 'Success'),
          t('Athletes.memberRemoved', 'Athlete removed successfully')
        );
        fetchAthletes();
      } else {
        Alert.alert(
          t('Athletes.error', 'Error'),
          t('Athletes.failedToRemoveMember', 'Failed to remove athlete')
        );
      }
    } catch (error) {
      console.error('Failed to remove athlete:', error);
      Alert.alert(
        t('Athletes.error', 'Error'),
        t('Athletes.failedToRemoveMember', 'Failed to remove athlete')
      );
    }
  };

  const filteredAthletes = athletes.filter(
    (athlete) =>
      athlete.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      athlete.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleInviteAthlete = () => {
    // TODO: Navigate to invite athlete screen
    Alert.alert(
      t('Athletes.comingSoon', 'Coming Soon'),
      t('Athletes.inviteFeatureComingSoon', 'Athlete invitation feature is coming soon')
    );
  };

  // No organization selected state
  if (!currentOrganization) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <View style={styles.emptyStateContainer}>
          <Card style={styles.emptyStateCard}>
            <CardContent style={styles.emptyStateContent}>
              <Ionicons name="people-outline" size={64} color={theme.mutedForeground} />
              <Text style={[styles.emptyStateTitle, { color: theme.foreground }]}>
                {t('Athletes.noOrganizationSelected', 'No Organization Selected')}
              </Text>
              <Text style={[styles.emptyStateDescription, { color: theme.mutedForeground }]}>
                {t('Athletes.createOrJoinPrompt', 'Create or join an organization to manage athletes')}
              </Text>
              <Button
                onPress={() => {
                  // TODO: Navigate to organization setup
                  Alert.alert(
                    t('Athletes.comingSoon', 'Coming Soon'),
                    t('Athletes.orgSetupComingSoon', 'Organization setup is coming soon')
                  );
                }}
                style={styles.emptyStateButton}
              >
                {t('Athletes.getStarted', 'Get Started')}
              </Button>
            </CardContent>
          </Card>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={[styles.title, { color: theme.foreground }]}>
            {t('Athletes.title', 'Athletes')}
          </Text>
          <Text style={[styles.subtitle, { color: theme.mutedForeground }]}>
            {t('Athletes.description', 'Manage and track your team members')}
          </Text>
        </View>
        <Button onPress={handleInviteAthlete} size="sm">
          <View style={styles.inviteButtonContent}>
            <Ionicons name="person-add-outline" size={16} color={theme.primaryForeground} />
            <Text style={[styles.inviteButtonText, { color: theme.primaryForeground }]}>
              {t('Athletes.inviteAthlete', 'Invite')}
            </Text>
          </View>
        </Button>
      </View>

      {/* Search Card */}
      <Card style={styles.searchCard}>
        <CardHeader>
          <CardTitle>{t('Athletes.allAthletes', 'All Athletes')}</CardTitle>
          <CardDescription>
            {t('Athletes.athleteCount', {
              count: filteredAthletes.length,
              defaultValue: `${filteredAthletes.length} athlete(s)`,
            })}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <View style={styles.searchContainer}>
            <Ionicons
              name="search-outline"
              size={20}
              color={theme.mutedForeground}
              style={styles.searchIcon}
            />
            <Input
              placeholder={t('Athletes.searchPlaceholder', 'Search athletes...')}
              value={searchQuery}
              onChangeText={setSearchQuery}
              style={styles.searchInput}
              containerStyle={styles.searchInputContainer}
            />
          </View>
        </CardContent>
      </Card>

      {/* Athletes List */}
      {loadingAthletes && !refreshing ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.primary} />
          <Text style={[styles.loadingText, { color: theme.mutedForeground }]}>
            {t('Athletes.loading', 'Loading athletes...')}
          </Text>
        </View>
      ) : filteredAthletes.length === 0 ? (
        <View style={styles.emptyListContainer}>
          <Card style={styles.emptyListCard}>
            <CardContent style={styles.emptyStateContent}>
              <Ionicons name="people-outline" size={64} color={theme.mutedForeground} />
              <Text style={[styles.emptyStateTitle, { color: theme.foreground }]}>
                {searchQuery
                  ? t('Athletes.noSearchResults', 'No athletes found')
                  : t('Athletes.noAthletes', 'No athletes yet')}
              </Text>
              <Text style={[styles.emptyStateDescription, { color: theme.mutedForeground }]}>
                {searchQuery
                  ? t('Athletes.tryDifferentSearch', 'Try a different search term')
                  : t('Athletes.noAthletesDescription', 'Invite athletes to get started')}
              </Text>
              {!searchQuery && (
                <Button onPress={handleInviteAthlete} style={styles.emptyStateButton}>
                  <View style={styles.inviteButtonContent}>
                    <Ionicons name="person-add-outline" size={16} color={theme.primaryForeground} />
                    <Text style={[styles.inviteButtonText, { color: theme.primaryForeground }]}>
                      {t('Athletes.inviteAthlete', 'Invite Athlete')}
                    </Text>
                  </View>
                </Button>
              )}
            </CardContent>
          </Card>
        </View>
      ) : (
        <FlatList
          data={filteredAthletes}
          renderItem={({ item }) => (
            <AthleteItem athlete={item} onPress={handleAthletePress} theme={theme} />
          )}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={theme.primary}
              colors={[theme.primary]}
            />
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
  },
  headerContent: {
    flex: 1,
    marginRight: 12,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
  },
  searchCard: {
    marginHorizontal: 16,
    marginBottom: 16,
  },
  searchContainer: {
    position: 'relative',
  },
  searchIcon: {
    position: 'absolute',
    left: 12,
    top: 14,
    zIndex: 1,
  },
  searchInputContainer: {
    marginBottom: 0,
  },
  searchInput: {
    paddingLeft: 40,
  },
  inviteButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  inviteButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 48,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
  },
  emptyStateContainer: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  emptyListContainer: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  emptyStateCard: {
    padding: 16,
  },
  emptyListCard: {
    padding: 16,
  },
  emptyStateContent: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyStateDescription: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 24,
  },
  emptyStateButton: {
    minWidth: 200,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  athleteItem: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  athleteHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  athleteAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  athleteAvatarText: {
    fontSize: 20,
    fontWeight: '600',
  },
  athleteInfo: {
    flex: 1,
  },
  athleteName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  athleteEmail: {
    fontSize: 14,
  },
  athleteStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    borderTopWidth: 1,
    paddingTop: 12,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 12,
    marginTop: 4,
    marginBottom: 2,
  },
  statValue: {
    fontSize: 16,
    fontWeight: '600',
  },
});
