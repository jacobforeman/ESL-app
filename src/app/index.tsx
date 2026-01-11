import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';

import { readStore } from '../storage';
import { journalStore, medAdherenceStore, profileStore, triageHistoryStore } from '../storage/stores';
import type { CaregiverMode, TriageHistoryEntry } from '../storage/types';
import { getCaregiverPossessive } from '../utils/caregiverPhrasing';

type AdherenceSummary = {
  date: string;
  taken: number;
  missed: number;
};

type JournalSummary = {
  count: number;
  redFlags: number;
  lastEntryAt?: string;
};

const HomeScreen = () => {
  const [caregiverMode, setCaregiverMode] = useState<CaregiverMode>('patient');
  const [triageResult, setTriageResult] = useState<TriageHistoryEntry | null>(null);
  const [adherenceSummary, setAdherenceSummary] = useState<AdherenceSummary | null>(null);
  const [journalSummary, setJournalSummary] = useState<JournalSummary | null>(null);

  useEffect(() => {
    const loadSummary = async () => {
      const [{ data: profile }, { data: triage }, { data: adherence }, { data: journal }] =
        await Promise.all([
          readStore(profileStore),
          readStore(triageHistoryStore),
          readStore(medAdherenceStore),
          readStore(journalStore),
        ]);

      setCaregiverMode(profile.caregiverMode);
      setTriageResult(triage[0] ?? null);

      const todayKey = new Date().toISOString().slice(0, 10);
      const todayEntries = adherence.filter((entry) => entry.date === todayKey);
      setAdherenceSummary({
        date: todayKey,
        taken: todayEntries.filter((entry) => entry.taken).length,
        missed: todayEntries.filter((entry) => !entry.taken).length,
      });

      const cutoff = Date.now() - 7 * 24 * 60 * 60 * 1000;
      const recentJournal = journal.filter((entry) => {
        const createdAt = new Date(entry.createdAt).getTime();
        return !Number.isNaN(createdAt) && createdAt >= cutoff;
      });
      const redFlags = recentJournal.reduce((count, entry) => {
        return count + (entry.redFlags?.length ?? 0);
      }, 0);
      const lastEntry = recentJournal[0];
      setJournalSummary({
        count: recentJournal.length,
        redFlags,
        lastEntryAt: lastEntry?.createdAt,
      });
    };

    loadSummary().catch((error) => {
      console.warn('Unable to load summary data for home screen.', error);
    });
  }, []);

  const possessive = getCaregiverPossessive(caregiverMode);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome back</Text>
      <Text style={styles.subtitle}>
        Start today&apos;s check-in to track {possessive} symptoms and get guidance.
      </Text>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Latest triage</Text>
        {triageResult ? (
          <>
            <Text style={styles.cardLevel}>{triageResult.level.toUpperCase()}</Text>
            <Text style={styles.cardBody}>
              {triageResult.rationale?.length
                ? triageResult.rationale.join(' ')
                : 'No triage rationale recorded yet.'}
            </Text>
            <Text style={styles.cardMeta}>
              {new Date(triageResult.createdAt).toLocaleString()}
            </Text>
          </>
        ) : (
          <Text style={styles.cardBody}>No triage results saved yet.</Text>
        )}
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Medication adherence</Text>
        {adherenceSummary ? (
          <Text style={styles.cardBody}>
            {adherenceSummary.taken + adherenceSummary.missed === 0
              ? `No doses recorded for ${adherenceSummary.date}.`
              : `${adherenceSummary.taken} taken, ${adherenceSummary.missed} missed today.`}
          </Text>
        ) : (
          <Text style={styles.cardBody}>No adherence data yet.</Text>
        )}
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Recent journal activity</Text>
        {journalSummary ? (
          <>
            <Text style={styles.cardBody}>
              {journalSummary.count === 0
                ? 'No journal entries in the last week.'
                : `${journalSummary.count} entries in the last week.`}
            </Text>
            {journalSummary.redFlags > 0 ? (
              <Text style={styles.cardBody}>
                {journalSummary.redFlags} red flag note{journalSummary.redFlags > 1 ? 's' : ''} logged.
              </Text>
            ) : null}
            {journalSummary.lastEntryAt ? (
              <Text style={styles.cardMeta}>
                Last entry: {new Date(journalSummary.lastEntryAt).toLocaleDateString()}
              </Text>
            ) : null}
          </>
        ) : (
          <Text style={styles.cardBody}>No journal activity yet.</Text>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
    marginBottom: 16,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 8,
  },
  cardLevel: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 6,
  },
  cardBody: {
    fontSize: 14,
    color: '#374151',
    marginBottom: 6,
  },
  cardMeta: {
    fontSize: 12,
    color: '#6b7280',
  },
});

export default HomeScreen;
