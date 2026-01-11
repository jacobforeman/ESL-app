import React, { useCallback, useEffect, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import ActionButton from '../components/ActionButton';
import { addMedication, getTodayAdherenceSnapshot, recordDose, summarizeAdherence } from '../logic/medTracker';
import { readStore } from '../storage';
import { medConfigStore, profileStore } from '../storage/stores';
import type { CaregiverMode, MedConfigItem } from '../storage/types';
import { colors } from '../theme/colors';
import type { MedAdherenceSnapshotItem } from '../types/meds';
import { getCaregiverPossessive } from '../utils/caregiverPhrasing';

const todayKey = (): string => new Date().toISOString().slice(0, 10);
const createId = () => `${Date.now()}-${Math.random().toString(16).slice(2)}`;

const MedsScreen = () => {
  const [meds, setMeds] = useState<MedConfigItem[]>([]);
  const [snapshot, setSnapshot] = useState<MedAdherenceSnapshotItem[]>([]);
  const [summary, setSummary] = useState({ taken: 0, missed: 0, percentage: 0 });
  const [name, setName] = useState('');
  const [dose, setDose] = useState('');
  const [schedule, setSchedule] = useState('');
  const [critical, setCritical] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [caregiverMode, setCaregiverMode] = useState<CaregiverMode>('patient');

  const loadData = useCallback(async () => {
    const [{ data: profile }, { data: config }, adherenceSnapshot, adherenceSummary] = await Promise.all([
      readStore(profileStore),
      readStore(medConfigStore),
      getTodayAdherenceSnapshot(),
      summarizeAdherence(),
    ]);
    setCaregiverMode(profile.caregiverMode);
    setMeds(config.meds);
    setSnapshot(adherenceSnapshot);
    setSummary(adherenceSummary);
  }, []);

  useEffect(() => {
    loadData().catch((error) => {
      console.warn('Unable to load medication data.', error);
      setErrorMessage('Unable to load medication data.');
    });
  }, [loadData]);

  const handleAddMedication = async () => {
    setErrorMessage(null);
    if (!name.trim() || !dose.trim()) {
      setErrorMessage('Please enter a medication name and dose.');
      return;
    }

    setLoading(true);
    try {
      const scheduleItems = schedule
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean);

      await addMedication({
        id: createId(),
        name: name.trim(),
        dose: dose.trim(),
        schedule: scheduleItems.length ? scheduleItems : ['Daily'],
        critical,
      });

      setName('');
      setDose('');
      setSchedule('');
      setCritical(false);
      await loadData();
    } catch (error) {
      console.warn('Unable to save medication.', error);
      setErrorMessage('Unable to save medication.');
    } finally {
      setLoading(false);
    }
  };

  const handleRecordDose = async (medId: string, taken: boolean) => {
    setLoading(true);
    setErrorMessage(null);
    try {
      await recordDose({
        id: createId(),
        medId,
        date: todayKey(),
        taken,
        reason: taken ? undefined : 'Marked missed in daily tracker.',
      });
      await loadData();
    } catch (error) {
      console.warn('Unable to record dose.', error);
      setErrorMessage('Unable to record dose.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Medication Tracker</Text>
      <Text style={styles.subtitle}>
        Review {getCaregiverPossessive(caregiverMode)} daily medications and log each dose.
      </Text>

      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>
          Today&apos;s adherence for {getCaregiverPossessive(caregiverMode)} medications
        </Text>
        <Text style={styles.sectionSubtitle}>
          {summary.taken} taken · {summary.missed} missed · {summary.percentage}% adherence
        </Text>
        {snapshot.length === 0 ? (
          <Text style={styles.emptyText}>No medications configured yet.</Text>
        ) : (
          snapshot.map((item) => (
            <View key={item.medId} style={styles.medRow}>
              <View style={styles.medInfo}>
                <Text style={styles.medName}>{item.name}</Text>
                <Text style={styles.medDose}>{item.dose}</Text>
                {item.isCritical ? <Text style={styles.criticalTag}>Critical</Text> : null}
              </View>
              <View style={styles.actionsRow}>
                <Pressable
                  onPress={() => handleRecordDose(item.medId, true)}
                  style={[
                    styles.statusButton,
                    item.status === 'taken' && styles.statusButtonTaken,
                  ]}
                >
                  <Text style={styles.statusButtonText}>Taken</Text>
                </Pressable>
                <Pressable
                  onPress={() => handleRecordDose(item.medId, false)}
                  style={[
                    styles.statusButton,
                    item.status === 'missed' && styles.statusButtonMissed,
                  ]}
                >
                  <Text style={styles.statusButtonText}>Missed</Text>
                </Pressable>
              </View>
            </View>
          ))
        )}
      </View>

      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>Add a medication</Text>
        <Text style={styles.sectionSubtitle}>Keep your schedule up to date.</Text>
        <TextInput
          value={name}
          onChangeText={setName}
          placeholder="Medication name"
          style={styles.input}
          placeholderTextColor={colors.textSecondary}
        />
        <TextInput
          value={dose}
          onChangeText={setDose}
          placeholder="Dose (e.g., 20 mg)"
          style={styles.input}
          placeholderTextColor={colors.textSecondary}
        />
        <TextInput
          value={schedule}
          onChangeText={setSchedule}
          placeholder="Schedule (comma-separated)"
          style={styles.input}
          placeholderTextColor={colors.textSecondary}
        />
        <Pressable
          onPress={() => setCritical((prev) => !prev)}
          style={[styles.toggle, critical && styles.toggleActive]}
        >
          <Text style={styles.toggleLabel}>
            {critical ? 'Critical medication' : 'Mark as critical'}
          </Text>
        </Pressable>
        <ActionButton
          label={loading ? 'Saving...' : 'Save medication'}
          onPress={handleAddMedication}
          variant="primary"
        />
        {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}
      </View>

      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>Current medications</Text>
        {meds.length === 0 ? (
          <Text style={styles.emptyText}>No medications saved yet.</Text>
        ) : (
          meds.map((med) => (
            <View key={med.id} style={styles.medListRow}>
              <View>
                <Text style={styles.medName}>{med.name}</Text>
                <Text style={styles.medDose}>{med.dose}</Text>
                <Text style={styles.scheduleText}>{med.schedule.join(', ')}</Text>
              </View>
              {med.critical ? <Text style={styles.criticalTag}>Critical</Text> : null}
            </View>
          ))
        )}
      </View>
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
  medRow: {
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  medInfo: {
    gap: 4,
  },
  medName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  medDose: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 8,
  },
  statusButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 999,
    backgroundColor: '#F3F4F6',
  },
  statusButtonTaken: {
    backgroundColor: '#DCFCE7',
  },
  statusButtonMissed: {
    backgroundColor: '#FEE2E2',
  },
  statusButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: colors.textPrimary,
  },
  toggle: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  toggleActive: {
    backgroundColor: '#FEF3C7',
    borderColor: '#FCD34D',
  },
  toggleLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  errorText: {
    fontSize: 13,
    color: '#B91C1C',
  },
  emptyText: {
    fontSize: 14,
    color: colors.textSecondary,
    fontStyle: 'italic',
  },
  medListRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  scheduleText: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  criticalTag: {
    alignSelf: 'flex-start',
    marginTop: 4,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 999,
    backgroundColor: '#FEF2F2',
    color: '#991B1B',
    fontSize: 11,
    fontWeight: '700',
  },
});

export default MedsScreen;
