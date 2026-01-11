import React, { useCallback, useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import ActionButton from '../components/ActionButton';
import { readStore, updateStore } from '../storage';
import { profileStore } from '../storage/stores';
import { CaregiverMode } from '../storage/types';
import { colors } from '../theme/colors';
import { logAuditEvent } from '../logic/auditLog';

const SettingsScreen = () => {
  const [name, setName] = useState('');
  const [mode, setMode] = useState<CaregiverMode>('patient');
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const loadProfile = useCallback(async () => {
    const { data } = await readStore(profileStore);
    setName(data.name);
    setMode(data.caregiverMode);
  }, []);

  useEffect(() => {
    loadProfile().catch((error) => {
      console.warn('Unable to load profile settings.', error);
    });
  }, [loadProfile]);

  const handleSave = async () => {
    setSaving(true);
    setStatusMessage(null);
    try {
      let previousMode: CaregiverMode = mode;
      await updateStore(profileStore, (current) => {
        previousMode = current.caregiverMode;
        return {
          ...current,
          name: name.trim(),
          caregiverMode: mode,
          updatedAt: new Date().toISOString(),
        };
      });
      if (previousMode !== mode) {
        await logAuditEvent({
          userRole: mode,
          actionType: 'caregiver_mode_toggled',
          entity: 'profile',
        });
      }
      setStatusMessage('Settings saved.');
    } catch (error) {
      console.warn('Unable to save profile settings.', error);
      setStatusMessage('Unable to save settings.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Settings</Text>
      <Text style={styles.subtitle}>Manage preferences and caregiver mode.</Text>

      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>Profile</Text>
        <Text style={styles.sectionSubtitle}>Update how we address you.</Text>
        <TextInput
          value={name}
          onChangeText={setName}
          placeholder="Name"
          placeholderTextColor={colors.textSecondary}
          style={styles.input}
        />
      </View>

      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>Caregiver mode</Text>
        <Text style={styles.sectionSubtitle}>Choose who is completing the check-in.</Text>
        <View style={styles.toggleRow}>
          <Pressable
            onPress={() => setMode('patient')}
            style={[styles.toggleButton, mode === 'patient' && styles.toggleButtonActive]}
          >
            <Text style={styles.toggleText}>Patient</Text>
          </Pressable>
          <Pressable
            onPress={() => setMode('caregiver')}
            style={[styles.toggleButton, mode === 'caregiver' && styles.toggleButtonActive]}
          >
            <Text style={styles.toggleText}>Caregiver</Text>
          </Pressable>
        </View>
        <Text style={styles.modeHint}>
          {mode === 'caregiver'
            ? 'Caregivers can log observations on behalf of the patient.'
            : 'Patient mode keeps language focused on the patient.'}
        </Text>
      </View>

      <ActionButton
        label={saving ? 'Saving...' : 'Save settings'}
        onPress={handleSave}
        variant="primary"
      />
      {statusMessage ? <Text style={styles.statusText}>{statusMessage}</Text> : null}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: 20,
    gap: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  subtitle: {
    fontSize: 15,
    color: colors.textSecondary,
  },
  sectionCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  sectionSubtitle: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: colors.textPrimary,
  },
  toggleRow: {
    flexDirection: 'row',
    gap: 12,
  },
  toggleButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  toggleButtonActive: {
    backgroundColor: '#E0F2FE',
    borderColor: '#7DD3FC',
  },
  toggleText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  modeHint: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  statusText: {
    fontSize: 13,
    color: colors.textSecondary,
  },
});

export default SettingsScreen;
