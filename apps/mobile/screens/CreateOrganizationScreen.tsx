import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Alert,
  TextInput,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../contexts/ThemeContext';
import { useOrganization } from '../contexts/OrganizationContext';
import { api } from '../lib/api';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';

export function CreateOrganizationScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const { theme } = useTheme();
  const { refreshOrganizations } = useOrganization();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [creating, setCreating] = useState(false);

  const handleCreate = async () => {
    if (!name.trim()) {
      Alert.alert(t('CreateOrganization.error', 'Error'), t('CreateOrganization.nameRequired', 'Organization name is required'));
      return;
    }

    setCreating(true);
    try {
      await api.createOrganization(name.trim(), description.trim() || undefined);
      await refreshOrganizations();
      Alert.alert(t('Organizations.success', 'Success'), t('CreateOrganization.success', 'Organization created successfully'));
      navigation.goBack();
    } catch (error: any) {
      Alert.alert(t('CreateOrganization.error', 'Error'), error.message || t('CreateOrganization.error', 'Failed to create organization'));
    } finally {
      setCreating(false);
    }
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: `${theme.primary}08` }]}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: theme.foreground }]}>
            {t('CreateOrganization.title', 'Create Organization')}
          </Text>
          <Text style={[styles.subtitle, { color: theme.mutedForeground }]}>
            {t('CreateOrganization.description', 'Create a new organization to manage your team')}
          </Text>
        </View>

        <Card>
          <CardContent>
            <Input
              label={t('CreateOrganization.nameLabel', 'Organization Name')}
              placeholder={t('CreateOrganization.namePlaceholder', 'Enter organization name')}
              value={name}
              onChangeText={setName}
              editable={!creating}
              containerStyle={{ marginBottom: 16 }}
            />

            <View style={{ marginBottom: 16 }}>
              <Text style={[styles.label, { color: theme.foreground, marginBottom: 8 }]}>
                {t('CreateOrganization.descriptionLabel', 'Description (optional)')}
              </Text>
              <TextInput
                placeholder={t('CreateOrganization.descriptionPlaceholder', 'Enter a description for your organization')}
                value={description}
                onChangeText={setDescription}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
                editable={!creating}
                style={[
                  styles.textarea,
                  {
                    backgroundColor: theme.background,
                    borderColor: theme.input,
                    color: theme.foreground,
                  },
                ]}
                placeholderTextColor={theme.mutedForeground}
              />
            </View>

            <Button onPress={handleCreate} loading={creating} disabled={creating}>
              {creating
                ? t('CreateOrganization.creating', 'Creating...')
                : t('CreateOrganization.createButton', 'Create Organization')}
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
  textarea: {
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    minHeight: 100,
  },
});
