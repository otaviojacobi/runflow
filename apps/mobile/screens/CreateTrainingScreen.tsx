import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Alert,
  TouchableOpacity,
  Modal,
  FlatList,
  TextInput,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../contexts/ThemeContext';
import { useOrganization } from '../contexts/OrganizationContext';
import { api } from '../lib/api';
import { Card, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Ionicons } from '@expo/vector-icons';

interface Athlete {
  userId: string;
  name: string;
  email: string;
}

export function CreateTrainingScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const { theme } = useTheme();
  const { currentOrganization } = useOrganization();

  const [title, setTitle] = useState('');
  const [selectedAthlete, setSelectedAthlete] = useState<Athlete | null>(null);
  const [scheduledDate, setScheduledDate] = useState('');
  const [type, setType] = useState<'RUNNING' | 'STRENGTH'>('RUNNING');
  const [description, setDescription] = useState('');
  const [creating, setCreating] = useState(false);
  const [athletes, setAthletes] = useState<Athlete[]>([]);
  const [showAthletePicker, setShowAthletePicker] = useState(false);

  useEffect(() => {
    if (currentOrganization) {
      fetchAthletes();
    }
  }, [currentOrganization?.id]);

  const fetchAthletes = async () => {
    if (!currentOrganization) return;
    try {
      const data = await api.getOrganizationMembers(currentOrganization.id);
      const athleteList = (data.members || [])
        .filter((m: any) => m.role === 'ATHLETE')
        .map((m: any) => ({
          userId: m.userId,
          name: m.user?.name || m.user?.email?.split('@')[0] || 'Unknown',
          email: m.user?.email || '',
        }));
      setAthletes(athleteList);
    } catch (error) {
      console.error('Failed to fetch athletes:', error);
    }
  };

  const handleCreate = async () => {
    if (!title.trim()) {
      Alert.alert(t('CreateTraining.error', 'Error'), t('CreateTraining.titleRequired', 'Training title is required'));
      return;
    }
    if (!selectedAthlete) {
      Alert.alert(t('CreateTraining.error', 'Error'), t('CreateTraining.athleteRequired', 'Please select an athlete'));
      return;
    }
    if (!scheduledDate.trim()) {
      Alert.alert(t('CreateTraining.error', 'Error'), t('CreateTraining.dateRequired', 'Scheduled date is required'));
      return;
    }
    if (!currentOrganization) return;

    setCreating(true);
    try {
      await api.createTraining({
        title: title.trim(),
        type,
        scheduledDate: new Date(scheduledDate.trim()).toISOString(),
        memberId: selectedAthlete.userId,
        organizationId: currentOrganization.id,
        description: description.trim() || undefined,
      });
      Alert.alert(t('Organizations.success', 'Success'), t('CreateTraining.success', 'Training created successfully'));
      navigation.goBack();
    } catch (error: any) {
      Alert.alert(t('CreateTraining.error', 'Error'), error.message || t('CreateTraining.error', 'Failed to create training'));
    } finally {
      setCreating(false);
    }
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: `${theme.primary}08` }]}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: theme.foreground }]}>
            {t('CreateTraining.title', 'Create Training')}
          </Text>
          <Text style={[styles.subtitle, { color: theme.mutedForeground }]}>
            {t('CreateTraining.description', 'Create a new training for an athlete')}
          </Text>
        </View>

        <Card>
          <CardContent>
            <Input
              label={t('CreateTraining.titleLabel', 'Training Title')}
              placeholder={t('CreateTraining.titlePlaceholder', 'Enter training title')}
              value={title}
              onChangeText={setTitle}
              editable={!creating}
              containerStyle={{ marginBottom: 16 }}
            />

            {/* Athlete Picker */}
            <View style={{ marginBottom: 16 }}>
              <Text style={[styles.label, { color: theme.foreground, marginBottom: 8 }]}>
                {t('CreateTraining.athleteLabel', 'Athlete')}
              </Text>
              <TouchableOpacity
                style={[
                  styles.pickerButton,
                  { backgroundColor: theme.background, borderColor: theme.input },
                ]}
                onPress={() => setShowAthletePicker(true)}
                disabled={creating}
              >
                <Text
                  style={[
                    styles.pickerButtonText,
                    { color: selectedAthlete ? theme.foreground : theme.mutedForeground },
                  ]}
                >
                  {selectedAthlete
                    ? selectedAthlete.name
                    : t('CreateTraining.selectAthlete', 'Select an athlete')}
                </Text>
                <Ionicons name="chevron-down" size={20} color={theme.mutedForeground} />
              </TouchableOpacity>
            </View>

            {/* Date Input */}
            <Input
              label={t('CreateTraining.dateLabel', 'Scheduled Date')}
              placeholder={t('CreateTraining.datePlaceholder', 'YYYY-MM-DD')}
              value={scheduledDate}
              onChangeText={setScheduledDate}
              editable={!creating}
              containerStyle={{ marginBottom: 16 }}
            />

            {/* Type Toggle */}
            <View style={{ marginBottom: 16 }}>
              <Text style={[styles.label, { color: theme.foreground, marginBottom: 8 }]}>
                {t('CreateTraining.typeLabel', 'Training Type')}
              </Text>
              <View style={styles.typeToggle}>
                <TouchableOpacity
                  style={[
                    styles.typeButton,
                    {
                      backgroundColor: type === 'RUNNING' ? theme.primary : theme.background,
                      borderColor: theme.input,
                    },
                  ]}
                  onPress={() => setType('RUNNING')}
                  disabled={creating}
                >
                  <Ionicons
                    name="walk-outline"
                    size={16}
                    color={type === 'RUNNING' ? theme.primaryForeground : theme.foreground}
                  />
                  <Text
                    style={[
                      styles.typeButtonText,
                      { color: type === 'RUNNING' ? theme.primaryForeground : theme.foreground },
                    ]}
                  >
                    {t('Schedule.running', 'Running')}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.typeButton,
                    {
                      backgroundColor: type === 'STRENGTH' ? theme.primary : theme.background,
                      borderColor: theme.input,
                    },
                  ]}
                  onPress={() => setType('STRENGTH')}
                  disabled={creating}
                >
                  <Ionicons
                    name="barbell-outline"
                    size={16}
                    color={type === 'STRENGTH' ? theme.primaryForeground : theme.foreground}
                  />
                  <Text
                    style={[
                      styles.typeButtonText,
                      { color: type === 'STRENGTH' ? theme.primaryForeground : theme.foreground },
                    ]}
                  >
                    {t('Schedule.strength', 'Strength')}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Description */}
            <View style={{ marginBottom: 16 }}>
              <Text style={[styles.label, { color: theme.foreground, marginBottom: 8 }]}>
                {t('CreateTraining.descriptionLabel', 'Description (optional)')}
              </Text>
              <TextInput
                placeholder={t('CreateTraining.descriptionPlaceholder', 'Enter training description')}
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
                ? t('CreateTraining.creating', 'Creating...')
                : t('CreateTraining.createButton', 'Create Training')}
            </Button>
          </CardContent>
        </Card>
      </View>

      {/* Athlete Picker Modal */}
      <Modal visible={showAthletePicker} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.card }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: theme.foreground }]}>
                {t('CreateTraining.selectAthlete', 'Select an athlete')}
              </Text>
              <TouchableOpacity onPress={() => setShowAthletePicker(false)}>
                <Ionicons name="close" size={24} color={theme.foreground} />
              </TouchableOpacity>
            </View>
            <FlatList
              data={athletes}
              keyExtractor={(item) => item.userId}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.athleteOption,
                    { borderBottomColor: theme.border },
                    selectedAthlete?.userId === item.userId && { backgroundColor: `${theme.primary}15` },
                  ]}
                  onPress={() => {
                    setSelectedAthlete(item);
                    setShowAthletePicker(false);
                  }}
                >
                  <View style={[styles.athleteAvatar, { backgroundColor: `${theme.primary}20` }]}>
                    <Text style={[styles.athleteAvatarText, { color: theme.primary }]}>
                      {item.name.charAt(0).toUpperCase()}
                    </Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.athleteName, { color: theme.foreground }]}>{item.name}</Text>
                    <Text style={[styles.athleteEmail, { color: theme.mutedForeground }]}>{item.email}</Text>
                  </View>
                  {selectedAthlete?.userId === item.userId && (
                    <Ionicons name="checkmark-circle" size={24} color={theme.primary} />
                  )}
                </TouchableOpacity>
              )}
              ListEmptyComponent={
                <View style={styles.emptyList}>
                  <Text style={[{ color: theme.mutedForeground }]}>
                    {t('Athletes.noAthletes', 'No athletes yet')}
                  </Text>
                </View>
              }
            />
          </View>
        </View>
      </Modal>
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
  pickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  pickerButtonText: {
    fontSize: 16,
  },
  typeToggle: {
    flexDirection: 'row',
    gap: 12,
  },
  typeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
  },
  typeButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  textarea: {
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    minHeight: 100,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    maxHeight: '70%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  athleteOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
  },
  athleteAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  athleteAvatarText: {
    fontSize: 16,
    fontWeight: '600',
  },
  athleteName: {
    fontSize: 16,
    fontWeight: '500',
  },
  athleteEmail: {
    fontSize: 13,
    marginTop: 2,
  },
  emptyList: {
    padding: 32,
    alignItems: 'center',
  },
});
