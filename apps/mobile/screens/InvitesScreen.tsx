import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../contexts/ThemeContext';
import { useOrganization } from '../contexts/OrganizationContext';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Ionicons } from '@expo/vector-icons';

export function InvitesScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const { theme } = useTheme();
  const {
    pendingInvites,
    loading,
    refreshOrganizations,
    acceptInvite,
    declineInvite,
  } = useOrganization();

  const [refreshing, setRefreshing] = useState(false);
  const [loadingStates, setLoadingStates] = useState<{ [key: string]: boolean }>({});

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await refreshOrganizations();
    } finally {
      setRefreshing(false);
    }
  };

  const handleAccept = async (token: string, inviteId: string) => {
    setLoadingStates(prev => ({ ...prev, [inviteId]: true }));
    try {
      await acceptInvite(token);

      Alert.alert(
        t('organizations.success', 'Success'),
        t('organizations.inviteAccepted', 'Invitation accepted successfully')
      );

      // If this was the last invite, navigate to dashboard
      if (pendingInvites.length === 1) {
        navigation.navigate('Dashboard' as never);
      }
    } catch (error) {
      console.error('Failed to accept invite:', error);
      Alert.alert(
        t('errors.acceptFailed', 'Error'),
        t('errors.acceptInviteFailed', 'Failed to accept invitation')
      );
    } finally {
      setLoadingStates(prev => ({ ...prev, [inviteId]: false }));
    }
  };

  const handleDecline = async (inviteId: string) => {
    setLoadingStates(prev => ({ ...prev, [`decline-${inviteId}`]: true }));
    try {
      await declineInvite(inviteId);

      Alert.alert(
        t('organizations.declined', 'Declined'),
        t('organizations.inviteDeclined', 'Invitation declined')
      );

      // If this was the last invite, navigate to dashboard or organization setup
      if (pendingInvites.length === 1) {
        navigation.navigate('Dashboard' as never);
      }
    } catch (error) {
      console.error('Failed to decline invite:', error);
      Alert.alert(
        t('errors.declineFailed', 'Error'),
        t('errors.declineInviteFailed', 'Failed to decline invitation')
      );
    } finally {
      setLoadingStates(prev => ({ ...prev, [`decline-${inviteId}`]: false }));
    }
  };

  const handleSkip = () => {
    navigation.navigate('Dashboard' as never);
  };

  const getRoleBadgeVariant = (role: string): 'default' | 'secondary' | 'destructive' | 'outline' => {
    switch (role) {
      case 'OWNER':
        return 'destructive';
      case 'TRAINER':
        return 'default';
      case 'ATHLETE':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  const formatTimeAgo = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((date.getTime() - now.getTime()) / 1000);

    if (diffInSeconds < 0) {
      return t('organizations.expired', 'Expired');
    }

    const diffInMinutes = Math.floor(diffInSeconds / 60);
    const diffInHours = Math.floor(diffInMinutes / 60);
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInDays > 0) {
      return t('organizations.inDays', { count: diffInDays, defaultValue: `in ${diffInDays} day(s)` });
    } else if (diffInHours > 0) {
      return t('organizations.inHours', { count: diffInHours, defaultValue: `in ${diffInHours} hour(s)` });
    } else if (diffInMinutes > 0) {
      return t('organizations.inMinutes', { count: diffInMinutes, defaultValue: `in ${diffInMinutes} minute(s)` });
    } else {
      return t('organizations.soon', 'soon');
    }
  };

  if (loading) {
    return (
      <View style={[styles.centerContainer, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={theme.primary} />
        <Text style={[styles.loadingText, { color: theme.mutedForeground }]}>
          {t('organizations.loadingInvites', 'Loading invitations...')}
        </Text>
      </View>
    );
  }

  if (pendingInvites.length === 0) {
    return (
      <ScrollView
        style={[styles.container, { backgroundColor: theme.background }]}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.primary} />
        }
      >
        <View style={styles.content}>
          <Card style={{ backgroundColor: theme.card }}>
            <CardHeader>
              <CardTitle>{t('organizations.noPendingInvites', 'No Pending Invitations')}</CardTitle>
              <CardDescription>
                {t('organizations.noPendingInvitesDescription', "You don't have any pending invitations.")}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Text style={[styles.emptyText, { color: theme.mutedForeground }]}>
                {t('organizations.wouldYouLike', 'Would you like to create an organization or go to dashboard?')}
              </Text>
            </CardContent>
            <View style={styles.emptyActions}>
              <Button
                onPress={() => navigation.navigate('Organizations' as never)}
                style={{ marginBottom: 8 }}
              >
                {t('organizations.createOrganization', 'Create Organization')}
              </Button>
              <Button
                variant="outline"
                onPress={() => navigation.navigate('Dashboard' as never)}
              >
                {t('organizations.goToDashboard', 'Go to Dashboard')}
              </Button>
            </View>
          </Card>
        </View>
      </ScrollView>
    );
  }

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.background }]}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.primary} />
      }
    >
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: theme.foreground }]}>
            {t('organizations.pendingInvites', 'Pending Invitations')}
          </Text>
          <Text style={[styles.subtitle, { color: theme.mutedForeground }]}>
            {t('organizations.Invites.description', 'Review and accept or decline your pending invitations')}
          </Text>
        </View>

        {pendingInvites.map((invite) => (
          <Card key={invite.id} style={[styles.inviteCard, { backgroundColor: theme.card }]}>
            <CardHeader>
              <View style={styles.inviteHeader}>
                <View style={styles.orgInfo}>
                  <View style={[styles.orgAvatar, { backgroundColor: `${theme.primary}20` }]}>
                    <Ionicons name="business" size={24} color={theme.primary} />
                  </View>
                  <View style={styles.orgDetails}>
                    <CardTitle style={styles.orgName}>{invite.organization.name}</CardTitle>
                    {invite.organization.description && (
                      <CardDescription style={styles.orgDescription}>
                        {invite.organization.description}
                      </CardDescription>
                    )}
                  </View>
                </View>
                <Badge variant={getRoleBadgeVariant(invite.role)}>
                  {t(`organizations.role.${invite.role}`, invite.role)}
                </Badge>
              </View>
            </CardHeader>
            <CardContent>
              <View style={styles.inviteDetails}>
                <View style={styles.detailRow}>
                  <Ionicons name="person-add-outline" size={16} color={theme.mutedForeground} />
                  <Text style={[styles.detailText, { color: theme.mutedForeground }]}>
                    {t('organizations.invitedBy', 'Invited by')}{' '}
                    {invite.invitedBy.name || invite.invitedBy.email}
                  </Text>
                </View>
                <View style={styles.detailRow}>
                  <Ionicons name="time-outline" size={16} color={theme.mutedForeground} />
                  <Text style={[styles.detailText, { color: theme.mutedForeground }]}>
                    {t('organizations.expiresIn', 'Expires')}{' '}
                    {formatTimeAgo(invite.expiresAt)}
                  </Text>
                </View>
              </View>
            </CardContent>
            <View style={styles.inviteActions}>
              <Button
                onPress={() => handleAccept(invite.token, invite.id)}
                disabled={loadingStates[invite.id] || loadingStates[`decline-${invite.id}`]}
                loading={loadingStates[invite.id]}
                style={styles.actionButton}
              >
                {loadingStates[invite.id]
                  ? t('organizations.accepting', 'Accepting...')
                  : t('organizations.acceptInvite', 'Accept')}
              </Button>
              <Button
                variant="destructive"
                onPress={() => handleDecline(invite.id)}
                disabled={loadingStates[invite.id] || loadingStates[`decline-${invite.id}`]}
                loading={loadingStates[`decline-${invite.id}`]}
                style={styles.actionButton}
              >
                {loadingStates[`decline-${invite.id}`]
                  ? t('organizations.declining', 'Declining...')
                  : t('organizations.declineInvite', 'Decline')}
              </Button>
            </View>
          </Card>
        ))}

        <Card style={styles.skipCard}>
          <CardContent style={styles.skipContent}>
            <Button variant="outline" onPress={handleSkip}>
              {t('organizations.skipForNow', 'Skip for now')}
            </Button>
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
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
  },
  header: {
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
  },
  inviteCard: {
    marginBottom: 16,
  },
  inviteHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  orgInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 12,
  },
  orgAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  orgDetails: {
    flex: 1,
  },
  orgName: {
    fontSize: 18,
  },
  orgDescription: {
    fontSize: 14,
    marginTop: 4,
  },
  inviteDetails: {
    gap: 8,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailText: {
    fontSize: 14,
  },
  inviteActions: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  actionButton: {
    flex: 1,
  },
  skipCard: {
    marginTop: 8,
    marginBottom: 24,
  },
  skipContent: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  emptyText: {
    fontSize: 14,
    marginBottom: 16,
  },
  emptyActions: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
});
