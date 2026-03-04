import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  TextInput,
  Modal,
  Platform,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../contexts/ThemeContext';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Input } from '../components/ui/Input';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../lib/supabase';
import Constants from 'expo-constants';

const API_URL = Constants.expoConfig?.extra?.apiUrl || process.env.EXPO_PUBLIC_API_URL || 'https://www.runflow.club';

interface Organization {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  role?: string;
  joinedAt?: string;
}

interface Member {
  id: string;
  userId: string;
  role: string;
  joinedAt: string;
  user?: {
    id: string;
    email: string;
    name?: string | null;
  };
}

interface Invite {
  id: string;
  email: string;
  role: string;
  createdAt: string;
  expiresAt: string;
}

interface UserProfile {
  id: string;
  email: string;
  name?: string | null;
  currentOrganizationId?: string | null;
}

type TabType = 'all' | 'members' | 'invites';

export function OrganizationsScreen({ navigation }: any) {
  const { t } = useTranslation();
  const { theme } = useTheme();

  // State
  const [activeTab, setActiveTab] = useState<TabType>('all');
  const [currentOrganization, setCurrentOrganization] = useState<Organization | null>(null);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [invites, setInvites] = useState<Invite[]>([]);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingMembers, setLoadingMembers] = useState(false);
  const [loadingInvites, setLoadingInvites] = useState(false);
  const [editingOrg, setEditingOrg] = useState<string | null>(null);
  const [editFormData, setEditFormData] = useState({ name: '', description: '' });
  const [savingOrg, setSavingOrg] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<{ type: 'member' | 'invite'; id: string } | null>(null);

  // Current user role
  const currentUserRole = currentOrganization
    ? organizations.find(org => org.id === currentOrganization.id)?.role || 'ATHLETE'
    : null;

  // Fetch user data
  const fetchUserData = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigation.replace('Login');
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
        setOrganizations(data.organizations || []);
      }
    } catch (error) {
      console.error('Failed to fetch user data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch members
  const fetchMembers = async () => {
    if (!currentOrganization) return;
    setLoadingMembers(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const response = await fetch(`${API_URL}/api/organizations/${currentOrganization.id}/members`, {
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setMembers(data.members || []);
      } else {
        Alert.alert(t('Organizations.error', 'Error'), t('Organizations.failedToLoadMembers', 'Failed to load members'));
      }
    } catch (error) {
      console.error('Failed to fetch members:', error);
      Alert.alert(t('Organizations.error', 'Error'), t('Organizations.failedToLoadMembers', 'Failed to load members'));
    } finally {
      setLoadingMembers(false);
    }
  };

  // Fetch invites
  const fetchInvites = async () => {
    if (!currentOrganization) return;
    setLoadingInvites(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const response = await fetch(`${API_URL}/api/organizations/${currentOrganization.id}/invites`, {
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setInvites(Array.isArray(data) ? data : []);
      } else {
        Alert.alert(t('Organizations.error', 'Error'), t('Organizations.failedToLoadInvites', 'Failed to load invites'));
      }
    } catch (error) {
      console.error('Failed to fetch invites:', error);
      Alert.alert(t('Organizations.error', 'Error'), t('Organizations.failedToLoadInvites', 'Failed to load invites'));
    } finally {
      setLoadingInvites(false);
    }
  };

  // Load data on mount
  useEffect(() => {
    fetchUserData();
  }, []);

  // Load members and invites when viewing those tabs
  useEffect(() => {
    if (currentOrganization && (currentUserRole === 'OWNER' || currentUserRole === 'TRAINER')) {
      if (activeTab === 'members') {
        fetchMembers();
      } else if (activeTab === 'invites') {
        fetchInvites();
      }
    }
  }, [activeTab, currentOrganization?.id, currentUserRole]);

  // Handle edit organization
  const handleEditOrg = (org: Organization) => {
    setEditingOrg(org.id);
    setEditFormData({
      name: org.name,
      description: org.description || ''
    });
  };

  // Handle save organization
  const handleSaveOrg = async (orgId: string) => {
    setSavingOrg(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const response = await fetch(`${API_URL}/api/organizations/${orgId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify(editFormData)
      });

      if (response.ok) {
        setEditingOrg(null);
        Alert.alert(
          t('Organizations.success', 'Success'),
          t('Organizations.organizationUpdated', 'Organization updated successfully')
        );
        await fetchUserData();
      } else {
        Alert.alert(
          t('Organizations.error', 'Error'),
          t('Organizations.failedToUpdateOrganization', 'Failed to update organization')
        );
      }
    } catch (error) {
      console.error('Failed to update organization:', error);
      Alert.alert(
        t('Organizations.error', 'Error'),
        t('Organizations.failedToUpdateOrganization', 'Failed to update organization')
      );
    } finally {
      setSavingOrg(false);
    }
  };

  // Handle remove member
  const handleRemoveMember = async (userId: string) => {
    if (!currentOrganization) return;
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const response = await fetch(`${API_URL}/api/organizations/${currentOrganization.id}/members/${userId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
        },
      });

      if (response.ok) {
        Alert.alert(
          t('Organizations.success', 'Success'),
          t('Organizations.memberRemoved', 'Member removed successfully')
        );
        fetchMembers();
      } else {
        Alert.alert(
          t('Organizations.error', 'Error'),
          t('Organizations.failedToRemoveMember', 'Failed to remove member')
        );
      }
    } catch (error) {
      console.error('Failed to remove member:', error);
      Alert.alert(
        t('Organizations.error', 'Error'),
        t('Organizations.failedToRemoveMember', 'Failed to remove member')
      );
    }
  };

  // Handle revoke invite
  const handleRevokeInvite = async (inviteId: string) => {
    if (!currentOrganization) return;
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const response = await fetch(`${API_URL}/api/organizations/${currentOrganization.id}/invites/${inviteId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
        },
      });

      if (response.ok) {
        Alert.alert(
          t('Organizations.success', 'Success'),
          t('Organizations.inviteRevoked', 'Invite revoked successfully')
        );
        fetchInvites();
      } else {
        Alert.alert(
          t('Organizations.error', 'Error'),
          t('Organizations.failedToRevokeInvite', 'Failed to revoke invite')
        );
      }
    } catch (error) {
      console.error('Failed to revoke invite:', error);
      Alert.alert(
        t('Organizations.error', 'Error'),
        t('Organizations.failedToRevokeInvite', 'Failed to revoke invite')
      );
    }
  };

  // Confirm deletion dialog
  const confirmDelete = () => {
    if (!itemToDelete) return;

    Alert.alert(
      itemToDelete.type === 'member'
        ? t('Organizations.confirmRemoveMember', 'Remove Member?')
        : t('Organizations.confirmRevokeInvite', 'Revoke Invite?'),
      itemToDelete.type === 'member'
        ? t('Organizations.confirmRemoveMemberDescription', 'Are you sure you want to remove this member?')
        : t('Organizations.confirmRevokeInviteDescription', 'Are you sure you want to revoke this invite?'),
      [
        {
          text: t('Organizations.cancel', 'Cancel'),
          style: 'cancel',
          onPress: () => setItemToDelete(null),
        },
        {
          text: itemToDelete.type === 'member'
            ? t('Organizations.remove', 'Remove')
            : t('Organizations.revoke', 'Revoke'),
          style: 'destructive',
          onPress: () => {
            if (itemToDelete.type === 'member') {
              handleRemoveMember(itemToDelete.id);
            } else {
              handleRevokeInvite(itemToDelete.id);
            }
            setItemToDelete(null);
          },
        },
      ]
    );
  };

  // Show delete confirmation when item is set
  useEffect(() => {
    if (itemToDelete) {
      confirmDelete();
    }
  }, [itemToDelete]);

  // Get role icon
  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'OWNER':
        return 'ribbon-outline' as const;
      case 'TRAINER':
        return 'school-outline' as const;
      case 'ATHLETE':
        return 'fitness-outline' as const;
      default:
        return 'person-outline' as const;
    }
  };

  // Get role badge variant
  const getRoleBadgeVariant = (role: string): 'default' | 'secondary' | 'destructive' | 'outline' => {
    switch (role) {
      case 'OWNER':
        return 'default';
      case 'TRAINER':
        return 'secondary';
      case 'ATHLETE':
        return 'outline';
      default:
        return 'outline';
    }
  };

  // Format relative time (simple version without date-fns)
  const formatRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInMinutes = Math.floor(diffInMs / 60000);
    const diffInHours = Math.floor(diffInMinutes / 60);
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInMinutes < 1) return t('Organizations.justNow', 'Just now');
    if (diffInMinutes < 60) return t('Organizations.minutesAgo', '{{count}} minutes ago', { count: diffInMinutes });
    if (diffInHours < 24) return t('Organizations.hoursAgo', '{{count}} hours ago', { count: diffInHours });
    if (diffInDays < 30) return t('Organizations.daysAgo', '{{count}} days ago', { count: diffInDays });
    return date.toLocaleDateString();
  };

  // Loading state
  if (loading) {
    return (
      <View style={[styles.centerContainer, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={theme.primary} />
        <Text style={[styles.loadingText, { color: theme.mutedForeground }]}>
          {t('Organizations.loading', 'Loading...')}
        </Text>
      </View>
    );
  }

  // No organization selected
  if (!currentOrganization) {
    return (
      <ScrollView style={[styles.container, { backgroundColor: theme.background }]}>
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={[styles.title, { color: theme.foreground }]}>
              {t('Organizations.title', 'Organizations')}
            </Text>
          </View>

          <Card>
            <CardContent style={styles.emptyState}>
              <View style={[styles.emptyIconContainer, { backgroundColor: `${theme.primary}20` }]}>
                <Ionicons name="business-outline" size={48} color={theme.mutedForeground} />
              </View>
              <Text style={[styles.emptyStateTitle, { color: theme.foreground }]}>
                {t('Organizations.noOrganizationSelected', 'No organization selected')}
              </Text>
              <Text style={[styles.emptyStateDescription, { color: theme.mutedForeground }]}>
                {t('Organizations.createOrJoinPrompt', 'Create or join an organization to get started')}
              </Text>
              <Button
                onPress={() => navigation.navigate('OrganizationSetup')}
                style={{ marginTop: 16 }}
              >
                {t('Organizations.getStarted', 'Get Started')}
              </Button>
            </CardContent>
          </Card>
        </View>
      </ScrollView>
    );
  }

  // Handle switch organization
  const handleSwitchOrganization = async (orgId: string) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const response = await fetch(`${API_URL}/api/users/switch-organization`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ organizationId: orgId })
      });

      if (response.ok) {
        Alert.alert(
          t('Organizations.success', 'Success'),
          t('Organizations.organizationSwitched', 'Organization switched successfully')
        );
        await fetchUserData();

        // Force navigation to refresh
        navigation.navigate('Dashboard' as never);
      } else {
        const errorData = await response.json().catch(() => ({}));
        Alert.alert(
          t('Organizations.error', 'Error'),
          errorData.message || t('Organizations.failedToSwitchOrganization', 'Failed to switch organization')
        );
      }
    } catch (error) {
      console.error('Failed to switch organization:', error);
      Alert.alert(
        t('Organizations.error', 'Error'),
        t('Organizations.failedToSwitchOrganization', 'Failed to switch organization')
      );
    }
  };

  // Render tab content
  const renderTabContent = () => {
    switch (activeTab) {
      case 'all':
        return (
          <View style={styles.tabContent}>
            {organizations.map((org) => {
              const isCurrent = org.id === currentOrganization?.id;
              return (
                <TouchableOpacity
                  key={org.id}
                  onPress={() => !isCurrent && handleSwitchOrganization(org.id)}
                  activeOpacity={isCurrent ? 1 : 0.7}
                >
                  <Card
                    style={[
                      { marginBottom: 12 },
                      isCurrent && { borderColor: theme.primary, borderWidth: 2 }
                    ]}
                  >
                    <CardHeader>
                      <View style={styles.organizationHeader}>
                        <View style={styles.organizationHeaderLeft}>
                          <View style={[
                            styles.orgIconSmall,
                            { backgroundColor: isCurrent ? `${theme.primary}20` : `${theme.secondary}50` }
                          ]}>
                            <Ionicons
                              name={isCurrent ? "business" : "business-outline"}
                              size={20}
                              color={isCurrent ? theme.primary : theme.foreground}
                            />
                          </View>
                          <View style={styles.organizationInfo}>
                            <CardTitle style={{ fontSize: 18 }}>{org.name}</CardTitle>
                            {org.description && (
                              <CardDescription style={{ marginTop: 4, fontSize: 13 }}>
                                {org.description}
                              </CardDescription>
                            )}
                            {org.joinedAt && (
                              <Text style={[styles.joinedText, { color: theme.mutedForeground }]}>
                                {t('Organizations.joined', 'Joined')} {formatRelativeTime(org.joinedAt)}
                              </Text>
                            )}
                          </View>
                        </View>
                        <Badge variant={getRoleBadgeVariant(org.role || '')}>
                          <View style={styles.badgeContent}>
                            <Ionicons
                              name={getRoleIcon(org.role || '')}
                              size={12}
                              color={
                                org.role === 'OWNER' ? theme.primaryForeground :
                                org.role === 'TRAINER' ? theme.secondaryForeground :
                                theme.foreground
                              }
                              style={{ marginRight: 4 }}
                            />
                            <Text style={[
                              styles.badgeText,
                              {
                                color: org.role === 'OWNER' ? theme.primaryForeground :
                                       org.role === 'TRAINER' ? theme.secondaryForeground :
                                       theme.foreground
                              }
                            ]}>
                              {org.role ? t(`Organizations.role.${org.role}`, org.role) : ''}
                            </Text>
                          </View>
                        </Badge>
                      </View>
                    </CardHeader>
                    {isCurrent && currentUserRole === 'OWNER' && (
                      <CardContent>
                        <Button
                          variant="outline"
                          onPress={() => handleEditOrg(org)}
                          style={{ marginBottom: 8 }}
                        >
                          <View style={styles.buttonContent}>
                            <Ionicons name="create-outline" size={16} color={theme.foreground} style={{ marginRight: 8 }} />
                            <Text style={[styles.buttonText, { color: theme.foreground }]}>
                              {t('Organizations.editInformation', 'Edit Information')}
                            </Text>
                          </View>
                        </Button>
                      </CardContent>
                    )}
                  </Card>
                </TouchableOpacity>
              );
            })}

            {editingOrg && (
              <Card style={{ marginBottom: 12 }}>
                <CardHeader>
                  <CardTitle>{t('Organizations.editOrganization', 'Edit Organization')}</CardTitle>
                </CardHeader>
                <CardContent>
                  <Input
                    label={t('Organizations.organizationName', 'Organization Name')}
                    value={editFormData.name}
                    onChangeText={(text) => setEditFormData({ ...editFormData, name: text })}
                    editable={!savingOrg}
                    containerStyle={{ marginBottom: 16 }}
                  />
                  <View style={{ marginBottom: 16 }}>
                    <Text style={[styles.label, { color: theme.foreground, marginBottom: 8 }]}>
                      {t('Organizations.organizationDescription', 'Organization Description')}
                    </Text>
                    <TextInput
                      value={editFormData.description}
                      onChangeText={(text) => setEditFormData({ ...editFormData, description: text })}
                      multiline
                      numberOfLines={4}
                      textAlignVertical="top"
                      editable={!savingOrg}
                      style={[
                        styles.textarea,
                        {
                          backgroundColor: theme.background,
                          borderColor: theme.input,
                          color: theme.foreground,
                        }
                      ]}
                      placeholderTextColor={theme.mutedForeground}
                    />
                  </View>
                  <View style={styles.buttonRow}>
                    <Button
                      onPress={() => handleSaveOrg(editingOrg)}
                      loading={savingOrg}
                      disabled={savingOrg}
                      style={{ flex: 1, marginRight: 8 }}
                    >
                      {savingOrg ? t('Organizations.saving', 'Saving...') : t('Organizations.save', 'Save')}
                    </Button>
                    <Button
                      variant="outline"
                      onPress={() => setEditingOrg(null)}
                      disabled={savingOrg}
                      style={{ flex: 1 }}
                    >
                      {t('Organizations.cancel', 'Cancel')}
                    </Button>
                  </View>
                </CardContent>
              </Card>
            )}

            <Button
              onPress={() => navigation.navigate('CreateOrganization')}
              style={{ marginTop: 8 }}
            >
              <View style={styles.buttonContent}>
                <Ionicons name="add-circle-outline" size={16} color={theme.primaryForeground} style={{ marginRight: 8 }} />
                <Text style={[styles.buttonText, { color: theme.primaryForeground }]}>
                  {t('Organizations.createNewOrganization', 'Create New Organization')}
                </Text>
              </View>
            </Button>
          </View>
        );

      case 'members':
        if (currentUserRole !== 'OWNER' && currentUserRole !== 'TRAINER') {
          return (
            <Card>
              <CardContent style={styles.emptyState}>
                <Text style={[styles.noPermissionText, { color: theme.mutedForeground }]}>
                  {t('Organizations.noPermission', 'You do not have permission to view this')}
                </Text>
              </CardContent>
            </Card>
          );
        }

        return (
          <View style={styles.tabContent}>
            <Card>
              <CardHeader>
                <View style={styles.sectionHeader}>
                  <View style={{ flex: 1, marginRight: 12 }}>
                    <CardTitle>{t('Organizations.members', 'Members')}</CardTitle>
                    <CardDescription>
                      {t('Organizations.manageMembers', 'Manage organization members')} ({members.length} {t('Organizations.total', 'total')})
                    </CardDescription>
                  </View>
                  <Button
                    size="sm"
                    onPress={() => navigation.navigate('InviteMembers')}
                    style={{ flexShrink: 0 }}
                  >
                    <View style={styles.buttonContent}>
                      <Ionicons name="person-add-outline" size={14} color={theme.primaryForeground} style={{ marginRight: 6 }} />
                      <Text style={[styles.buttonTextSmall, { color: theme.primaryForeground }]}>
                        {t('Organizations.invite', 'Invite')}
                      </Text>
                    </View>
                  </Button>
                </View>
              </CardHeader>
              <CardContent>
                {loadingMembers ? (
                  <View style={styles.loadingContainer}>
                    <ActivityIndicator size="small" color={theme.primary} />
                  </View>
                ) : members.length === 0 ? (
                  <View style={styles.emptyState}>
                    <Ionicons name="people-outline" size={48} color={theme.mutedForeground} />
                    <Text style={[styles.emptyStateDescription, { color: theme.mutedForeground, marginTop: 12 }]}>
                      {t('Organizations.noMembersYet', 'No members yet')}
                    </Text>
                  </View>
                ) : (
                  <View>
                    {members.map((member, index) => (
                      <View
                        key={member.id}
                        style={[
                          styles.memberRow,
                          { borderBottomColor: theme.border },
                          index === members.length - 1 && styles.memberRowLast
                        ]}
                      >
                        <View style={{ flex: 1 }}>
                          <Text style={[styles.memberName, { color: theme.foreground }]}>
                            {member.user?.name || member.user?.email?.split('@')[0] || 'Unknown'}
                          </Text>
                          <Text style={[styles.memberEmail, { color: theme.mutedForeground }]}>
                            {member.user?.email}
                          </Text>
                          <View style={styles.memberMeta}>
                            <Badge
                              variant={
                                member.role === 'OWNER' ? 'destructive' :
                                member.role === 'TRAINER' ? 'default' :
                                'secondary'
                              }
                              style={{ marginRight: 8 }}
                            >
                              {t(`Organizations.role.${member.role}`, member.role)}
                            </Badge>
                            <Text style={[styles.memberJoined, { color: theme.mutedForeground }]}>
                              {formatRelativeTime(member.joinedAt)}
                            </Text>
                          </View>
                        </View>
                        {member.role !== 'OWNER' && member.userId !== user?.id && (
                          <TouchableOpacity
                            onPress={() => setItemToDelete({ type: 'member', id: member.userId })}
                            style={[styles.deleteButton, { backgroundColor: theme.destructive }]}
                          >
                            <Ionicons name="trash-outline" size={16} color={theme.destructiveForeground} />
                          </TouchableOpacity>
                        )}
                      </View>
                    ))}
                  </View>
                )}
              </CardContent>
            </Card>
          </View>
        );

      case 'invites':
        if (currentUserRole !== 'OWNER' && currentUserRole !== 'TRAINER') {
          return (
            <Card>
              <CardContent style={styles.emptyState}>
                <Text style={[styles.noPermissionText, { color: theme.mutedForeground }]}>
                  {t('Organizations.noPermission', 'You do not have permission to view this')}
                </Text>
              </CardContent>
            </Card>
          );
        }

        return (
          <View style={styles.tabContent}>
            <Card>
              <CardHeader>
                <View style={styles.sectionHeader}>
                  <View style={{ flex: 1, marginRight: 12 }}>
                    <CardTitle>{t('Organizations.pendingInvitations', 'Pending Invitations')}</CardTitle>
                    <CardDescription>
                      {t('Organizations.manageSentInvitations', 'Manage sent invitations')} ({invites.length} {t('Organizations.pending', 'pending')})
                    </CardDescription>
                  </View>
                  <Button
                    size="sm"
                    onPress={() => navigation.navigate('InviteMembers')}
                    style={{ flexShrink: 0 }}
                  >
                    <View style={styles.buttonContent}>
                      <Ionicons name="person-add-outline" size={14} color={theme.primaryForeground} style={{ marginRight: 6 }} />
                      <Text style={[styles.buttonTextSmall, { color: theme.primaryForeground }]}>
                        {t('Organizations.invite', 'Invite')}
                      </Text>
                    </View>
                  </Button>
                </View>
              </CardHeader>
              <CardContent>
                {loadingInvites ? (
                  <View style={styles.loadingContainer}>
                    <ActivityIndicator size="small" color={theme.primary} />
                  </View>
                ) : invites.length === 0 ? (
                  <View style={styles.emptyState}>
                    <Ionicons name="mail-outline" size={48} color={theme.mutedForeground} />
                    <Text style={[styles.emptyStateDescription, { color: theme.mutedForeground, marginTop: 12 }]}>
                      {t('Organizations.noInvitesYet', 'No pending invites')}
                    </Text>
                  </View>
                ) : (
                  <View>
                    {invites.map((invite, index) => (
                      <View
                        key={invite.id}
                        style={[
                          styles.memberRow,
                          { borderBottomColor: theme.border },
                          index === invites.length - 1 && styles.memberRowLast
                        ]}
                      >
                        <View style={{ flex: 1 }}>
                          <Text style={[styles.memberName, { color: theme.foreground }]}>
                            {invite.email}
                          </Text>
                          <View style={styles.memberMeta}>
                            <Badge
                              variant={
                                invite.role === 'OWNER' ? 'destructive' :
                                invite.role === 'TRAINER' ? 'default' :
                                'secondary'
                              }
                              style={{ marginRight: 8 }}
                            >
                              {t(`Organizations.role.${invite.role}`, invite.role)}
                            </Badge>
                            <Text style={[styles.memberJoined, { color: theme.mutedForeground }]}>
                              {t('Organizations.sentAt', 'Sent')} {formatRelativeTime(invite.createdAt)}
                            </Text>
                          </View>
                          <View style={[styles.expiryContainer, { marginTop: 4 }]}>
                            <Ionicons name="time-outline" size={12} color={theme.mutedForeground} style={{ marginRight: 4 }} />
                            <Text style={[styles.expiryText, { color: theme.mutedForeground }]}>
                              {t('Organizations.expires', 'Expires')} {formatRelativeTime(invite.expiresAt)}
                            </Text>
                          </View>
                        </View>
                        <TouchableOpacity
                          onPress={() => setItemToDelete({ type: 'invite', id: invite.id })}
                          style={[styles.deleteButton, { backgroundColor: theme.destructive }]}
                        >
                          <Ionicons name="trash-outline" size={16} color={theme.destructiveForeground} />
                        </TouchableOpacity>
                      </View>
                    ))}
                  </View>
                )}
              </CardContent>
            </Card>
          </View>
        );

      default:
        return null;
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: theme.foreground }]}>
            {t('Organizations.manageTitle', 'Manage Organizations')}
          </Text>
          <Text style={[styles.subtitle, { color: theme.mutedForeground }]}>
            {t('Organizations.manageDescription', 'Manage your organizations and teams')}
          </Text>
        </View>

        {/* Tabs */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={[styles.tabs, { borderBottomColor: theme.border }]}
          contentContainerStyle={styles.tabsContent}
        >
          <TouchableOpacity
            style={[
              styles.tab,
              activeTab === 'all' && { borderBottomColor: theme.primary, borderBottomWidth: 2 }
            ]}
            onPress={() => setActiveTab('all')}
          >
            <Text style={[
              styles.tabText,
              { color: activeTab === 'all' ? theme.primary : theme.mutedForeground }
            ]}>
              {t('Organizations.organizations', 'Organizations')}
            </Text>
          </TouchableOpacity>

          {(currentUserRole === 'OWNER' || currentUserRole === 'TRAINER') && (
            <>
              <TouchableOpacity
                style={[
                  styles.tab,
                  activeTab === 'members' && { borderBottomColor: theme.primary, borderBottomWidth: 2 }
                ]}
                onPress={() => setActiveTab('members')}
              >
                <Text style={[
                  styles.tabText,
                  { color: activeTab === 'members' ? theme.primary : theme.mutedForeground }
                ]}>
                  {t('Organizations.members', 'Members')}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.tab,
                  activeTab === 'invites' && { borderBottomColor: theme.primary, borderBottomWidth: 2 }
                ]}
                onPress={() => setActiveTab('invites')}
              >
                <Text style={[
                  styles.tabText,
                  { color: activeTab === 'invites' ? theme.primary : theme.mutedForeground }
                ]}>
                  {t('Organizations.invitations', 'Invitations')}
                </Text>
              </TouchableOpacity>
            </>
          )}
        </ScrollView>
      </View>

      {/* Tab Content */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.content}>
          {renderTabContent()}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 16,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 32,
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
    marginTop: 16,
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
  },
  tabs: {
    borderBottomWidth: 1,
    marginBottom: 16,
  },
  tabsContent: {
    flexDirection: 'row',
    paddingHorizontal: 0,
  },
  tab: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginRight: 8,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
  },
  tabContent: {
    marginTop: 8,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 48,
  },
  emptyIconContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  emptyStateDescription: {
    fontSize: 14,
    textAlign: 'center',
  },
  organizationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  organizationHeaderLeft: {
    flexDirection: 'row',
    flex: 1,
    marginRight: 12,
  },
  orgIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  orgIconSmall: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  organizationInfo: {
    flex: 1,
  },
  badgeContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  joinedText: {
    fontSize: 12,
    marginTop: 4,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  buttonTextSmall: {
    fontSize: 14,
    fontWeight: '600',
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
  },
  textarea: {
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    minHeight: 100,
  },
  buttonRow: {
    flexDirection: 'row',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  loadingContainer: {
    paddingVertical: 32,
    alignItems: 'center',
  },
  memberRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  memberRowLast: {
    borderBottomWidth: 0,
  },
  memberName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  memberEmail: {
    fontSize: 14,
    marginBottom: 8,
  },
  memberMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  memberJoined: {
    fontSize: 12,
  },
  deleteButton: {
    width: 36,
    height: 36,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  noPermissionText: {
    textAlign: 'center',
    fontSize: 14,
  },
  expiryContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  expiryText: {
    fontSize: 12,
  },
});
