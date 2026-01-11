import React, { useCallback, useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { getTodayAdherenceSnapshot, summarizeAdherence } from '../logic/medTracker';
import { readStore } from '../storage';
import { journalStore, profileStore, triageHistoryStore } from '../storage/stores';
import type { JournalEntry, TriageHistoryEntry } from '../storage/types';
import type { MedAdherenceSnapshotItem } from '../types/meds';

const HomeScreen = () => {
  const [profileName, setProfileName] = useState('');
  const [caregiverMode, setCaregiverMode] = useState<'patient' | 'caregiver'>('patient');
  const [triageHistory, setTriageHistory] = useState<TriageHistoryEntry[]>([]);
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>([]);
  const [adherenceSummary, setAdherenceSummary] = useState({ taken: 0, missed: 0 });
  const [adherenceSnapshot, setAdherenceSnapshot] = useState<MedAdherenceSnapshotItem[]>([]);

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
    setProfileName(profile.name);
    setCaregiverMode(profile.caregiverMode);
    setTriageHistory(triage);
    setJournalEntries(journal);
    setAdherenceSummary(adherenceSummaryResult);
    setAdherenceSnapshot(adherenceSnapshotResult);
  }, []);

  useEffect(() => {
    loadData().catch((error) => {
      console.warn('Unable to load home summary.', error);
    });
  }, [loadData]);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Welcome back{profileName ? `, ${profileName}` : ''}</Text>
      <Text style={styles.subtitle}>
        {caregiverMode === 'caregiver'
          ? 'Caregiver mode is on. Log observations for your loved one.'
          : 'Patient mode is on. Log today’s check-in and updates.'}
      </Text>

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
              <Text style={styles.badge}>{item.status}</Text>
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
    backgroundColor: '#F6F7FB',
  },
  content: {
    padding: 24,
    gap: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#6B7280',
  },
  sectionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
    gap: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  sectionSubtitle: {
    fontSize: 13,
    color: '#6B7280',
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  listItem: {
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingTop: 10,
    gap: 6,
  },
  bodyText: {
    fontSize: 14,
  },
  emptyText: {
    fontSize: 14,
    color: '#6B7280',
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
  flagText: {
    fontSize: 12,
    color: '#991B1B',
  },
});

export default HomeScreen;
