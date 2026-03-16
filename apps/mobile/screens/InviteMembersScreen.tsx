import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useTheme } from '../contexts/ThemeContext';
import { useOrganization } from '../contexts/OrganizationContext';
import { api } from '../lib/api';
import { Card, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Ionicons } from '@expo/vector-icons';

export function InviteMembersScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const route = useRoute<any>();
  const { theme } = useTheme();
  const { currentOrganization } = useOrganization();

  const defaultRole = route.params?.defaultRole;
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<string>(defaultRole || 'ATHLETE');
  const [sending, setSending] = useState(false);

  const handleSend = async () => {
    if (!email.trim()) {
      Alert.alert(t('InviteMembers.error', 'Error'), t('InviteMembers.emailRequired', 'Email address is required'));
      return;
    }

    if (!currentOrganization) return;

    setSending(true);
    try {
      await api.createInvite(currentOrganization.id, email.trim(), role);
      Alert.alert(t('Organizations.success', 'Success'), t('InviteMembers.success', 'Invitation sent successfully'));
      setEmail('');
    } catch (error: any) {
      Alert.alert(t('InviteMembers.error', 'Error'), error.message || t('InviteMembers.error', 'Failed to send invitation'));
    } finally {
      setSending(false);
    }
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: `${theme.primary}08` }]}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: theme.foreground }]}>
            {t('InviteMembers.title', 'Invite Members')}
          </Text>
          <Text style={[styles.subtitle, { color: theme.mutedForeground }]}>
            {t('InviteMembers.description', 'Invite new members to your organization')}
          </Text>
        </View>

        <Card>
          <CardContent>
            <Input
              label={t('InviteMembers.emailLabel', 'Email Address')}
              placeholder={t('InviteMembers.emailPlaceholder', 'Enter email address')}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              editable={!sending}
              containerStyle={{ marginBottom: 16 }}
            />

            {!defaultRole && (
              <View style={{ marginBottom: 16 }}>
                <Text style={[styles.label, { color: theme.foreground, marginBottom: 8 }]}>
                  {t('InviteMembers.roleLabel', 'Role')}
                </Text>
                <View style={styles.roleToggle}>
                  <TouchableOpacity
                    style={[
                      styles.roleButton,
                      {
                        backgroundColor: role === 'ATHLETE' ? theme.primary : theme.background,
                        borderColor: theme.input,
                      },
                    ]}
                    onPress={() => setRole('ATHLETE')}
                    disabled={sending}
                  >
                    <Ionicons
                      name="fitness-outline"
                      size={16}
                      color={role === 'ATHLETE' ? theme.primaryForeground : theme.foreground}
                    />
                    <Text
                      style={[
                        styles.roleButtonText,
                        { color: role === 'ATHLETE' ? theme.primaryForeground : theme.foreground },
                      ]}
                    >
                      {t('organizations.role.ATHLETE', 'Athlete')}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.roleButton,
                      {
                        backgroundColor: role === 'TRAINER' ? theme.primary : theme.background,
                        borderColor: theme.input,
                      },
                    ]}
                    onPress={() => setRole('TRAINER')}
                    disabled={sending}
                  >
                    <Ionicons
                      name="school-outline"
                      size={16}
                      color={role === 'TRAINER' ? theme.primaryForeground : theme.foreground}
                    />
                    <Text
                      style={[
                        styles.roleButtonText,
                        { color: role === 'TRAINER' ? theme.primaryForeground : theme.foreground },
                      ]}
                    >
                      {t('organizations.role.TRAINER', 'Trainer')}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}

            <Button onPress={handleSend} loading={sending} disabled={sending}>
              {sending
                ? t('InviteMembers.sending', 'Sending...')
                : t('InviteMembers.sendButton', 'Send Invite')}
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
  label: {
    fontSize: 14,
    fontWeight: '500',
  },
  roleToggle: {
    flexDirection: 'row',
    gap: 12,
  },
  roleButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
  },
  roleButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
});
