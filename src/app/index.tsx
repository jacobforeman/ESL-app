import React, { useCallback, useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { getTodayAdherenceSnapshot, summarizeAdherence } from '../logic/medTracker';
import { readStore } from '../storage';
import { journalStore, profileStore, triageHistoryStore } from '../storage/stores';
import type { CaregiverMode, JournalEntry, TriageHistoryEntry } from '../storage/types';
import { colors } from '../theme/colors';
import type { MedAdherenceSnapshotItem } from '../types/meds';
import { getCaregiverPossessive } from '../utils/caregiverPhrasing';

const HomeScreen = () => {
  const [profileName, setProfileName] = useState('');
  const [caregiverMode, setCaregiverMode] = useState<CaregiverMode>('patient');
  const [triageHistory, setTriageHistory] = useState<TriageHistoryEntry[]>([]);
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>([]);
  const [adherenceSummary, setAdherenceSummary] = useState({ taken: 0, missed: 0 });
  const [adherenceSnapshot, setAdherenceSnapshot] = useState<MedAdherenceSnapshotItem[]>([]);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    const [
      { data: profile },
      { data: triage },
      { data: journal },
      adherenceSummaryResult,
      adherenceSnapshotResult,
    ] = await Promise.all([
      readStore(profileStore),
      readStore(triageHistoryStore),
      readStore(journalStore),
      summarizeAdherence(),
      getTodayAdherenceSnapshot(),
    ]);
    setProfileName(profile?.name ?? '');
    setCaregiverMode(profile?.caregiverMode ?? 'patient');
    setTriageHistory(triage ?? []);
    setJournalEntries(journal ?? []);
    setAdherenceSummary(adherenceSummaryResult);
    setAdherenceSnapshot(adherenceSnapshotResult);
  }, []);

  useEffect(() => {
    loadData().catch((error) => {
      console.warn('Unable to load home summary.', error);
      setStatusMessage('Unable to load today’s summary.');
    });
  }, [loadData]);

  const possessive = getCaregiverPossessive(caregiverMode);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Welcome back{profileName ? `, ${profileName}` : ''}</Text>
      <Text style={styles.subtitle}>
        Start today&apos;s check-in to track {possessive} symptoms and get guidance.
      </Text>
      {statusMessage ? <Text style={styles.status}>{statusMessage}</Text> : null}

      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>Today’s medication adherence</Text>
        <Text style={styles.sectionSubtitle}>
          {adherenceSummary.taken} taken · {adherenceSummary.missed} missed
        </Text>
        {adherenceSnapshot.length === 0 ? (
          <Text style={styles.emptyText}>No medications saved yet.</Text>
        ) : (
          adherenceSnapshot.map((item) => (
            <View key={item.medId} style={styles.rowBetween}>
              <Text style={styles.bodyText}>
                {item.name} · {item.dose}
              </Text>
              <Text
                style={[
                  styles.badge,
                  item.status === 'missed' && styles.badgeMissed,
                  item.status === 'taken' && styles.badgeTaken,
                ]}
              >
                {item.status}
              </Text>
            </View>
          ))
        )}
      </View>

      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>Recent journal entries</Text>
        {journalEntries.length === 0 ? (
          <Text style={styles.emptyText}>No journal entries yet.</Text>
        ) : (
          journalEntries.slice(0, 3).map((entry) => (
            <View key={entry.id} style={styles.listItem}>
              <Text style={styles.bodyText}>
                {entry.author === 'caregiver' ? 'Caregiver' : 'Patient'} ·{' '}
                {new Date(entry.createdAt).toLocaleDateString()}
              </Text>
              <Text style={styles.bodyText}>{entry.text}</Text>
              {entry.redFlags?.length ? (
                <Text style={styles.flagText}>Red flags: {entry.redFlags.join(', ')}</Text>
              ) : null}
            </View>
          ))
        )}
      </View>

      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>Triage history</Text>
        {triageHistory.length === 0 ? (
          <Text style={styles.emptyText}>No triage results yet.</Text>
        ) : (
          triageHistory.slice(0, 5).map((entry) => (
            <View key={entry.id} style={styles.listItem}>
              <Text style={styles.bodyText}>
                {entry.level.toUpperCase()} · {new Date(entry.createdAt).toLocaleString()}
              </Text>
              <Text style={styles.bodyText}>
                {entry.rationale?.length ? entry.rationale.join(' ') : 'No rationale saved.'}
              </Text>
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
    fontSize: 16,
    color: colors.textSecondary,
  },
  status: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  sectionCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 10,
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
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  listItem: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 10,
    gap: 6,
  },
  bodyText: {
    fontSize: 14,
    color: colors.textPrimary,
  },
  emptyText: {
    fontSize: 14,
    color: colors.textSecondary,
    fontStyle: 'italic',
  },
  badge: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'capitalize',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 999,
    backgroundColor: '#E5E7EB',
    color: '#111827',
  },
  badgeMissed: {
    backgroundColor: '#FEE2E2',
    color: '#991B1B',
  },
  badgeTaken: {
    backgroundColor: '#DCFCE7',
    color: '#166534',
  },
  flagText: {
    fontSize: 12,
    color: '#991B1B',
  },
});

export default HomeScreen;
